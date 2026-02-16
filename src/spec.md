# Specification

## Summary
**Goal:** Fix registration and session restoration by returning real session data from the backend, validating stored sessions, and ensuring the frontend persists and reacts to auth state correctly.

**Planned changes:**
- Implement backend `register(payload) : async ?Session` to create a new user and return a non-null `Session` on success (token, accountId, expiresAt, optional email), with consistent error/null behavior when registration is not allowed.
- Implement backend `validateSession(token) : async ?Session` to return session data for known, non-expired tokens and null for unknown/expired tokens.
- Ensure the deployed backend candid/actor interface exposes `register` and `validateSession` exactly as the frontend calls them to avoid runtime/type mismatches.
- Update frontend auth flow so successful registration persists session data to localStorage and transitions to authenticated state; null/invalid responses show a clear English error and never leave the UI stuck loading; on reload, validate stored sessions and clear invalid ones.

**User-visible outcome:** Users can sign up successfully and be logged in immediately, and returning users with a valid stored session remain logged in after refresh; invalid/expired sessions prompt re-authentication with clear English errors.
