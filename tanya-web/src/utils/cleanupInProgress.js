import Parse from '../services/parse';

/**
 * Clean up stale inProgress entries across all groups
 * Removes parts that have been in progress for more than 2 hours
 */
export const cleanupAllStaleInProgress = async () => {
  const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  
  try {
    const query = new Parse.Query('NewGroup');
    query.limit(1000);
    const groups = await query.find();
    
    let cleanedCount = 0;
    
    for (const group of groups) {
      const inProgressData = group.get('inProgressData') || {};
      
      // If there's no inProgressData but there's an old inProgress array, migrate it
      if (Object.keys(inProgressData).length === 0 && group.get('inProgress')?.length > 0) {
        const inProgress = group.get('inProgress') || [];
        const migratedData = {};
        
        // Migrate old data with current timestamp (give them 2 hours from now)
        inProgress.forEach(partNum => {
          migratedData[partNum] = now;
        });
        
        group.set('inProgressData', migratedData);
        await group.save();
        continue;
      }
      
      const updatedInProgressData = {};
      let hasChanges = false;
      
      // Keep only entries that are less than 2 hours old
      Object.keys(inProgressData).forEach(partNum => {
        const timestamp = inProgressData[partNum];
        if (now - timestamp < TWO_HOURS) {
          updatedInProgressData[partNum] = timestamp;
        } else {
          hasChanges = true;
        }
      });
      
      // Update if there were any changes
      if (hasChanges) {
        group.set('inProgressData', updatedInProgressData);
        group.set('inProgress', Object.keys(updatedInProgressData));
        await group.save();
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up stale inProgress entries from ${cleanedCount} groups`);
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up stale inProgress entries:', error);
    return 0;
  }
};

/**
 * Clean up stale inProgress entries for a specific group
 * @param {Parse.Object} group - The group to clean up
 * @returns {Object} - The cleaned inProgressData
 */
export const cleanupStaleInProgressForGroup = async (group) => {
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  
  const inProgressData = group.get('inProgressData') || {};
  const updatedInProgressData = {};
  
  // Keep only entries that are less than 2 hours old
  Object.keys(inProgressData).forEach(partNum => {
    const timestamp = inProgressData[partNum];
    if (now - timestamp < TWO_HOURS) {
      updatedInProgressData[partNum] = timestamp;
    }
  });
  
  // Update if there were any changes
  if (Object.keys(updatedInProgressData).length !== Object.keys(inProgressData).length) {
    group.set('inProgressData', updatedInProgressData);
    group.set('inProgress', Object.keys(updatedInProgressData));
    await group.save();
  }
  
  return updatedInProgressData;
};
