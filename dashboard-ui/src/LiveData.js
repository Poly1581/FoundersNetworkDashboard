import React, { Suspense } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import SentrySection from './SentrySection';
import HubSpotSection from './HubSpotSection';

export default function LiveData() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>Live System Data</Typography>
            <Suspense fallback={<CircularProgress />}>
                <SentrySection />
            </Suspense>
            <Suspense fallback={<CircularProgress />}>
                <HubSpotSection />
            </Suspense>
        </Box>
    );
}
