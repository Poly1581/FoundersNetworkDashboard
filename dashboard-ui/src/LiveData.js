import React, { Suspense, useContext, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Card, CardContent } from '@mui/material';
import AppContext from './context/AppContext';
import SentrySection from './SentrySection';
import MailgunSection from './MailgunSection';

export default function LiveData({ sentryProps, mailgunProps, timeRange, onTimeRangeChange }) {
    const { state, setLiveDataFilter } = useContext(AppContext);
    const { liveDataFilter } = state;
    
    const hasData = sentryProps?.issues?.length > 0 || sentryProps?.integrations?.length > 0 || mailgunProps?.integrations?.length > 0;
    

    return (
        <Box sx={{ p: 3 }}>
            <Box mb={3}>
                <Typography variant="h4">Live System Data</Typography>
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
                            allExpanded={false}
                            liveDataFilter={liveDataFilter}
                            timeRange={timeRange}
                            onTimeRangeChange={onTimeRangeChange}
                        />
                    </Suspense>
                    <Suspense fallback={<CircularProgress />}>
                        <MailgunSection
                            {...mailgunProps}
                            allExpanded={false}
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