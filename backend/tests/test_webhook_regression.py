"""
Regression tests for RizzLab Razorpay integration (iteration 5).
Focus: refactored webhook dispatch pattern must preserve prior behavior.
Covers:
  - HMAC signature verification (webhook + /payments/verify)
  - Dispatch routing for payment.captured / payment.authorized / order.paid / payment.failed
  - Unknown events → 200 OK + recorded in webhook_events
  - Idempotency (replaying same event doesn't double-process)
  - Order creation returns live Razorpay order (order_id starts with 'order_')
"""
import os
import json
import hmac
import hashlib
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://match-prep-5.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Read secrets directly from backend/.env (matches process env)
def _load_env():
    env = {}
    with open("/app/backend/.env") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    return env

_ENV = _load_env()
WEBHOOK_SECRET = _ENV.get("RAZORPAY_WEBHOOK_SECRET", "")
KEY_SECRET = _ENV.get("RAZORPAY_KEY_SECRET", "")
KEY_ID = _ENV.get("RAZORPAY_KEY_ID", "")
MONGO_URL = _ENV.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = _ENV.get("DB_NAME", "test_database")

mongo = MongoClient(MONGO_URL)
db = mongo[DB_NAME]


def _sign(raw: bytes) -> str:
    return hmac.new(WEBHOOK_SECRET.encode(), raw, hashlib.sha256).hexdigest()


def _payment_captured_payload(order_id, payment_id, event="payment.captured", event_id=None):
    return {
        "id": event_id or f"evt_{uuid.uuid4().hex[:12]}",
        "event": event,
        "payload": {
            "payment": {"entity": {"id": payment_id, "order_id": order_id, "amount": 29900, "status": "captured"}}
        },
    }


def _order_paid_payload(order_id, payment_id, event_id=None):
    return {
        "id": event_id or f"evt_{uuid.uuid4().hex[:12]}",
        "event": "order.paid",
        "payload": {
            "order": {"entity": {"id": order_id, "amount": 29900, "status": "paid"}},
            "payment": {"entity": {"id": payment_id, "order_id": order_id, "status": "captured"}},
        },
    }


def _payment_failed_payload(order_id, payment_id, reason="insufficient_funds", event_id=None):
    return {
        "id": event_id or f"evt_{uuid.uuid4().hex[:12]}",
        "event": "payment.failed",
        "payload": {
            "payment": {"entity": {"id": payment_id, "order_id": order_id, "status": "failed",
                                    "error_code": "BAD_REQUEST", "error_description": reason}}
        },
    }


def _post_webhook(payload, signature=None):
    raw = json.dumps(payload).encode("utf-8")
    sig = signature if signature is not None else _sign(raw)
    return requests.post(f"{API}/payments/webhook", data=raw,
                         headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
                         timeout=15)


def _seed_order(order_id, status="created", plan="ai_review"):
    from datetime import datetime, timezone
    doc = {
        "order_id": order_id,
        "receipt": f"rcpt_{uuid.uuid4().hex[:10]}",
        "user_id": None,
        "email": "TEST_wh@example.com",
        "plan": plan,
        "amount": 299,
        "amount_paise": 29900,
        "currency": "INR",
        "status": status,
        "payment_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.payments.insert_one(doc)
    return doc


# No cross-test cleanup — xdist runs tests in parallel and a shared-email delete
# would wipe another worker's just-created order. Records use TEST_* markers and
# unique order_id/event_id per test so leftover data is easily filtered later.
@pytest.fixture(autouse=True)
def _cleanup():
    yield


# ---------- Signature verification ----------

class TestWebhookSignature:
    def test_wrong_signature_rejected(self):
        payload = _payment_captured_payload("order_wrong_sig", "pay_x")
        r = _post_webhook(payload, signature="deadbeef")
        assert r.status_code == 400
        assert "signature" in r.text.lower()

    def test_missing_signature_rejected(self):
        payload = _payment_captured_payload("order_no_sig", "pay_x")
        r = _post_webhook(payload, signature="")
        assert r.status_code == 400

    def test_correct_signature_accepted(self):
        order_id = f"order_TESTsig_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        payload = _payment_captured_payload(order_id, "pay_sig_ok",
                                            event_id=f"evt_test_{uuid.uuid4().hex[:8]}")
        r = _post_webhook(payload)
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- Dispatch routing per event ----------

