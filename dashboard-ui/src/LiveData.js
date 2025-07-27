import React, { Suspense, useContext, useCallback, useState } from 'react';
import { Box, Typography, Button, CircularProgress, ToggleButtonGroup, ToggleButton, Paper, Card, CardContent } from '@mui/material';
import AppContext from './context/AppContext';
import SentrySection from './SentrySection';
import HubSpotSection from './HubSpotSection';

const LIVE_DATA_FILTERS = [
    { value: '1h', label: '1 hr' },
    { value: '4h', label: '4 hr' },
    { value: '12h', label: '12 hr' },
    { value: '24h', label: '24 hr' },
    { value: '7d', label: '1 wk' },
    { value: 'all', label: 'All' }
];

export default function LiveData({ allExpanded, onRefresh, onExpandAll, sentryProps, hubspotProps, timeRange, onTimeRangeChange }) {
    const { state, setLiveDataFilter } = useContext(AppContext);
    const { liveDataFilter } = state;
    
    const hasData = sentryProps?.issues?.length > 0 || sentryProps?.integrations?.length > 0 || hubspotProps?.integrations?.length > 0;
    
    const handleFilterChange = useCallback((event, newFilter) => {
        if (newFilter !== null) {
            setLiveDataFilter(newFilter);
        }
    }, [setLiveDataFilter]);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Live System Data</Typography>
                
                <Box display="flex" gap={2} alignItems="center">
                    <Paper elevation={1} sx={{ p: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                            Alert Filter:
                        </Typography>
                        <ToggleButtonGroup
                            value={liveDataFilter}
                            exclusive
                            onChange={handleFilterChange}
                            aria-label="Live data filter"
                            size="small"
                        >
                            {LIVE_DATA_FILTERS.map(({ value, label }) => (
                                <ToggleButton key={value} value={value} aria-label={label}>
                                    {label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Paper>
                    
                    <Button 
                        variant="outlined" 
                        onClick={onExpandAll}
                        sx={{ minWidth: 'auto' }}
                    >
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        onClick={onRefresh}
                        sx={{ minWidth: 'auto' }}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {!hasData && (
                <Card sx={{ mb: 3, textAlign: 'center', p: 4 }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Live Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click the "Check Now" button in the header to load system data and alerts.
                        </Typography>
                    </CardContent>
                </Card>
            )}
            
            {hasData && (
                <>
                    <Suspense fallback={<CircularProgress />}>
                        <SentrySection 
                            {...sentryProps}
                            allExpanded={allExpanded}
                            liveDataFilter={liveDataFilter}
                            timeRange={timeRange}
                            onTimeRangeChange={onTimeRangeChange}
                        />
                    </Suspense>
                    <Suspense fallback={<CircularProgress />}>
                        <HubSpotSection 
                            {...hubspotProps}
                            allExpanded={allExpanded}
                            liveDataFilter={liveDataFilter}
                            timeRange={timeRange}
                            onTimeRangeChange={onTimeRangeChange}
                        />
                    </Suspense>
                </>
            )}
        </Box>
    );
}
