# Parse Live Query Implementation

Parse Live Query has been integrated into the Reader page to enable real-time synchronization of group progress across multiple users.

## Problem Solved

When multiple users are reading from the same group and marking parts as complete, the changes need to be reflected in real-time to all connected users. Without Live Query, users would have stale data and their updates could potentially override other users' completed parts.

## Implementation

### 1. Parse Service Configuration (`src/services/parse.js`)

The Parse service has been configured with Live Query support:

```javascript
Parse.liveQueryServerURL = 'wss://tanya.dvarmalchus.co.il/parse';
```

This establishes a WebSocket connection to the Parse server for real-time updates.

### 2. Reader Component Subscription (`src/pages/Reader.jsx`)

The Reader component subscribes to updates for the currently viewed group:

```javascript
useEffect(() => {
  if (typeof window === 'undefined' || !group?.id) return;
  
  const query = new Parse.Query('NewGroup');
  query.equalTo('objectId', group.id);
  
  const subscription = query.subscribe();
  
  subscription.on('update', (updatedGroup) => {
    // Update local state with new data
    const updatedLocalGroup = {
      ...group,
      book: updatedGroup.get('book') || [],
      inProgress: Object.keys(updatedGroup.get('inProgressData') || {}),
      booksReaded: updatedGroup.get('booksReaded') || 0,
    };
    
    setGroup(updatedLocalGroup);
    
    // Show toast notification
    setShowUpdateToast(true);
    setTimeout(() => setShowUpdateToast(false), 3000);
  });
  
  subscription.on('error', (error) => {
    console.error('Live Query error:', error);
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, [group?.id]);
```

## What Gets Updated in Real-Time

When any user in the same group:
- ✅ Marks a part as completed (`book` array)
- ✅ Adds a part to in-progress (`inProgress` array)
- ✅ Removes a part from in-progress
- ✅ Completes a full book (`booksReaded` counter)

All other users reading the same group will receive the updates immediately.

## User Experience

- When an update is received, a toast notification appears at the top of the screen showing "התקדמות עודכנה" (Progress updated)
- The progress bar updates to reflect the new completion percentage
- The "X parts currently being read" counter updates
- Updates happen seamlessly without interrupting the user's reading experience

## Server Requirements

The Parse Server must have Live Query enabled for the `NewGroup` class. Ensure your Parse Server configuration includes:

```javascript
// Parse Server config
{
  liveQuery: {
    classNames: ['NewGroup']
  }
}
```

## Testing

To test the Live Query functionality:

1. Open the same group in two different browser windows/tabs
2. In one window, mark a part as complete
3. In the other window, you should see:
   - The toast notification appear
   - The progress bar update
   - The completed parts count increase

## Performance Notes

- Live Query uses WebSocket connections, which are efficient and lightweight
- Each Reader component only subscribes to updates for its specific group
- Subscriptions are automatically cleaned up when the component unmounts
- The implementation is SSR-safe (only runs in the browser)

## Troubleshooting

If Live Query updates aren't working:

1. Check the browser console for WebSocket connection errors
2. Verify the Parse Server supports Live Query and has it enabled for `NewGroup`
3. Ensure the `liveQueryServerURL` matches your Parse Server's WebSocket endpoint
4. Check that the server allows WebSocket connections (not blocked by firewall/proxy)
5. Look for "Live Query error:" messages in the console
