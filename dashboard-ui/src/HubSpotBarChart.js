import React, { useMemo, useDeferredValue } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';
import { axisClasses } from '@mui/x-charts';

const COLORS = ['#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4'];

const MOCK_HUBSPOT_DATA = [
    { category: 'Contact Sync Error', offsetSeconds: -3600, count: 12 },
    { category: 'Deal Update Failed', offsetSeconds: -7200, count: 8 },
    { category: 'Pipeline Sync Error', offsetSeconds: -10800, count: 5 },
    { category: 'Property Mapping Error', offsetSeconds: -14400, count: 15 },
    { category: 'API Rate Limit', offsetSeconds: -18000, count: 3 },
    { category: 'Webhook Timeout', offsetSeconds: -21600, count: 7 },
    { category: 'Authentication Error', offsetSeconds: -25200, count: 2 },
    { category: 'Data Validation Error', offsetSeconds: -28800, count: 9 },
];

function processDataForBarChart(mockData, timeRange) {
    const maxSeconds = {
        '1d': 86400,
        '7d': 7 * 86400,
        '30d': 30 * 86400,
    }[timeRange];

    const categoryCounts = {};

    mockData.forEach(item => {
        if (item.offsetSeconds >= -maxSeconds) {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.count;
        }
    });

    const yAxisData = Object.keys(categoryCounts);
    const seriesData = yAxisData.map((category, index) => {
        const data = Array(yAxisData.length).fill(0);
        data[index] = categoryCounts[category];
        return {
            data,
            label: category,
            color: COLORS[index % COLORS.length],
            stack: 'total',
        };
    });

    return { yAxis: yAxisData, series: seriesData };
}

export default function HubSpotBarChart({ timeRange, title }) {
    const deferredTimeRange = useDeferredValue(timeRange);
    const chartData = useMemo(() => processDataForBarChart(MOCK_HUBSPOT_DATA, deferredTimeRange), [deferredTimeRange]);

    if (!chartData || !chartData.series || chartData.series.length === 0) {
        return <Typography>No data available for this time range.</Typography>;
    }

    return (
        <Box sx={{ width: '100%', height: 300, opacity: timeRange !== deferredTimeRange ? 0.6 : 1 }}>
            <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                {title}
            </Typography>
            <BarChart
                yAxis={[{ scaleType: 'band', data: chartData.yAxis }]}
                series={chartData.series.map(s => ({ ...s, valueFormatter: (value) => value === 0 ? null : value }))}
                layout="horizontal"
                slotProps={{
                    legend: { hidden: true },
                }}
                sx={{
                    [`.${axisClasses.left} .${axisClasses.label}`]: {
                        transform: 'translateX(-10px)',
                    },
                }}
            />
        </Box>
    );
}