# Specification

## Summary
**Goal:** Add a bottom-left “Profile Settings” button on desktop that opens the existing User Settings overlay.

**Planned changes:**
- Add a settings button within the leftmost rail area of the desktop UI, positioned at the bottom-left.
- Wire the button click to the existing navigation state/action to open the User Settings overlay (UserSettingsShell via `showUserSettings`).
- Ensure the button includes an English label/tooltip and is keyboard accessible (Tab focus, Enter/Space activation).
- Verify mobile settings entry points remain unchanged and continue to work.

**User-visible outcome:** Desktop users see a bottom-left “Profile Settings” button that opens the existing User Settings overlay when clicked (and can be accessed via keyboard), without impacting mobile behavior.
