# Specification

## Summary
**Goal:** Allow admins to fully reset (“clean”) the local replica/canister state back to an initial empty state and verify the reset quickly.

**Planned changes:**
- Add an admin-only backend reset method that wipes all stored application data and resets all ID counters to their initial values.
- Add an admin-only backend verification endpoint that returns a small set of counts/flags (e.g., servers, profiles, sessions, audit log entries) to confirm the state is empty after reset.
- Add an admin-only control in frontend user settings to trigger the reset with a strong confirmation step (explicit confirmation text), plus clear English success/error feedback and cache/query invalidation so the UI reflects the clean state.

**User-visible outcome:** Admin users can initiate a “clean replica” reset from settings (with strong confirmation) and see confirmation/verification that the app has returned to an empty initial state; non-admins cannot access these controls or endpoints.
