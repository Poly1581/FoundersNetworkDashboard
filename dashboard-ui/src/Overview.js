import React, { useMemo } from 'react';
import { Box, Typography, Card, CardContent, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SentryLineChart from './SentryLineChart';
import SentryPieChart from './SentryPieChart';
import SentryBarChart from './SentryBarChart';
import IntegrationStatusList from './IntegrationStatusList';
import SystemHealthCard from './SystemHealthCard';

const overviewCards = [
    {
        title: 'System Health',
        ContentComponent: SystemHealthCard
    },
];

const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

export default function Overview({ allIntegrations, allEventsForChart, timeRange, onTimeRangeChange }) {
    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>

            {/* Issue Trends Chart at the top */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" component="div">
                            Issue Trends
                        </Typography>
                        <ToggleButtonGroup
                            value={timeRange}
                            exclusive
                            onChange={(e, val) => onTimeRangeChange(val)}
                            aria-label="Time range"
                            size="small"
                        >
                            <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
                            <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
                            <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <SentryLineChart allEvents={allEventsForChart} timeRange={timeRange} />
                </CardContent>
            </Card>

            <Box sx={{
                flexGrow: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
            }}>
                <Card>
                    <CardContent>
                        <SentryPieChart allEvents={allEventsForChart} timeRange={timeRange} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <SentryBarChart allEvents={allEventsForChart} timeRange={timeRange} title="Endpoint Error Rates" />
                    </CardContent>
                </Card>

                <IntegrationStatusList integrations={allIntegrations} />

                {overviewCards.map(({ title, ContentComponent }, index) => (
                    <Card key={index}>
                        <CardContent>
                            <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                                {title}
                            </Typography>
                            <ContentComponent />
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