class TestWebhookDispatch:
    def test_payment_captured_marks_paid(self):
        order_id = f"order_TESTcap_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        payload = _payment_captured_payload(order_id, "pay_cap_1",
                                            event_id=f"evt_test_{uuid.uuid4().hex[:8]}")
        r = _post_webhook(payload)
        assert r.status_code == 200
        doc = db.payments.find_one({"order_id": order_id})
        assert doc["status"] == "paid"
        assert doc["payment_id"] == "pay_cap_1"
        assert doc.get("last_event") == "payment.captured"

    def test_payment_authorized_marks_paid(self):
        order_id = f"order_TESTauth_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        payload = _payment_captured_payload(order_id, "pay_auth_1", event="payment.authorized",
                                            event_id=f"evt_test_{uuid.uuid4().hex[:8]}")
        r = _post_webhook(payload)
        assert r.status_code == 200
        doc = db.payments.find_one({"order_id": order_id})
        assert doc["status"] == "paid"
        assert doc["payment_id"] == "pay_auth_1"

    def test_order_paid_marks_paid(self):
        order_id = f"order_TESTop_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        payload = _order_paid_payload(order_id, "pay_op_1",
                                      event_id=f"evt_test_{uuid.uuid4().hex[:8]}")
        r = _post_webhook(payload)
        assert r.status_code == 200
        doc = db.payments.find_one({"order_id": order_id})
        assert doc["status"] == "paid"
        assert doc["payment_id"] == "pay_op_1"

    def test_payment_failed_marks_failed(self):
        order_id = f"order_TESTfail_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        payload = _payment_failed_payload(order_id, "pay_fail_1", reason="card_declined",
                                          event_id=f"evt_test_{uuid.uuid4().hex[:8]}")
        r = _post_webhook(payload)
        assert r.status_code == 200
        doc = db.payments.find_one({"order_id": order_id})
        assert doc["status"] == "failed"
        assert doc.get("failure_reason") == "card_declined"

    def test_unknown_event_recorded_but_no_error(self):
        eid = f"evt_test_{uuid.uuid4().hex[:8]}"
        payload = {
            "id": eid,
            "event": "payment.dispute.created",
            "payload": {"dispute": {"entity": {"id": "disp_1"}}},
        }
        r = _post_webhook(payload)
        assert r.status_code == 200
        assert r.json().get("event") == "payment.dispute.created"
        rec = db.webhook_events.find_one({"event_id": eid})
        assert rec is not None
        assert rec["event"] == "payment.dispute.created"


# ---------- Idempotency ----------

class TestWebhookIdempotency:
    def test_replay_same_event_does_not_double_process(self):
        order_id = f"order_TESTidem_{uuid.uuid4().hex[:8]}"
        _seed_order(order_id)
        eid = f"evt_test_{uuid.uuid4().hex[:8]}"
        payload = _payment_captured_payload(order_id, "pay_idem_1", event_id=eid)

        r1 = _post_webhook(payload)
        assert r1.status_code == 200
        doc1 = db.payments.find_one({"order_id": order_id})
        assert doc1["status"] == "paid"
        assert doc1["payment_id"] == "pay_idem_1"
        first_paid_at = doc1.get("paid_at")

        # Replay identical payload
        r2 = _post_webhook(payload)
        assert r2.status_code == 200
        doc2 = db.payments.find_one({"order_id": order_id})
        assert doc2["status"] == "paid"
        assert doc2["payment_id"] == "pay_idem_1"
        # paid_at should not be overwritten by the second processing (short-circuit in _apply_paid)
        assert doc2.get("paid_at") == first_paid_at

        # webhook_events must have exactly ONE record for that event_id
        count = db.webhook_events.count_documents({"event_id": eid})
        assert count == 1


# ---------- /payments/verify HMAC ----------

class TestPaymentsVerify:
    def _create_real_order(self):
        r = requests.post(f"{API}/payments/create-order",
                          json={"plan": "ai_review", "amount": 299, "email": "TEST_wh@example.com"},
                          timeout=20)
        assert r.status_code == 200, r.text
        return r.json()

    def test_verify_wrong_signature_returns_400(self):
        order = self._create_real_order()
        r = requests.post(f"{API}/payments/verify",
                          json={"razorpay_order_id": order["order_id"],
                                "razorpay_payment_id": "pay_fake_123",
                                "razorpay_signature": "deadbeef"},
                          timeout=15)
        assert r.status_code == 400

    def test_verify_correct_signature_returns_ok(self):
        order = self._create_real_order()
        payment_id = "pay_TEST_verified_1"
        msg = f"{order['order_id']}|{payment_id}".encode()
        sig = hmac.new(KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
        r = requests.post(f"{API}/payments/verify",
                          json={"razorpay_order_id": order["order_id"],
                                "razorpay_payment_id": payment_id,
                                "razorpay_signature": sig},
                          timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data.get("status") == "paid"


# ---------- Create order live Razorpay ----------

class TestCreateOrder:
    def test_create_order_returns_live_order(self):
        r = requests.post(f"{API}/payments/create-order",
                          json={"plan": "ai_review", "amount": 299, "email": "TEST_wh@example.com"},
                          timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["order_id"].startswith("order_"), data
        assert data["amount"] == 29900
        assert data["currency"] == "INR"
        assert data["key_id"].startswith("rzp_live_"), data["key_id"]
        assert data["plan"] == "ai_review"

    def test_create_order_rejects_invalid_amount(self):
        r = requests.post(f"{API}/payments/create-order",
                          json={"plan": "ai_review", "amount": 100, "email": "TEST_wh@example.com"},
                          timeout=15)
        assert r.status_code == 400
