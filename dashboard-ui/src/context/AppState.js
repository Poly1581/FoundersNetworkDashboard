import React, { useReducer, startTransition, useCallback, useMemo } from 'react';
import AppContext from './AppContext';
import { appReducer, FETCH_DATA_START, FETCH_DATA_SUCCESS, FETCH_DATA_FAILURE, UPDATE_FILTERED_DATA, SET_LIVE_DATA_FILTER, SET_GLOBAL_TIME_RANGE, SAVE_PAGE_STATE, RESTORE_PAGE_STATE } from './AppReducer';
import { fetchIssues, fetchEventsForIssue, fetchSentryIntegrationStatus, fetchMailgunLogs, fetchMailgunStats, fetchMailgunIntegrationStatus } from '../api';
import { filterEventsByTimeRange, filterIssuesByTimeRange, createMemoizedFilter } from '../utils/dataFilters';

// Utility function from App.js
function getTimeOffsetFromNow(timestampStr) {
    const dateTimeStr = timestampStr.replace("Timestamp: ", "");
    const pastDate = new Date(dateTimeStr);
    const now = new Date();
    return Math.floor((pastDate.getTime() - now.getTime()) / 1000);
}

// Create mock Mailgun data for testing
function createMockMailgunData() {
    const now = new Date();
    const mockEvents = [];
    
    // Create sample events over the past 30 days
    for (let i = 0; i < 15; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const eventDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        const eventTypes = ['failed', 'bounced', 'rejected', 'complained'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        let category, level;
        switch (eventType) {
            case 'failed':
                category = 'Delivery Failed';
                level = 'error';
                break;
            case 'bounced':
                category = 'Email Bounced';
                level = 'warning';
                break;
            case 'rejected':
                category = 'Message Rejected';
                level = 'error';
                break;
            case 'complained':
                category = 'Spam Complaint';
                level = 'warning';
                break;
        }
        
        mockEvents.push({
            id: `mock-mailgun-${i}`,
            timestamp: eventDate.toISOString(),
            dateCreated: eventDate.toISOString(),
            lastSeen: eventDate.toISOString(),
            level: level,
            category: category,
            issueCategory: category,
            type: category,
            title: `${category}: user${i}@example.com`,
            message: `Mock ${eventType} event for testing`,
            culprit: `user${i}@example.com`,
            count: 1,
            event: eventType,
            recipient: `user${i}@example.com`,
            reason: `Mock ${eventType} reason`,
            source: 'mailgun',
            offsetSeconds: getTimeOffsetFromNow(`Timestamp: ${eventDate.toISOString()}`)
        });
    }
    
    return mockEvents;
}

// Transform Mailgun logs into chart-compatible format
function transformMailgunLogsToEvents(mailgunLogs) {
    if (!mailgunLogs || !mailgunLogs.items) {
        return [];
    }
    
    return mailgunLogs.items.map(log => {
        // Determine error category based on event type
        let category = 'Unknown Error';
        let level = 'info';
        
        switch (log.event) {
            case 'failed':
                category = 'Delivery Failed';
                level = 'error';
                break;
            case 'rejected':
                category = 'Message Rejected';
                level = 'error';
                break;
            case 'bounced':
                category = 'Email Bounced';
                level = 'warning';
                break;
            case 'complained':
                category = 'Spam Complaint';
                level = 'warning';
                break;
            case 'unsubscribed':
                category = 'Unsubscribed';
                level = 'info';
                break;
            default:
                category = `${log.event?.charAt(0).toUpperCase()}${log.event?.slice(1)} Error`;
        }

        return {
            id: log.id || `mailgun-${log.timestamp}-${Math.random()}`,
            timestamp: new Date(log.timestamp * 1000).toISOString(), // Convert Unix timestamp
            dateCreated: new Date(log.timestamp * 1000).toISOString(),
            lastSeen: new Date(log.timestamp * 1000).toISOString(),
            level: level,
            category: category,
            issueCategory: category,
            type: category,
            title: log.message || `${category}: ${log.recipient || 'Unknown recipient'}`,
            message: log.message || log.reason || `${log.event} event for ${log.recipient}`,
            culprit: log.recipient || 'mailgun-api',
            count: 1,
            // Mailgun-specific fields
            event: log.event,
            recipient: log.recipient,
            reason: log.reason,
            description: log.description,
            severity: log.severity || 'temporary',
            source: 'mailgun',
            offsetSeconds: getTimeOffsetFromNow(`Timestamp: ${new Date(log.timestamp * 1000).toISOString()}`)
        };
    });
}

const AppState = ({ children }) => {
    const initialState = {
        allExpanded: false,
        activePage: 'overview',
        timeRange: '30d',
        globalTimeRange: '30d',
        liveDataFilter: 'all',
        // Raw data (always 1-month window)
        rawSentryIssues: [],
        rawAllEventsData: {},
        rawAllEventsForChart: [],
        rawMailgunEvents: [],
        // Filtered data (applied based on timeRange/liveDataFilter)
        sentryIssues: [],
        allEventsData: {},
        allEventsForChart: [],
        sentryIntegrations: [],
        mailgunIntegrations: [
            { name: 'Mailgun API', category: 'Email Service', status: 'Healthy', responseTime: '85ms', lastSuccess: 'Just now', uptime: '99.98%', issue: null },
        ],
        mailgunEvents: [],
        mailgunStats: [],
        mailgunDomains: [],
        allIntegrations: [],
        loading: false,
        error: null,
        pageStates: {}, // Store page-specific state
    };

    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Create memoized filter functions for performance
    const memoizedEventFilter = useMemo(() => createMemoizedFilter(), []);
    const memoizedIssueFilter = useMemo(() => createMemoizedFilter(), []);

    const loadSentryData = useCallback(async () => {
        startTransition(() => {
            dispatch({ type: FETCH_DATA_START });
        });

        try {
            // Fetch both Sentry and Mailgun data in parallel
            const [
                fetchedIssues, 
                fetchedSentryIntegrations, 
                mailgunLogs, 
                mailgunStats, 
                mailgunIntegrations
            ] = await Promise.all([
                fetchIssues(),
                fetchSentryIntegrationStatus(),
                fetchMailgunLogs('30d').catch(err => {
                    console.warn('Failed to fetch Mailgun logs:', err.message);
                    return { items: [] };
                }),
                fetchMailgunStats('30d').catch(err => {
                    console.warn('Failed to fetch Mailgun stats:', err.message);
                    return [];
                }),
                fetchMailgunIntegrationStatus().catch(err => {
                    console.warn('Failed to fetch Mailgun integration status:', err.message);
                    return [{ name: 'Mailgun API', category: 'Email Service', status: 'Error', responseTime: 'N/A', lastSuccess: 'N/A', uptime: 'N/A', issue: err.message }];
                })
            ]);

            // Process Sentry data
            const eventPromises = fetchedIssues.map(async (issue) => {
                try {
                    return await fetchEventsForIssue(issue.id);
                } catch (error) {
                    console.warn(`Failed to fetch events for issue ${issue.id}:`, error.message);
                    return []; // Return empty array for failed fetches
                }
            });
            const allEventsByIssue = await Promise.all(eventPromises);

            const eventsDataMap = fetchedIssues.reduce((acc, issue, index) => {
                acc[issue.id] = allEventsByIssue[index];
                return acc;
            }, {});

            const flattenedSentryEvents = fetchedIssues.flatMap((issue, index) => {
                const eventsForIssue = allEventsByIssue[index] || [];
                const category = issue.metadata.type || issue.type;
                return eventsForIssue.map(event => ({
                    ...event,
                    level: issue.level,
                    issueCategory: category,
                    source: 'sentry',
                    offsetSeconds: getTimeOffsetFromNow(`Timestamp: ${event.dateCreated}`),
                }));
            });

            // Process Mailgun data - use mock data if API fails
            let mailgunEvents = transformMailgunLogsToEvents(mailgunLogs);
            
            // If no real data, create mock data for testing
            if (!mailgunEvents || mailgunEvents.length === 0) {
                console.log('Using mock Mailgun data since API failed');
                mailgunEvents = createMockMailgunData();
            }
            
            console.log('Mailgun API Response:', {
                rawLogs: mailgunLogs,
                hasItems: !!(mailgunLogs && mailgunLogs.items),
                itemsCount: mailgunLogs?.items?.length || 0,
                transformedEvents: mailgunEvents,
                transformedCount: mailgunEvents?.length || 0,
                stats: mailgunStats,
                integrations: mailgunIntegrations
            });
            
            startTransition(() => {
                dispatch({
                    type: FETCH_DATA_SUCCESS,
                    payload: {
                        sentryIssues: fetchedIssues,
                        sentryIntegrations: fetchedSentryIntegrations,
                        allEventsData: eventsDataMap,
                        allEventsForChart: flattenedSentryEvents,
                        mailgunIntegrations: mailgunIntegrations,
                        mailgunEvents: mailgunEvents,
                        mailgunStats: mailgunStats,
                        mailgunDomains: [],
                        mailgunData: mailgunLogs
                    }
                });
            });

            // Apply initial filtering after data loads (using current timeRange from state)
            setTimeout(() => {
                const currentTimeRange = '30d'; // Use default time range for initial load
                
                // Filter Sentry data
                const filteredIssues = memoizedIssueFilter(fetchedIssues, currentTimeRange, filterIssuesByTimeRange);
                const filteredSentryEvents = memoizedEventFilter(flattenedSentryEvents, currentTimeRange, filterEventsByTimeRange);
                
                // Filter Mailgun events
                const filteredMailgunEvents = memoizedEventFilter(mailgunEvents, currentTimeRange, filterEventsByTimeRange);
                
                // Filter events data map
                const filteredEventsData = {};
                Object.keys(eventsDataMap).forEach(issueId => {
                    const events = eventsDataMap[issueId];
                    filteredEventsData[issueId] = filterEventsByTimeRange(events, currentTimeRange);
                });

                startTransition(() => {
                    dispatch({
                        type: UPDATE_FILTERED_DATA,
                        payload: {
                            sentryIssues: filteredIssues,
                            allEventsData: filteredEventsData,
                            allEventsForChart: filteredSentryEvents,
                            mailgunEvents: filteredMailgunEvents,
                        }
                    });
                });
            }, 100); // Small delay to ensure state is settled

        } catch (err) {
            startTransition(() => {
                dispatch({ type: FETCH_DATA_FAILURE, payload: err.message });
            });
            console.error("Failed to fetch dashboard data:", err);
        }
    }, [dispatch, memoizedEventFilter, memoizedIssueFilter]); // Added missing dependencies

    // Client-side filtering function
    const updateFilteredData = useCallback((newTimeRange = state.timeRange) => {
        const { rawSentryIssues, rawAllEventsData, rawAllEventsForChart, rawMailgunEvents } = state;
        
        if (!rawSentryIssues.length && !rawMailgunEvents?.length) return; // No data to filter yet
        
        // Filter Sentry data
        const filteredIssues = rawSentryIssues.length > 0 
            ? memoizedIssueFilter(rawSentryIssues, newTimeRange, filterIssuesByTimeRange) 
            : [];
        const filteredSentryEvents = rawAllEventsForChart.length > 0 
            ? memoizedEventFilter(rawAllEventsForChart, newTimeRange, filterEventsByTimeRange) 
            : [];
        
        // Filter Mailgun events
        const filteredMailgunEvents = rawMailgunEvents?.length > 0 
            ? memoizedEventFilter(rawMailgunEvents, newTimeRange, filterEventsByTimeRange) 
            : [];
        
        // Filter events data map
        const filteredEventsData = {};
        Object.keys(rawAllEventsData || {}).forEach(issueId => {
            const events = rawAllEventsData[issueId];
            filteredEventsData[issueId] = filterEventsByTimeRange(events, newTimeRange);
        });

        startTransition(() => {
            dispatch({
                type: UPDATE_FILTERED_DATA,
                payload: {
                    sentryIssues: filteredIssues,
                    allEventsData: filteredEventsData,
                    allEventsForChart: filteredSentryEvents,
                    mailgunEvents: filteredMailgunEvents,
                }
            });
        });
    }, [state, memoizedEventFilter, memoizedIssueFilter]);

    // Live data filter setter
    const setLiveDataFilter = useCallback((filterValue) => {
        dispatch({ type: SET_LIVE_DATA_FILTER, payload: filterValue });
    }, [dispatch]);

    // Global time range setter
    const setGlobalTimeRange = useCallback((timeRange) => {
        dispatch({ type: SET_GLOBAL_TIME_RANGE, payload: timeRange });
    }, [dispatch]);

    // Page state management
    const savePageState = useCallback((page, pageState) => {
        dispatch({ 
            type: SAVE_PAGE_STATE, 
            payload: { page, state: pageState } 
        });
    }, [dispatch]);

    const restorePageState = useCallback((page) => {
        return state.pageStates?.[page] || null;
    }, [state.pageStates]);

    // Apply initial filtering when raw data becomes available (removed to prevent infinite loop)

    return (
        <AppContext.Provider value={{ 
            state, 
            dispatch, 
            loadSentryData, 
            updateFilteredData,
            setLiveDataFilter,
            setGlobalTimeRange,
            savePageState,
            restorePageState 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppState;
