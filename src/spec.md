# Specification

## Summary
**Goal:** Make sign-in work end-to-end by adding backend login support, persisting registration credentials for later login, and enabling the frontend sign-in flow with session restore on refresh.

**Planned changes:**
- Add a backend `login(identifier, password)` endpoint in `backend/main.mo` that authenticates by email or username and returns an optional `Session`, storing/refeshing the session token with a future `expiresAt`.
- Update backend registration in `backend/main.mo` to persist username/email and password association needed for subsequent login while preserving current duplicate-registration behavior and role assignment.
- Wire `frontend/src/auth/AuthProvider.tsx` login to call `actor.login`, persist the session via `frontend/src/auth/sessionStorage.ts`, and correctly set authenticated/unauthenticated states with clear English errors.
- Enable the Sign In UI in `frontend/src/pages/LoginScreen.tsx` so the form is usable and successful login transitions into the authenticated app shell.
- Ensure session restore works after refresh by validating stored sessions via `validateSession`, authenticating when valid, and clearing/handling expired sessions with an English message.

**User-visible outcome:** Users can sign up, then sign in using email or username and password, stay signed in across page refresh while the session is valid, and see clear English errors for invalid/expired sessions.
