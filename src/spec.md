# Specification

## Summary
**Goal:** Fix the “Create Server” flow so server creation and server list updates work end-to-end.

**Planned changes:**
- Implement Motoko backend methods for server creation and listing (`createServer`, `getAllServers`) and ensure newly created servers appear in subsequent listings for the creator.
- Add backend endpoints the UI depends on after creation to prevent follow-on failures (`getServer`, `getServerOrdering`, `setServerOrdering`, `joinServer`, `leaveServer`) with non-trapping behavior where applicable.
- Ensure the Create Server dialog shows a clear English toast error on failure (keeping the dialog open with values preserved) and closes/clears on success while refreshing the server rail via React Query invalidation.

**User-visible outcome:** Users can create a server successfully, see it appear in the server rail without refreshing, and get an explicit error message if server creation fails; server discovery and ordering interactions won’t error immediately after creation.
