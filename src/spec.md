# Specification

## Summary
**Goal:** Add server member role display and management so roles appear on server profiles, authorized users can assign/remove roles, and usernames are colored by a member’s effective role color in server contexts.

**Planned changes:**
- Backend: add APIs to list server roles, fetch server members including assigned role IDs, and provide each member’s effective display role color based on highest-position assigned role (or none).
- Backend: add authorized role assignment/removal endpoints for server members and write audit log entries for role changes.
- Frontend: add React Query hooks to fetch roles, fetch members with role IDs, and mutate role assignments/removals with proper cache invalidation and error toasts.
- Frontend: show role chips/badges on the server profile overlay when opened in a server context (hide the section when none).
- Frontend: add role assignment controls in the server member profile overlay and/or member list, visible/enabled only for authorized users.
- Frontend: apply effective role color to usernames in server chat messages and the server member list, falling back to default text color when no role color is available.

**User-visible outcome:** In servers, users can see members’ roles on profiles and see role-colored usernames in the member list and chat; authorized users can assign or remove roles and changes reflect immediately.
