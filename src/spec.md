# Specification

## Summary
**Goal:** Fix registration and login so accounts persist correctly, sessions validate reliably, and the UI shows specific registration errors instead of a generic failure.

**Planned changes:**
- Fix backend persistence during register/login/saveCallerUserProfile so all state mutations (credentials, session tokens, initial user profile) are actually stored in canister state and survive development upgrades.
- Normalize (trim + lowercase) username/email/loginIdentifier consistently for storage, lookups, and uniqueness checks; ensure register rejects case/whitespace variants and login accepts them.
- Correct backend session ownership/bookkeeping so validateSession accepts the token returned by login for the same caller until expiration and rejects expired or non-owned tokens.
- Improve frontend registration error mapping to display allowlisted, specific messages for already-registered, username/email taken, and connectivity/unavailable backend cases.

**User-visible outcome:** Users can successfully sign up and immediately log in, remain authenticated after refresh with a valid session, and see clear, specific error messages when registration cannot proceed.
