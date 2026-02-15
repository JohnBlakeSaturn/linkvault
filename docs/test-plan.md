# LinkVault Test Plan

## Automated API Tests (Backend)

Prerequisite:
- Install test deps inside backend

Commands:
```bash
npm --prefix backend install
npm --prefix backend run test
```

Test file:
- `backend/tests/api.test.js`

Coverage:
- Guest can create default text links
- Guest cannot upload files
- Guest cannot use advanced options
- Registration sanitizes inputs
- Authenticated users can create file links with advanced options

## Manual End-to-End Tests

### 1. Smooth Scroll and Section Navigation
1. Open `http://localhost:5173`
2. Click `Features`, `Create`, `Stories` in navbar
3. Click `Start sharing` and `Explore features` in hero

Expected:
- Smooth GSAP scrolling
- Correct landing position with navbar offset (no overlap)

### 2. Guest Mode Restrictions
1. Stay logged out
2. In home form, submit text with default values
3. Try switching to file mode
4. Try editing expiry/password/max views/one-time options

Expected:
- Text default submission succeeds
- File/custom options trigger auth modal

### 3. Auth Flows
1. Go to `/auth`
2. Register with name/email/password
3. Observe password strength meter
4. Try invalid email or short password

Expected:
- Validation errors shown
- Successful registration logs in user
- Sanitized fields accepted

### 4. Authenticated Advanced Share
1. While signed in, create file share with:
   - custom expiry
   - password
   - max views or one-time mode
2. Open generated link

Expected:
- Link created successfully
- Password required when set
- File download works

### 5. Text Link Retrieval
1. Create text share
2. Open link in new tab
3. Click copy text

Expected:
- Text displayed
- Clipboard copy works

### 6. Dashboard Management
1. Sign in
2. Visit `/dashboard`
3. Delete one owned item

Expected:
- Item removed from list
- Deleted link no longer accessible

### 7. Theme Verification
1. Switch among `light`, `dark`, `pookie`

Expected:
- Light: bluish-white palette
- Dark: purplish-black palette
- Pookie: heart accents visible/animated

### 8. API Status and Security Responses
Use curl:
```bash
curl -i http://localhost:5000/api/health
curl -i http://localhost:5000/api/links/not-a-real-token
```

Expected:
- Health returns `200`
- Invalid token returns `403`

### 9. Expiry Handling
1. Create link with near-term expiry (signed in)
2. Wait for expiry
3. Try opening link again

Expected:
- Expired access denied with graceful error
