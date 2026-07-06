# Auth-Gated App Testing Playbook (DateCoach)

Uses Emergent-managed Google Auth. Cookie name: `session_token`. Auth endpoints under `/api/auth/*`.

## Step 1: Create Test User & Session in MongoDB
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  has_report: true,
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend APIs
```
curl -X GET "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BASE/api/report" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BASE/api/sample-report"
curl -X POST "$BASE/api/onboarding" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"about":{"age":28},"challenges":["Bad photos"],"photos":[],"profile":{},"style":{},"communication":{}}'
```

## Step 3: Browser Testing (set cookie)
```
await page.context.add_cookies([{
  "name": "session_token", "value": "TOKEN",
  "domain": "match-prep-5.preview.emergentagent.com",
  "path": "/", "httpOnly": True, "secure": True, "sameSite": "None"
}]);
await page.goto("https://match-prep-5.preview.emergentagent.com/dashboard");
```

## Success Indicators
- `/api/auth/me` returns user JSON
- `/dashboard` loads without redirect
- `/api/report` returns `{unlocked:true, report:{...}}`
