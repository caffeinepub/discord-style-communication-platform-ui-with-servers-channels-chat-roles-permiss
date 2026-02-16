# Specification

## Summary
**Goal:** Replace Internet Identity (id.ai) authentication with a fully custom, canister-managed account and session system, updating both backend and frontend auth flows accordingly.

**Planned changes:**
- Remove all active login flow usage of Internet Identity (including any `AuthClient.login()`-based flow) and eliminate dependence on `process.env.II_URL` / identityProvider URLs.
- Implement a backend custom account system in the single Motoko actor to support registration, login, logout, session issuance/validation, and secure salted+hashed password storage.
- Refactor backend authorization so user-protected operations formerly gated by Internet Identity-derived principals work via the new session/account context and return Unauthorized when not signed in.
- Replace frontend `useInternetIdentity`-based wiring with a new custom auth provider/hook exposing `register`, `login`, `logout`, and `authStatus`, and update `App.tsx` to use it.
- Update frontend authenticated React Query hooks/mutations usage so authenticated calls include/attach the session token; ensure logged-out states are disabled or show a user-friendly Unauthorized message.
- Keep immutable frontend hook files and UI component paths unmodified by introducing new auth/session code in new files and composing existing UI components.
- Update all auth UI copy to English text describing the new custom account system (no mentions of Internet Identity) and apply a consistent visual theme across auth screens and auth-related states.

**User-visible outcome:** Users can create an account and sign in with app-managed credentials, stay signed in across refresh until logout/expiration, and use previously authenticated features (profile and server actions, role/admin actions where applicable) without Internet Identity.
