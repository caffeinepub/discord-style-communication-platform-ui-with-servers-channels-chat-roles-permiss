# Specification

## Summary
**Goal:** Implement a working registration flow and session validation by adding backend auth endpoints and wiring the frontend auth provider to use them.

**Planned changes:**
- Add a backend registration method that accepts (username, email, password), creates and persists a new account, and returns a session object with token, accountId, and expiresAt.
- Ensure backend registration fails with a clear error when the requested username is already taken.
- Update the frontend registration flow to call the backend registration endpoint, remove the placeholder thrown error string, save the returned session via the existing sessionStorage helper, and set authStatus to authenticated on success.
- Add a backend validateSession(token) endpoint and update frontend session-restore logic to validate stored sessions with the backend, clearing local session and setting unauthenticated when invalid/expired.

**User-visible outcome:** Users can create an account without seeing the “registration endpoint not implemented” error, are logged in immediately after successful sign-up, and on reload only remain signed in if their stored session is validated by the backend.
