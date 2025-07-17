import React, { useMemo, useDeferredValue } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';
import { axisClasses } from '@mui/x-charts';

const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

function processDataForBarChart(events, timeRange) {
    const maxSeconds = {
        '1d': 86400,
        '7d': 7 * 86400,
        '30d': 30 * 86400,
    }[timeRange];

    const categoryCounts = {};

    if (events) {
        events.forEach(event => {
            if (!event.issueCategory || event.offsetSeconds === undefined) return;

            if (event.offsetSeconds >= -maxSeconds) {
                categoryCounts[event.issueCategory] = (categoryCounts[event.issueCategory] || 0) + 1;
            }
        });
    }

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

export default function SentryBarChart({ allEvents, timeRange, title }) {
    const deferredTimeRange = useDeferredValue(timeRange);
    const chartData = useMemo(() => processDataForBarChart(allEvents, deferredTimeRange), [allEvents, deferredTimeRange]);

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
