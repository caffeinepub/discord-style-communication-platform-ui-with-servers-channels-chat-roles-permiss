# Specification

## Summary
**Goal:** Fix the backend connection/auth verification error by adding a required `register` backend method and wiring the signup flow to use it.

**Planned changes:**
- Add a public shared backend actor method named exactly `register` that is exported in the canister interface.
- Implement backend registration to persist new users in the existing in-memory stores and return a structured success/error result (already registered, username taken, email taken).
- Update the frontend signup/auth flow to call the backend `register` method (instead of simulating registration) and display backend errors as clear English messages.
- Update frontend TypeScript actor typings/interfaces so `register` exists at compile-time and `useSafeActor` runtime validation recognizes it.

**User-visible outcome:** Users can sign up via the real backend `register` call; conflicts like “username/email already taken” show as clear English errors, and the app no longer shows the missing `register` backend connection error on load.
