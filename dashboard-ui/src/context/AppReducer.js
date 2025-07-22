// Action Types
export const FETCH_DATA_START = 'FETCH_DATA_START';
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
export const FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE';
export const SET_ACTIVE_PAGE = 'SET_ACTIVE_PAGE';
export const SET_TIME_RANGE = 'SET_TIME_RANGE';
export const SET_ALL_EXPANDED = 'SET_ALL_EXPANDED';
export const SET_LIVE_DATA_FILTER = 'SET_LIVE_DATA_FILTER';
export const UPDATE_FILTERED_DATA = 'UPDATE_FILTERED_DATA';

// Reducer Function
export const appReducer = (state, action) => {
    switch (action.type) {
        case FETCH_DATA_START:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                // Raw data (always 1-month window for client-side filtering)
                rawSentryIssues: action.payload.sentryIssues,
                rawAllEventsData: action.payload.allEventsData,
                rawAllEventsForChart: action.payload.allEventsForChart,
                // Filtered data (initially same as raw)
                sentryIssues: action.payload.sentryIssues,
                sentryIntegrations: action.payload.sentryIntegrations,
                allEventsData: action.payload.allEventsData,
                allEventsForChart: action.payload.allEventsForChart,
                hubspotIntegrations: action.payload.hubspotIntegrations,
                allIntegrations: [...action.payload.sentryIntegrations, ...action.payload.hubspotIntegrations],
            };
        case FETCH_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case SET_ACTIVE_PAGE:
            return {
                ...state,
                activePage: action.payload,
            };
        case SET_TIME_RANGE:
            return {
                ...state,
                timeRange: action.payload,
            };
        case SET_ALL_EXPANDED:
            return {
                ...state,
                allExpanded: !state.allExpanded,
            };
        case SET_LIVE_DATA_FILTER:
            return {
                ...state,
                liveDataFilter: action.payload,
            };
        case UPDATE_FILTERED_DATA:
            return {
                ...state,
                sentryIssues: action.payload.sentryIssues,
                allEventsData: action.payload.allEventsData,
                allEventsForChart: action.payload.allEventsForChart,
            };
        default:
            return state;
    }
};
