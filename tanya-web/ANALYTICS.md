# Firebase Analytics Integration

Firebase Analytics has been integrated into the Tanya web app to track user behavior and app usage.

## What's Already Tracked

### Automatic Tracking
- **Page views**: All route changes are automatically tracked
- **User sessions**: User IDs are set when users log in
- **Authentication events**:
  - Login (phone and Google)
  - Signup (phone and Google)
  - Logout

## Available Analytics Functions

Import from `src/utils/analytics.js`:

### User Tracking
```javascript
import { setAnalyticsUserId, setAnalyticsUserProperties } from '../utils/analytics';

// Set user ID (automatically done on login)
setAnalyticsUserId(userId);

// Set user properties
setAnalyticsUserProperties({
  user_type: 'premium',
  preferred_language: 'he'
});
```

### Reading Events
```javascript
import { logStartReading, logFinishReading, logMarkPartFinished } from '../utils/analytics';

// When user starts reading a part
logStartReading(groupId, partId, partName);

// When user finishes reading (with duration)
logFinishReading(groupId, partId, partName, durationSeconds);

// When user marks a part as finished
logMarkPartFinished(groupId, partId, partName);
```

### Group Events
```javascript
import { logViewGroup, logCreateGroup, logJoinGroup } from '../utils/analytics';

// When viewing a group
logViewGroup(groupId, groupName, isAnonymous);

// When creating a new group
logCreateGroup(groupId, groupName);

// When joining a group
logJoinGroup(groupId, groupName);
```

### Search and Share
```javascript
import { logSearch, logShare } from '../utils/analytics';

// Track search queries
logSearch(searchTerm);

// Track share events
logShare('group', groupId, 'whatsapp');
```

### Error Tracking
```javascript
import { logError } from '../utils/analytics';

// Track errors
logError('Failed to load group', 'NETWORK_ERROR', 'GroupDetails');
```

## Example Usage in Components

### In Reader Component
```javascript
import { useEffect, useState } from 'react';
import { logStartReading, logFinishReading } from '../utils/analytics';

function Reader() {
  const [startTime, setStartTime] = useState(null);
  
  useEffect(() => {
    // Track when reading starts
    const start = Date.now();
    setStartTime(start);
    logStartReading(groupId, partId, partName);
    
    return () => {
      // Track when reading ends
      if (startTime) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        logFinishReading(groupId, partId, partName, duration);
      }
    };
  }, [groupId, partId]);
  
  // Rest of component...
}
```

### In Feed Component
```javascript
import { logViewGroup } from '../utils/analytics';

function handleGroupClick(group) {
  logViewGroup(group.id, group.name, !currentUser);
  navigate(`/group/${group.id}`);
}
```

## Viewing Analytics Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `socialtanya-2d181` project
3. Navigate to Analytics → Events to see all tracked events
4. Navigate to Analytics → Dashboard for overview

## Important Notes

- Analytics only works in the browser (not during SSR)
- All events are sent asynchronously and won't block UI
- Failed analytics calls are caught and logged to console
- Analytics is automatically disabled if not supported by the browser
