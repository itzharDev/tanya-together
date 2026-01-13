import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { analytics } from "../services/firebase";

// Helper to safely log events
const safeLogEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }
};

// User tracking
export const setAnalyticsUserId = (userId) => {
  if (analytics && userId) {
    try {
      setUserId(analytics, userId);
    } catch (error) {
      console.error("Analytics setUserId error:", error);
    }
  }
};

export const setAnalyticsUserProperties = (properties) => {
  if (analytics && properties) {
    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error("Analytics setUserProperties error:", error);
    }
  }
};

// Authentication events
export const logLogin = (method) => {
  safeLogEvent("login", { method });
};

export const logSignup = (method) => {
  safeLogEvent("sign_up", { method });
};

export const logLogout = () => {
  safeLogEvent("logout");
};

// Page views
export const logPageView = (pageName, pageTitle) => {
  safeLogEvent("page_view", {
    page_name: pageName,
    page_title: pageTitle
  });
};

// Reading session events
export const logStartReading = (groupId, partId, partName) => {
  safeLogEvent("start_reading", {
    group_id: groupId,
    part_id: partId,
    part_name: partName
  });
};

export const logFinishReading = (groupId, partId, partName, durationSeconds) => {
  safeLogEvent("finish_reading", {
    group_id: groupId,
    part_id: partId,
    part_name: partName,
    duration_seconds: durationSeconds
  });
};

export const logMarkPartFinished = (groupId, partId, partName) => {
  safeLogEvent("mark_part_finished", {
    group_id: groupId,
    part_id: partId,
    part_name: partName
  });
};

// Group events
export const logViewGroup = (groupId, groupName, isAnonymous) => {
  safeLogEvent("view_group", {
    group_id: groupId,
    group_name: groupName,
    is_anonymous: isAnonymous
  });
};

export const logCreateGroup = (groupId, groupName) => {
  safeLogEvent("create_group", {
    group_id: groupId,
    group_name: groupName
  });
};

export const logJoinGroup = (groupId, groupName) => {
  safeLogEvent("join_group", {
    group_id: groupId,
    group_name: groupName
  });
};

// Search events
export const logSearch = (searchTerm) => {
  safeLogEvent("search", {
    search_term: searchTerm
  });
};

// Share events
export const logShare = (contentType, contentId, method) => {
  safeLogEvent("share", {
    content_type: contentType,
    content_id: contentId,
    method: method
  });
};

// Error tracking
export const logError = (errorMessage, errorCode, context) => {
  safeLogEvent("error", {
    error_message: errorMessage,
    error_code: errorCode,
    context: context
  });
};
