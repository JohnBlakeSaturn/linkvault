# LinkVault

LinkVault is a secure link-sharing web app where a user can upload either text or a file and get a unique URL to share.  
The person with the exact link can open the content, and access rules (expiry, password, one-time, max views) are enforced on the backend.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + GSAP
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: Passport local strategy + session-based auth

## Project Structure

```text
linkvault/
  frontend/   # React app
  backend/    # Express API + Mongo models + auth
  docs/       # data flow and notes
```

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd linkvault
npm --prefix frontend install
npm --prefix backend install
```

### 2. Backend environment

Create `backend/.env` using `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/linkvault
SESSION_SECRET=replace-with-strong-secret
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=25
CLEANUP_CRON=*/2 * * * *
ALLOWED_MIME_TYPES=
```

Notes:
- Leave `ALLOWED_MIME_TYPES` empty to use the built-in allow-list.
- If you set it, use comma-separated MIME types, for example:
  `image/png,image/jpeg,application/pdf,text/plain`

### 3. Run the app

In two terminals:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

Open:
- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

## API Overview

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register`
  - Body: `{ name, email, password }`
  - Creates account and logs user in.
- `POST /auth/login`
  - Body: `{ email, password }`
  - Logs user in.
- `POST /auth/logout`
  - Logs user out and clears session.
- `GET /auth/me`
  - Returns current authenticated user (or `null`).

### Links

- `POST /links` (multipart/form-data)
  - Accepts either `text` or `file` (not both).
  - Optional fields: `expiresAt`, `password`, `oneTimeView`, `maxViews`.
  - Guest users: default text-only share.
  - Auth users: file + advanced controls.

- `GET /links/:token`
  - Resolves link metadata/content.
  - If password protected, send `x-link-password` header.

- `GET /links/:token/download`
  - Downloads file for file-type links.
  - Supports password via `x-link-password`.

- `GET /links/mine` (auth required)
  - List links created by logged-in user.

- `DELETE /links/mine/:id` (auth required)
  - Manual delete for own links.

## Implemented Features

- Core sharing flow: text/file upload (one per share), secure token-based link generation, share URL shown on frontend, link-only access, invalid-token handling (`403`), text view+copy, and file download.
- Expiry behavior: default 10-minute expiry, optional custom expiry, graceful expired-link handling (`410`), and scheduled cleanup of expired data.
- Security and validation: frontend+backend validation, rate limiting, `helmet`, CORS restriction, sanitization (`express-mongo-sanitize` + `hpp`), and strict file size/type checks (MIME + extension allow-list).
- Optional/bonus features implemented: password-protected links, one-time links, max-view limits, manual delete from dashboard, authentication/user accounts with Passport local sessions, and user-based access gating for advanced options.
- UI/UX extras: responsive modern UI, GSAP animations and smooth section scrolling, hero/features/testimonials/footer sections, toast feedback, auth modal for guest-locked features, multi-theme support (`light`, `dark`, `pookie`, `old-times`, `space`), custom logo loader, and favicon.


## Design Decisions

- **Token-based access only**  
  There is no public listing endpoint. Retrieval is only through an unguessable token URL.

- **Security middleware by default**  
  Added `helmet`, CORS restrictions, rate limiting, sanitization (`express-mongo-sanitize`), and `hpp`.

- **Session auth (Passport local)**  
  Chosen to keep login flow simple and avoid JWT storage complexity for this project size.

- **Guest vs authenticated capability split**  
  Guests can do quick text share with safe defaults.  
  Advanced options and file uploads are intentionally restricted to authenticated users.

- **Expiry cleanup strategy**  
  Expiry is enforced during access checks and also cleaned in the background using cron (`node-cron`) to remove expired docs/files.

- **Frontend UX focus**  
  Clean, themeable UI with light/dark/pookie/old-times/space themes, smooth section scroll, subtle GSAP animation, and toast feedback.

## Assumptions and Limitations

- File storage is local disk (`backend/uploads`) for simplicity.  
  For production, object storage (S3/Firebase/etc.) is a better choice.

- File type validation uses MIME + extension allow-list.
  Unknown/unlisted types are rejected with `415 Unsupported file type`.

- Link access currently requires possession of the exact token URL; no extra IP/device binding is used.

- Automated tests cover main API flows but not every edge case yet.

- The app is designed for local development and demonstration. Production hardening would include stricter CORS/domain config, stronger operational monitoring, and secure deployment setup.

## Testing

Backend tests:

```bash
npm --prefix backend run test
```

Frontend production build check:

```bash
npm --prefix frontend run build
```

Additional manual scenarios are documented in `docs/test-plan.md`.

## Data Flow Diagram

See:
- `docs/data-flow.mmd`
