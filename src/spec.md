# Specification

## Summary
**Goal:** Let users open a profile overlay for any user by clicking them in the Members list or by clicking a chat message author (avatar/name), without navigating away from the current server/channel.

**Planned changes:**
- Add a user profile overlay component (modal on desktop; sheet or modal on mobile) that renders selected user profile details from existing profile data (display name, username/handle if available, avatar, banner, About Me, custom status, badges).
- Add selection state + open/close behavior for the overlay, including an explicit Close control and standard dismiss interactions (e.g., Escape/outside click where appropriate) that clear the selection.
- Make each row in the right-side Members list clickable to open that member’s profile overlay.
- Make chat message author avatar and display name clickable to open that author’s profile overlay, with appropriate hover/pointer affordance and without disrupting scrolling or causing navigation/rerender that loses context.

**User-visible outcome:** Clicking a member in the Members list or a message author’s avatar/name opens a profile overlay showing their existing profile details, and closing it returns you to the same channel view without navigation.
