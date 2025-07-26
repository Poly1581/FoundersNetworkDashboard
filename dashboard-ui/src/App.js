import React, { useEffect, useContext, Suspense, useCallback, useTransition, useRef } from 'react';
import AppContext from './context/AppContext';
import { SET_ACTIVE_PAGE, SET_TIME_RANGE, SET_ALL_EXPANDED } from './context/AppReducer';
import Sidebar from './Sidebar';
import './App.css';
import { Container, Box, CircularProgress, Alert, Snackbar, Backdrop, AppBar, Toolbar, Typography, Button } from '@mui/material';

const Overview = React.lazy(() => import('./Overview'));
const LiveData = React.lazy(() => import('./LiveData'));

export default function App() {
    const { state, dispatch, loadSentryData, updateFilteredData } = useContext(AppContext);
    const {
        activePage,
        allExpanded,
        timeRange,
        allIntegrations,
        allEventsForChart,
        sentryIssues,
        allEventsData,
        sentryIntegrations,
        hubspotIntegrations,
        loading,
        error,
    } = state;
    const [isPending, startTransition] = useTransition();
    const initialLoadDone = useRef(false);

    useEffect(() => {
        // Load data automatically on initial page load (only once)
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadSentryData();
        }
    }, []); // Empty dependency array to run only once on mount

    const handlePageChange = useCallback((page) => {
        startTransition(() => {
            dispatch({ type: SET_ACTIVE_PAGE, payload: page });
        });
    }, [dispatch]);

    const handleTimeRangeChange = useCallback((newTimeRange) => {
        if (newTimeRange && newTimeRange !== timeRange) {
            dispatch({ type: SET_TIME_RANGE, payload: newTimeRange });
            // Apply client-side filtering immediately for better performance
            updateFilteredData(newTimeRange);
        }
    }, [dispatch, timeRange, updateFilteredData]);

    const handleRefreshAll = useCallback(() => {
        loadSentryData();
        // Apply filtering after loading new data
        setTimeout(() => {
            updateFilteredData();
        }, 100);
    }, [loadSentryData, updateFilteredData]);

    const handleExpandAll = useCallback(() => {
        dispatch({ type: SET_ALL_EXPANDED });
    }, [dispatch]);

    const sentryProps = {
        issues: sentryIssues,
        allEventsData,
        integrations: sentryIntegrations,
        loading,
        error,
    };

    const hubspotProps = {
        integrations: hubspotIntegrations,
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Main Header with Check Now Button */}
            <AppBar position="static" sx={{ backgroundColor: '#2e7d32', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Founders Network Dashboard
                    </Typography>
                    <Button 
                        color="inherit" 
                        variant="outlined"
                        onClick={handleRefreshAll}
                        disabled={loading}
                        sx={{ 
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                                borderColor: 'rgba(255,255,255,0.8)',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Check Now'}
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Sidebar activePage={activePage} onPageChange={handlePageChange} />
                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'transparent', p: 3, opacity: isPending ? 0.7 : 1 }}>
                <Container maxWidth="xl" sx={{ p: 0 }}>
                    <Suspense fallback={
                        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                            <CircularProgress size={60} />
                        </Box>
                    }>
                        {activePage === 'overview' && (
                            <Overview
                                allIntegrations={allIntegrations}
                                allEventsForChart={allEventsForChart}
                                hubspotEvents={[
                                    // July 1, 2025 - Contact Sync Issues
                                    { id: 1, timestamp: new Date('2025-07-01T09:15:00'), level: 'error', message: 'Contact sync failing for large batches over 1000 records', issueCategory: 'Contact Sync Error', category: 'Contact Sync Error' },
                                    { id: 2, timestamp: new Date('2025-07-01T14:30:00'), level: 'error', message: 'Contact import batch timeout after 30 minutes', issueCategory: 'Contact Sync Error', category: 'Contact Sync Error' },
                                    { id: 3, timestamp: new Date('2025-07-01T16:45:00'), level: 'warning', message: 'Contact merge conflicts detected', issueCategory: 'Contact Sync Error', category: 'Contact Sync Error' },
                                    
                                    // July 2, 2025 - Pipeline Issues
                                    { id: 4, timestamp: new Date('2025-07-02T10:20:00'), level: 'error', message: 'Deal pipeline updates completely failing', issueCategory: 'Pipeline Sync Error', category: 'Pipeline Sync Error' },
                                    { id: 5, timestamp: new Date('2025-07-02T13:10:00'), level: 'warning', message: 'Pipeline stage transitions delayed by 5+ minutes', issueCategory: 'Pipeline Sync Error', category: 'Pipeline Sync Error' },
                                    { id: 6, timestamp: new Date('2025-07-02T17:35:00'), level: 'error', message: 'Custom pipeline stage sync failed', issueCategory: 'Pipeline Sync Error', category: 'Pipeline Sync Error' },
                                    
                                    // July 3, 2025 - Property Mapping Issues
                                    { id: 7, timestamp: new Date('2025-07-03T08:50:00'), level: 'error', message: 'Property mapping conflicts for custom fields', issueCategory: 'Property Mapping Error', category: 'Property Mapping Error' },
                                    { id: 8, timestamp: new Date('2025-07-03T12:25:00'), level: 'error', message: 'Required property validation failed during sync', issueCategory: 'Property Mapping Error', category: 'Property Mapping Error' },
                                    { id: 9, timestamp: new Date('2025-07-03T15:40:00'), level: 'warning', message: 'Property type mismatch warnings', issueCategory: 'Property Mapping Error', category: 'Property Mapping Error' },
                                    
                                    // July 4, 2025 - API Rate Limiting
                                    { id: 10, timestamp: new Date('2025-07-04T11:15:00'), level: 'warning', message: 'Approaching daily API rate limit (80%)', issueCategory: 'API Rate Limit', category: 'API Rate Limit' },
                                    { id: 11, timestamp: new Date('2025-07-04T14:45:00'), level: 'error', message: 'API rate limit exceeded - requests throttled', issueCategory: 'API Rate Limit', category: 'API Rate Limit' },
                                    { id: 12, timestamp: new Date('2025-07-04T16:20:00'), level: 'error', message: 'Burst rate limit hit - temporary suspension', issueCategory: 'API Rate Limit', category: 'API Rate Limit' },
                                    
                                    // July 5, 2025 - Mixed issues (same day as some Sentry errors)
                                    { id: 13, timestamp: new Date('2025-07-05T09:30:00'), level: 'error', message: 'Webhook delivery failed to external endpoint', issueCategory: 'Webhook Error', category: 'Webhook Error' },
                                    { id: 14, timestamp: new Date('2025-07-05T11:50:00'), level: 'error', message: 'Contact sync batch processing failed', issueCategory: 'Contact Sync Error', category: 'Contact Sync Error' },
                                    { id: 15, timestamp: new Date('2025-07-05T15:25:00'), level: 'warning', message: 'Authentication token refresh warnings', issueCategory: 'Authentication Error', category: 'Authentication Error' },
                                    
                                    // July 6, 2025 - Integration Issues
                                    { id: 16, timestamp: new Date('2025-07-06T08:40:00'), level: 'error', message: 'Third-party integration connector failed', issueCategory: 'Integration Error', category: 'Integration Error' },
                                    { id: 17, timestamp: new Date('2025-07-06T13:15:00'), level: 'error', message: 'Webhook signature validation failures', issueCategory: 'Webhook Error', category: 'Webhook Error' },
                                    { id: 18, timestamp: new Date('2025-07-06T16:55:00'), level: 'warning', message: 'Data validation warnings for imported records', issueCategory: 'Data Validation Error', category: 'Data Validation Error' },
                                    
                                    // July 7, 2025 - Authentication Issues
                                    { id: 19, timestamp: new Date('2025-07-07T10:10:00'), level: 'error', message: 'OAuth token expired - authentication failed', issueCategory: 'Authentication Error', category: 'Authentication Error' },
                                    { id: 20, timestamp: new Date('2025-07-07T14:35:00'), level: 'error', message: 'API key permissions insufficient for operation', issueCategory: 'Authentication Error', category: 'Authentication Error' },
                                    
                                    // July 8, 2025 - Data Validation Issues
                                    { id: 21, timestamp: new Date('2025-07-08T09:20:00'), level: 'error', message: 'Required field validation failed for 150+ records', issueCategory: 'Data Validation Error', category: 'Data Validation Error' },
                                    { id: 22, timestamp: new Date('2025-07-08T12:40:00'), level: 'warning', message: 'Email format validation warnings', issueCategory: 'Data Validation Error', category: 'Data Validation Error' },
                                    { id: 23, timestamp: new Date('2025-07-08T17:10:00'), level: 'error', message: 'Phone number validation failed bulk import', issueCategory: 'Data Validation Error', category: 'Data Validation Error' },
                                    
                                    // July 9, 2025 - Mixed HubSpot Issues
                                    { id: 24, timestamp: new Date('2025-07-09T08:30:00'), level: 'warning', message: 'Pipeline probability calculations warnings', issueCategory: 'Pipeline Sync Error', category: 'Pipeline Sync Error' },
                                    { id: 25, timestamp: new Date('2025-07-09T11:45:00'), level: 'error', message: 'Webhook endpoint unreachable - retries exhausted', issueCategory: 'Webhook Error', category: 'Webhook Error' },
                                    { id: 26, timestamp: new Date('2025-07-09T15:20:00'), level: 'error', message: 'Contact duplicate detection algorithm failed', issueCategory: 'Contact Sync Error', category: 'Contact Sync Error' },
                                    
                                    // July 10, 2025 - Recent issues
                                    { id: 27, timestamp: new Date('2025-07-10T10:15:00'), level: 'error', message: 'Integration service completely down', issueCategory: 'Integration Error', category: 'Integration Error' },
                                    { id: 28, timestamp: new Date('2025-07-10T13:50:00'), level: 'warning', message: 'API response time degradation detected', issueCategory: 'API Rate Limit', category: 'API Rate Limit' },
                                    { id: 29, timestamp: new Date('2025-07-10T16:25:00'), level: 'error', message: 'Property sync rollback due to data corruption', issueCategory: 'Property Mapping Error', category: 'Property Mapping Error' }
                                ]}
                                issues={sentryIssues}
                                timeRange={timeRange}
                                onTimeRangeChange={handleTimeRangeChange}
                            />
                        )}
                        {activePage === 'liveData' && (
                            <LiveData
                                allExpanded={allExpanded}
                                onRefresh={handleRefreshAll}
                                onExpandAll={handleExpandAll}
                                sentryProps={sentryProps}
                                hubspotProps={hubspotProps}
                            />
                        )}
                    </Suspense>
                </Container>
                </Box>
            </Box>

            {/* Loading overlay for data operations */}
            <Backdrop 
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading && !error}
            >
                <Box textAlign="center">
                    <CircularProgress color="inherit" size={60} />
                    <Box mt={2} color="white">
                        Loading dashboard data...
                    </Box>
                </Box>
            </Backdrop>

            {/* Error notification */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" variant="filled">
                    {error || 'An error occurred while loading data'}
                </Alert>
            </Snackbar>

            {/* Performance indicator for filtering operations */}
            {isPending && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 2000,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <CircularProgress size={16} color="inherit" />
                    Filtering data...
                </Box>
            )}
        </Box>
    );
}

