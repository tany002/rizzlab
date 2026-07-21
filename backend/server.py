from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta
import razorpay
import hmac
import hashlib


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET else None

mongo_url = os.environ["MONGO_URL"]

client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=30000,
    tls=True
)

db = client[os.environ["DB_NAME"]]

app = FastAPI(title="RizzLab API")
api_router = APIRouter(prefix="/api")

# ------------------ Models ------------------

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OnboardingPayload(BaseModel):
    payment_id: Optional[str] = None
    about: Dict[str, Any] = {}
    challenges: List[str] = []
    photos: List[str] = []  # data URLs or names
    profile: Dict[str, Any] = {}
    style: Dict[str, Any] = {}
    communication: Dict[str, Any] = {}

class PaymentCreate(BaseModel):
    plan: str  # "ai_review" | "premium"
    amount: int  # in INR

# ------------------ Auth Helpers ------------------

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")


class GoogleAuthPayload(BaseModel):
    credential: str


async def _establish_session(user_id: str, response: Response) -> str:
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return session_token

async def get_current_user(request: Request) -> User:
    # cookie first, then Authorization header
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")

    # normalize datetime
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    return User(**user_doc)


# ------------------ Auth Routes ------------------

@api_router.post("/auth/google")
async def auth_google(payload: GoogleAuthPayload, response: Response):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        logger.warning("[auth] Google token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid Google credential")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account missing email")

    name = idinfo.get("name", "")
    picture = idinfo.get("picture", "")

    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if user_doc:
        user_id = user_doc["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name or email.split("@")[0],
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    await _establish_session(user_id, response)

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    return {"user": User(**user_doc).model_dump(mode="json")}


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.model_dump(mode="json")


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ------------------ Onboarding ------------------

@api_router.post("/onboarding")
async def save_onboarding(payload: OnboardingPayload, request: Request):
    """Save onboarding data. Identified by payment_id (auth-free) or session (legacy)."""
    user = await _get_optional_user(request)
    payment_id = payload.payment_id

    if not user and not payment_id:
        raise HTTPException(status_code=400, detail="payment_id is required")

    doc = payload.model_dump(exclude={"payment_id"})
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()

    if payment_id:
        doc["payment_id"] = payment_id
        # Store onboarding inline on the payment record for easy report generation
        await db.payments.update_one(
            {"payment_id": payment_id, "status": "paid"},
            {"$set": {"onboarding": doc, "onboarding_at": datetime.now(timezone.utc).isoformat()}},
        )
        # Also upsert in the onboarding collection keyed by payment_id
        await db.onboarding.update_one(
            {"payment_id": payment_id}, {"$set": doc}, upsert=True
        )

    if user:
        user_doc = {**doc, "user_id": user.user_id}
        await db.onboarding.update_one(
            {"user_id": user.user_id}, {"$set": user_doc}, upsert=True
        )

    logger.info(
        "[onboarding] Saved (payment_id=%s, user_id=%s)",
        payment_id,
        user.user_id if user else None,
    )
    return {"ok": True}


@api_router.get("/onboarding")
async def get_onboarding(user: User = Depends(get_current_user)):
    doc = await db.onboarding.find_one({"user_id": user.user_id}, {"_id": 0})
    return doc or {}


# ------------------ Payments (Razorpay Standard Checkout) ------------------

class CheckoutOrder(BaseModel):
    plan: str = "ai_review"
    amount: int = 299  # rupees; converted to paise for razorpay
    email: Optional[str] = None


class VerifyPayload(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PayerDetailsPayload(BaseModel):
    payment_id: str
    order_id: str
    name: str
    email: str
    phone: Optional[str] = None


async def _require_paid_payment_for_user(payment_id: str, user: User) -> Dict[str, Any]:
    """Return a paid payment doc owned by the authenticated user."""
    doc = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0, "signature": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment not found")
    if doc.get("status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")
    owner_id = doc.get("user_id")
    if owner_id and owner_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this payment")
    if not owner_id:
        user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
        if not user_doc or user_doc.get("last_payment_id") != payment_id:
            raise HTTPException(status_code=403, detail="Not authorized for this payment")
    return doc


def _fetch_razorpay_payer_contact(payment_id: str) -> Dict[str, Optional[str]]:
    """Read-only Razorpay payment fetch for checkout email/phone (may be empty)."""
    if not razorpay_client:
        return {"email": None, "phone": None}
    try:
        pay = razorpay_client.payment.fetch(payment_id)
        email = (pay.get("email") or "").strip() or None
        phone = (pay.get("contact") or "").strip() or None
        return {"email": email, "phone": phone}
    except Exception as e:
        logger.warning("[payments] Razorpay payment.fetch failed (payment_id=%s): %s", payment_id, e)
        return {"email": None, "phone": None}


async def _get_optional_user(request: Request) -> Optional[User]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def _activate_payment_for_user(user_id: Optional[str], plan: Optional[str], payment_id: Optional[str], source: str) -> None:
    """Idempotently unlock the paid report/subscription flags for a user."""
    if not user_id:
        logger.warning("[payments] No user_id available during activation (source=%s, payment_id=%s)", source, payment_id)
        return

    update = {
        "has_report": True,
        "payment_status": "active",
        "subscription_status": "active",
        "active_plan": plan,
        "last_payment_id": payment_id,
        "last_payment_source": source,
        "last_payment_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.update_one({"user_id": user_id}, {"$set": update})
    logger.info(
        "[payments] User activation write complete (user_id=%s, matched=%s, modified=%s, plan=%s, source=%s)",
        user_id,
        result.matched_count,
        result.modified_count,
        plan,
        source,
    )


@api_router.post("/payments/create-order")
async def payments_create_order(payload: CheckoutOrder, request: Request):
    """Creates a real Razorpay Order. Server-side only. Amount is in RUPEES; converted to paise."""
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")
    if payload.amount not in (299, 4999):
        raise HTTPException(status_code=400, detail="Unsupported amount")

    user = await _get_optional_user(request)
    logger.info(
        "[payments] Create order requested (plan=%s, amount=%s, user_id=%s, email=%s)",
        payload.plan,
        payload.amount,
        user.user_id if user else None,
        payload.email or (user.email if user else None),
    )

    # Idempotency: if user already has an unpaid pending order (created <10 min), return it
    if user:
        existing = await db.payments.find_one(
            {"user_id": user.user_id, "plan": payload.plan, "status": "created"},
            sort=[("created_at", -1)],
        )
        if existing:
            created_at = datetime.fromisoformat(existing["created_at"])
            if (datetime.now(timezone.utc) - created_at) < timedelta(minutes=10):
                logger.info(
                    "[payments] Reusing pending order (order_id=%s, user_id=%s, plan=%s)",
                    existing["order_id"],
                    user.user_id,
                    payload.plan,
                )
                return {
                    "order_id": existing["order_id"],
                    "amount": existing["amount_paise"],
                    "currency": existing["currency"],
                    "key_id": RAZORPAY_KEY_ID,
                    "plan": payload.plan,
                }

    amount_paise = payload.amount * 100
    receipt = f"rcpt_{uuid.uuid4().hex[:20]}"
    rzp_order = None
    try:
        rzp_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1,
            "notes": {"plan": payload.plan, "user_id": user.user_id if user else "guest"},
        })
    except Exception as e:
        logger.exception("Razorpay order creation failed")
        raise HTTPException(status_code=502, detail=f"Failed to create order: {e}")
    if not rzp_order or not rzp_order.get("id"):
        raise HTTPException(status_code=502, detail="Razorpay returned empty order")

    doc = {
        "order_id": rzp_order["id"],
        "receipt": receipt,
        "user_id": user.user_id if user else None,
        "email": payload.email or (user.email if user else None),
        "plan": payload.plan,
        "amount": payload.amount,        # rupees
        "amount_paise": amount_paise,    # paise
        "currency": "INR",
        "status": "created",
        "payment_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payments.insert_one(doc)
    logger.info(
        "[payments] Order created and stored (order_id=%s, receipt=%s, user_id=%s, amount_paise=%s)",
        rzp_order["id"],
        receipt,
        doc["user_id"],
        amount_paise,
    )

    return {
        "order_id": rzp_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
        "plan": payload.plan,
    }


@api_router.post("/payments/verify")
async def payments_verify(payload: VerifyPayload, request: Request):
    """Server-side HMAC-SHA256 signature verification per Razorpay docs.
    signature == HMAC_SHA256(order_id + '|' + payment_id, KEY_SECRET)
    """
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured")

    current_user = await _get_optional_user(request)
    logger.info(
        "[payments] Verify request received (order_id=%s, payment_id=%s, auth_user_id=%s)",
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        current_user.user_id if current_user else None,
    )

    order_doc = await db.payments.find_one({"order_id": payload.razorpay_order_id}, {"_id": 0})
    if not order_doc:
        logger.error("[payments] Verify failed: order not found (order_id=%s)", payload.razorpay_order_id)
        raise HTTPException(status_code=404, detail="Order not found")

    # Idempotency: if already paid, return success (but do not re-fire side effects)
    if order_doc.get("status") == "paid" and order_doc.get("payment_id") == payload.razorpay_payment_id:
        logger.info(
            "[payments] Verify idempotent success (order_id=%s, payment_id=%s)",
            payload.razorpay_order_id,
            payload.razorpay_payment_id,
        )
        return {"ok": True, "status": "paid", "already": True}

    # HMAC verification
    message = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), message, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        logger.warning("[payments] Signature verification failed (order_id=%s, payment_id=%s)", payload.razorpay_order_id, payload.razorpay_payment_id)
        await db.payments.update_one(
            {"order_id": payload.razorpay_order_id},
            {"$set": {"status": "verification_failed", "failed_at": datetime.now(timezone.utc).isoformat()}},
        )
        raise HTTPException(status_code=400, detail="Signature verification failed")
    logger.info("[payments] Signature verification passed (order_id=%s, payment_id=%s)", payload.razorpay_order_id, payload.razorpay_payment_id)

    resolved_user_id = order_doc.get("user_id") or (current_user.user_id if current_user else None)

    payment_update = {
        "status": "paid",
        "payment_id": payload.razorpay_payment_id,
        "signature": payload.razorpay_signature,
        "paid_at": datetime.now(timezone.utc).isoformat(),
        "verified_via": "checkout_callback",
    }
    if resolved_user_id and not order_doc.get("user_id"):
        payment_update["user_id"] = resolved_user_id
    if current_user and not order_doc.get("email"):
        payment_update["email"] = current_user.email

    payment_result = await db.payments.update_one(
        {"order_id": payload.razorpay_order_id},
        {"$set": payment_update},
    )
    logger.info(
        "[payments] Payment write success (order_id=%s, matched=%s, modified=%s, user_id=%s)",
        payload.razorpay_order_id,
        payment_result.matched_count,
        payment_result.modified_count,
        resolved_user_id,
    )

    await _activate_payment_for_user(
        user_id=resolved_user_id,
        plan=order_doc.get("plan"),
        payment_id=payload.razorpay_payment_id,
        source="checkout_callback",
    )

    return {"ok": True, "status": "paid"}


@api_router.post("/payments/failure")
async def payments_failure(request: Request):
    body = await request.json()
    order_id = body.get("order_id")
    reason = body.get("reason", "unknown")
    logger.warning("[payments] Failure callback received (order_id=%s, reason=%s)", order_id, reason)
    if order_id:
        await db.payments.update_one(
            {"order_id": order_id},
            {"$set": {"status": "failed", "failure_reason": reason, "failed_at": datetime.now(timezone.utc).isoformat()}},
        )
    return {"ok": True}


@api_router.get("/payments/payer-prefill")
async def payments_payer_prefill(payment_id: str):
    """Prefill payer details from saved data or Razorpay. No auth required."""
    doc = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0, "signature": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment not found")
    if doc.get("status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")

    name = (doc.get("payer_name") or "").strip() or None
    email = (doc.get("payer_email") or doc.get("email") or "").strip() or None
    phone = (doc.get("payer_phone") or "").strip() or None

    if not email or not phone:
        rzp = _fetch_razorpay_payer_contact(payment_id)
        if not email and rzp.get("email"):
            email = rzp["email"]
        if not phone and rzp.get("phone"):
            phone = rzp["phone"]

    return {
        "payment_id": payment_id,
        "order_id": doc.get("order_id"),
        "name": name,
        "email": email,
        "phone": phone,
    }


@api_router.post("/payments/payer-details")
async def payments_save_payer_details(payload: PayerDetailsPayload):
    """Save payer contact details against a verified paid payment. No auth required."""
    name = payload.name.strip()
    email = payload.email.strip()
    phone = (payload.phone or "").strip() or None
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    doc = await db.payments.find_one({"payment_id": payload.payment_id}, {"_id": 0, "signature": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Payment not found")
    if doc.get("status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")
    if doc.get("order_id") != payload.order_id:
        raise HTTPException(status_code=400, detail="Order ID does not match payment")

    now = datetime.now(timezone.utc).isoformat()
    await db.payments.update_one(
        {"payment_id": payload.payment_id},
        {"$set": {
            "payer_name": name,
            "payer_email": email,
            "payer_phone": phone,
            "payer_details_at": now,
        }},
    )

    logger.info(
        "[payments] Payer details saved (payment_id=%s, order_id=%s)",
        payload.payment_id,
        payload.order_id,
    )
    return {"ok": True}


@api_router.get("/payments/{order_id}")
async def payments_get(order_id: str):
    doc = await db.payments.find_one({"order_id": order_id}, {"_id": 0, "signature": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


# ------------------ Razorpay Webhook ------------------
# Configure in Razorpay Dashboard → Settings → Webhooks:
#   URL:    {PUBLIC_BACKEND_URL}/api/payments/webhook
#   Events: payment.captured, payment.failed, order.paid
#   Secret: any random string → paste into backend/.env as RAZORPAY_WEBHOOK_SECRET

async def _apply_paid(order_id: str, payment_id: str, event: str, source: str):
    """Idempotently mark payment paid + unlock user's report."""
    order_doc = await db.payments.find_one({"order_id": order_id}, {"_id": 0})
    if not order_doc:
        logger.warning(f"[webhook] Unknown order {order_id}; ignoring")
        return
    if order_doc.get("status") == "paid":
        logger.info(f"[webhook] Order {order_id} already paid; skipping side-effects (source={source})")
        return
    await db.payments.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": "paid",
            "payment_id": payment_id,
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "paid_via": source,
            "last_event": event,
        }},
    )
    logger.info("[webhook] Payment DB write success (order_id=%s, payment_id=%s, event=%s)", order_id, payment_id, event)
    await _activate_payment_for_user(
        user_id=order_doc.get("user_id"),
        plan=order_doc.get("plan"),
        payment_id=payment_id,
        source=source,
    )
    logger.info(f"[webhook] Order {order_id} marked paid via {source} ({event})")


# ---- Webhook event handlers (one per event; each returns None) ----

def _extract_payment_entity(entity: Dict[str, Any]) -> Dict[str, Any]:
    return (entity.get("payment", {}) or {}).get("entity", {}) or {}


def _extract_order_entity(entity: Dict[str, Any]) -> Dict[str, Any]:
    return (entity.get("order", {}) or {}).get("entity", {}) or {}


async def _handle_payment_captured(entity: Dict[str, Any], event: str) -> None:
    pay = _extract_payment_entity(entity)
    order_id = pay.get("order_id")
    payment_id = pay.get("id")
    if order_id and payment_id:
        await _apply_paid(order_id, payment_id, event, source="webhook")


async def _handle_order_paid(entity: Dict[str, Any], event: str) -> None:
    order_id = _extract_order_entity(entity).get("id")
    payment_id = _extract_payment_entity(entity).get("id")
    if order_id and payment_id:
        await _apply_paid(order_id, payment_id, event, source="webhook")


async def _handle_payment_failed(entity: Dict[str, Any], event: str) -> None:
    pay = _extract_payment_entity(entity)
    order_id = pay.get("order_id")
    if not order_id:
        return
    await db.payments.update_one(
        {"order_id": order_id, "status": {"$ne": "paid"}},
        {"$set": {
            "status": "failed",
            "failure_reason": pay.get("error_description") or pay.get("error_code") or "payment.failed",
            "failed_at": datetime.now(timezone.utc).isoformat(),
            "last_event": event,
        }},
    )


WEBHOOK_HANDLERS = {
    "payment.captured":    _handle_payment_captured,
    "payment.authorized":  _handle_payment_captured,
    "order.paid":          _handle_order_paid,
    "payment.failed":      _handle_payment_failed,
}


def _verify_webhook_signature(raw: bytes, signature: str) -> bool:
    if not RAZORPAY_WEBHOOK_SECRET:
        return False
    expected = hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _record_webhook_event(payload: Dict[str, Any]) -> str:
    event_id = payload.get("id") or f"evt_{uuid.uuid4().hex[:12]}"
    await db.webhook_events.update_one(
        {"event_id": event_id},
        {"$setOnInsert": {
            "event_id": event_id,
            "event": payload.get("event", ""),
            "received_at": datetime.now(timezone.utc).isoformat(),
            "raw": payload,
        }},
        upsert=True,
    )
    return event_id


@api_router.post("/payments/webhook")
async def payments_webhook(request: Request):
    """Razorpay server-to-server callback. Verifies HMAC-SHA256 over the raw body."""
    raw = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not RAZORPAY_WEBHOOK_SECRET:
        logger.error("[webhook] RAZORPAY_WEBHOOK_SECRET not configured")
        raise HTTPException(status_code=503, detail="Webhook not configured")

    if not _verify_webhook_signature(raw, signature):
        logger.warning("[webhook] Invalid signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    import json as _json
    try:
        payload = _json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event = payload.get("event", "")
    entity = payload.get("payload", {}) or {}

    await _record_webhook_event(payload)

    handler = WEBHOOK_HANDLERS.get(event)
    if handler:
        try:
            await handler(entity, event)
        except Exception:
            # Never raise back to Razorpay — we already recorded the raw event
            logger.exception(f"[webhook] Handler failure for event {event}")

    return {"ok": True, "event": event}


# ------------------ Report (Mock AI) ------------------

def build_mock_report(name: str = "there") -> Dict[str, Any]:
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "greeting": name,
        "score": 82,
        "potential": 95,
        "sub_scores": [
            {"label": "Photo Quality", "value": 78, "trend": "+6"},
            {"label": "Bio", "value": 71, "trend": "+9"},
            {"label": "Style", "value": 84, "trend": "+3"},
            {"label": "Communication", "value": 88, "trend": "+2"},
            {"label": "Confidence Signal", "value": 80, "trend": "+5"},
        ],
        "photos": [
            {"id": "p1", "url": "https://images.unsplash.com/photo-1616434116710-c45ce99c1a77?crop=entropy&cs=srgb&fm=jpg&w=600&q=80", "score": 91, "verdict": "keep", "note": "Strong first photo. Sharp jawline, clear eyes, natural smile. Use as lead."},
            {"id": "p2", "url": "https://images.unsplash.com/photo-1557862921-37829c790f19?crop=entropy&cs=srgb&fm=jpg&w=600&q=80", "score": 74, "verdict": "keep", "note": "Good body language. Consider a warmer color grade and less shadow on the left side."},
            {"id": "p3", "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", "score": 62, "verdict": "replace", "note": "Sunglasses hide the eyes. Replace with a candid outdoor photo showing your face."},
            {"id": "p4", "url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80", "score": 58, "verdict": "replace", "note": "Group photo — viewer can't tell which one is you. Move to end of profile or remove."},
            {"id": "p5", "url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80", "score": 81, "verdict": "keep", "note": "Great activity shot — shows an interest. Crop slightly tighter."},
            {"id": "p6", "url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80", "score": 69, "verdict": "keep", "note": "Solid casual look. Try a version with better lighting for higher trust signal."},
        ],
        "best_first_photo_id": "p1",
        "bio": {
            "original": "Software engineer. Love travel and food. DM me if interested. Bangalore.",
            "improved": "Engineer at a Bangalore fintech, but weekends are for road trips and hunting the city's best filter coffee. Currently learning to make ramen from scratch and losing to my sister at chess. If you have a favourite hidden bakery — I want the address.",
            "explanation": "The rewrite adds specificity (fintech, Bangalore, coffee, ramen, chess), invites a reply (favourite bakery), and shows personality. Specifics outperform adjectives by ~3x in reply rate.",
        },
        "style": {
            "current_impression": "Neat but forgettable — safe colors, boxy fits. Photos feel closer to office wear than 'weekend Saturday'.",
            "clothing": [
                "1 well-fitted plain white tee (Uniqlo Supima)",
                "Slim (not skinny) mid-wash denim",
                "Dark olive or ecru overshirt for layering",
                "One neutral knit polo — replaces the printed shirts",
            ],
            "colors": ["Ecru", "Charcoal", "Olive", "Navy", "Rust (accent)"],
            "accessories": ["Simple leather strap watch under ₹6k", "Minimalist wallet", "One subtle ring — no more than one"],
            "hair": "Mid-taper fade with slight length on top. Ask barber for '2 on sides, texture on top'.",
            "beard": "Neat stubble at 5mm. Sharp cheek line, natural neckline (not too high).",
            "shoes": ["White low-top leather sneakers", "Suede chukka in tobacco", "Avoid glossy formal shoes in dating photos"],
            "budget_plan": "₹8,000 gets you: 2 tees, 1 overshirt, 1 pair of denim, and one pair of sneakers. Prioritize fit over brand.",
        },
        "communication": {
            "openers": [
                "Your bio mentioned {interest} — okay you have to settle a debate for me: {playful specific question}",
                "Not gonna do the 'hey how are you' thing. Instead: {observation from her profile} — story?",
                "This is either going to be a great conversation or an amazing story. Pick a number 1-3.",
            ],
            "questions": [
                "What's a small thing that made your week?",
                "If we grabbed one drink and it went well, what's the ideal 'unexpected' second stop?",
                "Weirdest hill you'll die on?",
            ],
            "topics": ["Micro-adventures", "Food memories", "Skills you're building", "Songs on repeat", "Family stories (light)"],
            "mistakes_to_avoid": [
                "Compliments about looks in the first 3 messages",
                "One-word replies — always add a hook",
                "Interview mode: 3 questions in a row without sharing anything",
                "Long paragraphs before you've had a real exchange",
                "Asking to move to WhatsApp too fast",
            ],
        },
        "date_plan": {
            "what_to_wear": "Ecru tee, olive overshirt, mid-wash denim, white sneakers. Watch on. Shower + fresh shave 2 hours before, not right before.",
            "where_to_go": [
                "Specialty coffee bar — lets you talk without shouting",
                "A tiny neighbourhood cocktail place — not a loud club",
                "A short walk after — bookstore or art alley",
            ],
            "conversation_flow": [
                "First 10 min: light, playful, easy topics",
                "Middle 30 min: stories, why you moved here, family (light)",
                "Last 15 min: values through stories — never lectures",
            ],
            "green_flags": ["She asks follow-up questions", "Uses your name", "Suggests the next spot", "Laughs at your bad jokes"],
            "red_flags": ["Phone face-up the whole time", "Talks only about herself/ex", "Rude to staff", "Late without a message"],
            "how_to_end": "Walk her to her cab. 'This was fun — I'd like to do this again on Saturday.' Direct, warm, no ambiguity. Text 24 hours later, not that night.",
        },
        "roadmap": [
            {"week": 1, "title": "Photos", "tasks": ["Book a 30-min outdoor shoot with a friend + phone", "Delete the 2 lowest-scoring photos", "Pick a new lead photo"]},
            {"week": 2, "title": "Bio & Profile", "tasks": ["Deploy the improved bio", "Add 2 specific interests", "Answer 3 prompts with specifics"]},
            {"week": 3, "title": "Style", "tasks": ["Wardrobe declutter", "Buy the 4-item starter kit", "Get the haircut + beard trim"]},
            {"week": 4, "title": "Conversations", "tasks": ["Send 5 openers using the framework", "Track reply rate", "Ask 3 women out on real dates"]},
        ],
    }


@api_router.get("/report")
async def get_report(request: Request, payment_id: Optional[str] = None):
    """
    Fetch a report.
    - If payment_id is provided: auth-free, validated against payments collection.
      One payment = one report. Subsequent calls return the stored report (no regeneration).
    - If no payment_id: requires session auth (legacy path for existing users).
    """
    if payment_id:
        payment_doc = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0, "signature": 0})
        if not payment_doc:
            logger.warning("[report] payment_id not found: %s", payment_id)
            raise HTTPException(status_code=404, detail="Payment not found")
        if payment_doc.get("status") != "paid":
            logger.warning("[report] payment not paid (payment_id=%s, status=%s)", payment_id, payment_doc.get("status"))
            raise HTTPException(status_code=403, detail="Payment not completed")

        # Duplicate prevention: if already generated, return stored report
        if payment_doc.get("report_generated"):
            logger.info("[report] Returning cached report (payment_id=%s)", payment_id)
            report = payment_doc.get("report_data") or build_mock_report(
                name=(payment_doc.get("payer_name") or "there").split(" ")[0]
            )
            return {"unlocked": True, "report": report}

        # First generation: build, store, mark used
        name = (payment_doc.get("payer_name") or "there").split(" ")[0]
        report = build_mock_report(name=name)
        await db.payments.update_one(
            {"payment_id": payment_id, "report_generated": {"$ne": True}},
            {"$set": {
                "report_generated": True,
                "report_generated_at": datetime.now(timezone.utc).isoformat(),
                "report_data": report,
            }},
        )
        logger.info("[report] Report generated and stored (payment_id=%s, name=%s)", payment_id, name)
        return {"unlocked": True, "report": report}

    # Legacy auth-based path
    user = await get_current_user(request)
    u = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    unlocked = bool(u and u.get("has_report"))
    report = build_mock_report(name=user.name.split(" ")[0] if user.name else "there")
    return {"unlocked": unlocked, "report": report}


@api_router.get("/sample-report")
async def sample_report():
    return {"unlocked": True, "report": build_mock_report(name="Rahul")}


@api_router.get("/")
async def root():
    return {"message": "RizzLab API", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
