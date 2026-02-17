# Specification

## Summary
**Goal:** Prevent the app from crashing or surfacing a raw “Unauthorized” trap when an already-registered user attempts to register again, and show a friendly message instead.

**Planned changes:**
- Update the backend `register` method to stop trapping with `Unauthorized: Already registered users cannot register again` for non-guest callers, and return a normal result (e.g., `null` or a valid `Session`) for this scenario.
- Update frontend Sign Up error handling to detect this re-registration case (via a `null` return or the specific error text) and display the friendly message `This account is already registered. Please sign in instead.` instead of any raw backend trap text.

**User-visible outcome:** If a user who is already registered tries to sign up again, the app shows a normal “already registered” message and does not display the backend trap text or crash.
