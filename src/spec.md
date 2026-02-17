# Specification

## Summary
**Goal:** Fix the incorrect “Username or email is already taken” registration error by returning clear backend failure reasons and showing accurate frontend messages.

**Planned changes:**
- Update the backend registration API to return distinct, non-ambiguous failure reasons (not a guest/already registered vs username taken vs email taken) instead of returning `null` for all failures.
- Update the frontend registration flow to map backend failure reasons to correct, user-friendly messages, only showing the “taken” message when an actual username/email collision is reported.
- Keep all auth-related user-facing messages centralized in `frontend/src/auth/authMessages.ts` and used consistently by `frontend/src/auth/AuthProvider.tsx` and `frontend/src/pages/LoginScreen.tsx`.

**User-visible outcome:** Registration errors accurately explain the real problem (already registered/not a guest vs username taken vs email taken), and users no longer see the “Username or email is already taken” message unless it’s actually true.
