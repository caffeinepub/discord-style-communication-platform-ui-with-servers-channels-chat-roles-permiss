# Specification

## Summary
**Goal:** Fix the false-positive “already registered” error during sign up by ensuring registration is blocked only when the caller principal truly has existing stored credentials, and improve the related frontend error message.

**Planned changes:**
- Update backend registration checks to determine “already registered” based on whether the caller principal has stored credentials, not on the caller’s current AccessControl role being non-guest.
- Add and maintain a backend index of credentials keyed by principal to reliably detect prior registrations, keeping it consistent with existing username/email credential indexes.
- If adding the new principal-indexed store changes backend state, implement a conditional upgrade migration that backfills the principal index from existing credentials (and safely no-ops on fresh deployments).
- Update frontend registration error messaging so the “not a guest / already signed in” condition shows accurate, clear instructions and does not imply an account exists unless it truly does.

**User-visible outcome:** Users who have not registered can sign up without seeing an incorrect “already registered” message, and users who are already signed in or already registered see an accurate, actionable registration error message.
