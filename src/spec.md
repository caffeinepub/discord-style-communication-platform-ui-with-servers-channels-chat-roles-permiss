# Specification

## Summary
**Goal:** Fix backend sign-up by automatically assigning the default "user" role to newly registered accounts (without requiring admin permissions) and ensure registration never traps due to role assignment.

**Planned changes:**
- Update backend registration flow to auto-assign the default "user" role for every new account without needing the caller to be an admin.
- Adjust backend error handling so `register` always returns a `RegistrationResult` (success or `#error`) and never traps if role assignment fails.
- Ensure the newly registered user can successfully call `getCallerUserProfile` immediately after registration.

**User-visible outcome:** Users can sign up successfully without seeing the "Unauthorized: Only admins can assign user roles" error, and newly created accounts can access their profile right after registering.
