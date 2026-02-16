# Specification

## Summary
**Goal:** Prevent the app from getting stuck on the global “Loading...” screen by surfacing backend connection/health-check failures and providing a user-accessible retry path.

**Planned changes:**
- Ensure auth initialization always resolves out of `authStatus === 'initializing'` within a bounded time, even when the backend is unreachable or not ready.
- If a stored session exists but backend readiness never occurs, clear/mark the session invalid and return the user to the Login screen with an English “backend not reachable” style message.
- Implement `frontend/src/components/system/BackendConnectionBanner.tsx` to display backend connection state (loading/ready/error) and, on error, show an English error message plus a Retry button.
- Wire Retry to `useBackendConnection().retry` so users can re-attempt initialization/health checks without a hard refresh.
- Add a client-side timeout around health checking so slow/hanging health checks transition to a recoverable error state instead of infinite loading.

**User-visible outcome:** When the backend is down, misconfigured, or slow, users no longer see endless loading; they see a clear connection error with a Retry action (and are returned to Login when appropriate) so the app remains usable and recoverable.
