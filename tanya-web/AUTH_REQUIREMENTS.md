# Authentication Requirements

This document outlines when authentication is required in the Tanya web application.

## Authentication Flow

### ✅ Anonymous Access (No Login Required)

Anonymous users can:
- Browse the feed page and view all public groups
- Click on any group card to read
- View the group page with any book
- Read any part (PDF or web content)
- Mark parts as finished (updates the group's `book` array)
- Navigate between pages freely

### 🔒 Authentication Required

Login is **ONLY** required for:
- Creating a new reading group (clicking the FAB "לפתיחת ספר חדש")
- If an anonymous user tries to create a group, they are redirected to `/login`

## Technical Implementation

### Group Page (`/group/:groupId`)
- Accessible to both authenticated and anonymous users
- When loading a part:
  - **All users** (authenticated and anonymous): part is automatically added to `inProgress` array
  - This shows the group has X parts "in progress"
- When finishing a part (clicking "סיימתי את הפרק"):
  - Part is removed from `inProgress` and added to `book` array
  - This allows anonymous contribution to group progress
- When leaving without finishing (back button or closing page):
  - Part is automatically removed from `inProgress`
  - Ensures accurate tracking of active reading sessions

### Feed Page (`/feed`)
- Accessible to both authenticated and anonymous users
- Anonymous users see:
  - All public groups
  - "התחבר" button in top-right (instead of menu)
  - No tabs (global/shared/private tabs only show for authenticated users)
- Authenticated users see:
  - All three tabs (global, shared, private)
  - Menu button with logout option
  - Full personalization

### Create Group Modal
- Clicking the FAB button checks authentication
- If not authenticated: `navigate('/login')`
- If authenticated: opens modal to create group

## Benefits of This Approach

1. **Lower Barrier to Entry**: Users can start reading immediately without signup
2. **Viral Growth**: Anonymous users can participate and contribute
3. **Progressive Engagement**: Users only need to sign up when they want to create groups
4. **Community Building**: Everyone contributes to group completion progress
