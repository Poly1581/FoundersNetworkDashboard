// Client-side data filtering utilities for performance optimization

export const TIME_RANGES = {
  '1d': { hours: 24, label: '24 hr' },
  '7d': { hours: 24 * 7, label: '1 wk' },
  '30d': { hours: 24 * 30, label: '1 mo' }
};

// Get cutoff timestamp for time range filtering
export const getCutoffTimestamp = (timeRange) => {
  const hours = TIME_RANGES[timeRange]?.hours || TIME_RANGES['30d'].hours;
  return new Date(Date.now() - (hours * 60 * 60 * 1000));
};

// Check if a timestamp is within the specified time range
export const isWithinTimeRange = (timestamp, timeRange) => {
  if (!timestamp) return false;
  
  const cutoff = getCutoffTimestamp(timeRange);
  const eventDate = new Date(timestamp);
  
  return eventDate >= cutoff;
};

// Filter events based on time range
export const filterEventsByTimeRange = (events, timeRange) => {
  if (!events || !Array.isArray(events)) return [];
  if (timeRange === '30d') return events; // No filtering needed for full dataset
  
  return events.filter(event => {
    const timestamp = event.dateCreated || event.timestamp || event.lastSeen;
    return isWithinTimeRange(timestamp, timeRange);
  });
};

// Filter issues based on time range (checks lastSeen and firstSeen)
export const filterIssuesByTimeRange = (issues, timeRange) => {
  if (!issues || !Array.isArray(issues)) return [];
  if (timeRange === '30d') return issues; // No filtering needed for full dataset
  
  return issues.filter(issue => {
    // Include issue if it was last seen within the time range OR first seen within the range
    const lastSeenInRange = isWithinTimeRange(issue.lastSeen, timeRange);
    const firstSeenInRange = isWithinTimeRange(issue.firstSeen, timeRange);
    
    return lastSeenInRange || firstSeenInRange;
  });
};

// Filter integrations data for Live Data page (independent filtering)
export const filterLiveDataByTimeRange = (data, timeRange, filterType = 'all') => {
  if (!data) return data;
  
  // For Live Data, we want more granular filtering options
  const liveDataTimeRanges = {
    '1h': { hours: 1, label: '1 hr' },
    '4h': { hours: 4, label: '4 hr' },
    '12h': { hours: 12, label: '12 hr' },
    '24h': { hours: 24, label: '24 hr' },
    '7d': { hours: 24 * 7, label: '1 wk' },
    'all': null // Show all data
  };
  
  if (filterType === 'all' || !liveDataTimeRanges[filterType]) {
    return data;
  }
  
  const cutoff = new Date(Date.now() - (liveDataTimeRanges[filterType].hours * 60 * 60 * 1000));
  
  if (Array.isArray(data)) {
    return data.filter(item => {
      const timestamp = item.dateCreated || item.timestamp || item.lastSeen || item.lastSuccess;
      return timestamp && new Date(timestamp) >= cutoff;
    });
  }
  
  return data;
};

// Unified global time range filter for all API integrations
// USE THIS FUNCTION for all new API integrations to ensure they respect the global time filter
export const filterByGlobalTimeRange = (data, timeRange) => {
  if (!data || !timeRange) return data;
  
  // Global time ranges that match the UI
  const globalTimeRanges = {
    '1d': { hours: 24, label: '1 Day' },
    '7d': { hours: 24 * 7, label: '7 Days' },
    '30d': { hours: 24 * 30, label: '30 Days' },
    '90d': { hours: 24 * 90, label: '90 Days' }
  };
  
  if (!globalTimeRanges[timeRange]) {
    return data; // Return all data if time range not recognized
  }
  
  const cutoff = new Date(Date.now() - (globalTimeRanges[timeRange].hours * 60 * 60 * 1000));
  
  if (Array.isArray(data)) {
    return data.filter(item => {
      const timestamp = item.dateCreated || item.timestamp || item.lastSeen || item.lastSuccess || item.time;
      return timestamp && new Date(timestamp) >= cutoff;
    });
  }
  
  return data;
};

// Aggregate data by time buckets for chart performance
export const aggregateDataByTimeBucket = (events, timeRange) => {
  if (!events || !Array.isArray(events)) return [];
  
  const filteredEvents = filterEventsByTimeRange(events, timeRange);
  const bucketSize = getBucketSize(timeRange);
  const buckets = {};
  
  filteredEvents.forEach(event => {
    const timestamp = event.dateCreated || event.timestamp;
    if (!timestamp) return;
    
    const bucketKey = getBucketKey(new Date(timestamp), bucketSize);
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = {
        timestamp: bucketKey,
        count: 0,
        events: []
      };
    }
    buckets[bucketKey].count++;
    buckets[bucketKey].events.push(event);
  });
  
  return Object.values(buckets).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

// Get appropriate bucket size based on time range
const getBucketSize = (timeRange) => {
  switch (timeRange) {
    case '1d': return 'hour';
    case '7d': return 'day';
    case '30d': return 'day';
    default: return 'day';
  }
};

// Get bucket key for aggregation
const getBucketKey = (date, bucketSize) => {
  switch (bucketSize) {
    case 'hour':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
    case 'day':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    default:
      return date.toISOString();
  }
};

// Memoization helper for expensive filtering operations
export const createMemoizedFilter = () => {
  const cache = new Map();
  
  return (data, timeRange, filterFn) => {
    const cacheKey = `${JSON.stringify(data?.slice(0, 5))}:${timeRange}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const result = filterFn(data, timeRange);
    
    // Keep cache size manageable
    if (cache.size > 10) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(cacheKey, result);
    return result;
  };
};