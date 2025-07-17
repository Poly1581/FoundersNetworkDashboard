import React, { useMemo, useDeferredValue } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';

// A simple color palette for the dynamic lines
const lineColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

/**
 * Formats a duration in seconds into a human-readable "Xd:Yh" format.
 * @param {number} totalSeconds - The duration in seconds.
 * @returns {string} The formatted time string.
 */
function formatTimeAgo(totalSeconds) {
    if (totalSeconds < 60) return '< 1m';
    if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m`;
    
    const days = Math.floor(totalSeconds / 86400);
    const remainingHours = Math.floor((totalSeconds % 86400) / 3600);

    if (days > 0) {
        return `${days}d${remainingHours > 0 ? `:${remainingHours}h` : ''}`;
    }
    return `${remainingHours}h`;
}


/**
 * Processes raw Sentry events into a dynamic format for the MUI Line Chart.
 * @param {Array} events - An array of Sentry event objects with an `issueType` and `offsetSeconds`.
 * @param {string} timeRange - The selected time range ('1d', '7d', or '30d').
 * @returns {{chartData: Object, series: Array}} An object containing the data and series configuration.
 */
function processDataForChart(events, timeRange = '7d') {
  const data = { x: [], total: [] };
  const issueCategories = [...new Set(events.map(e => e.issueCategory).filter(Boolean))];

  // Initialize data structure with a key for each unique issue category
  issueCategories.forEach(category => {
    data[category] = [];
  });

  const timeUnits = timeRange === '1d' ? 'hours' : 'days';
  const numBuckets = timeRange === '1d' ? 24 : (timeRange === '7d' ? 7 : 30);
  const maxSeconds = numBuckets * (timeUnits === 'hours' ? 3600 : 86400);

  // Initialize time buckets and counts for each series
  for (let i = numBuckets - 1; i >= 0; i--) {
    data.x.push(-i);
    data.total.push(0);
    issueCategories.forEach(category => {
      data[category].push(0);
    });
  }

  if (!events || events.length === 0) {
    return { chartData: data, series: [] };
  }

  // Process each event and place it into the correct time bucket
  events.forEach(event => {
    if (!event.issueCategory || event.offsetSeconds === undefined) return;

    const { offsetSeconds } = event;
    if (offsetSeconds < -maxSeconds) return;

    let bucket;
    if (timeUnits === 'hours') {
      bucket = Math.floor(offsetSeconds / 3600);
    } else {
      bucket = Math.ceil(offsetSeconds / 86400);
      if (bucket > 0) bucket = 0;
    }

    const bucketIndex = data.x.indexOf(bucket);
    if (bucketIndex !== -1) {
      data.total[bucketIndex]++;
      if (data[event.issueCategory]) {
        data[event.issueCategory][bucketIndex]++;
      }
    }
  });

  // Create series configuration, filtering out empty ones
  const dynamicSeries = issueCategories
    .map((category, index) => ({
      dataKey: category,
      label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format category for display
      color: lineColors[index % lineColors.length],
      data: data[category],
    }))
    .filter(series => series.data.some(count => count > 0));

  const allSeries = [
    { dataKey: 'total', label: 'Total Issues', color: '#45b7d1', data: data.total },
    ...dynamicSeries,
  ];

  return { chartData: data, series: allSeries };
}

const SentryLineChart = React.memo(({ allEvents, timeRange }) => {
  const deferredTimeRange = useDeferredValue(timeRange);
  const { chartData, series } = useMemo(() => processDataForChart(allEvents, deferredTimeRange), [allEvents, deferredTimeRange]);

  if (!allEvents || allEvents.length === 0) {
    return <Typography>No event data available for the selected time range.</Typography>;
  }

  const xAxisFormatter = (value) => {
    if (value === 0) return deferredTimeRange === '1d' ? 'Now' : 'Today';
    const seconds = Math.abs(value) * (deferredTimeRange === '1d' ? 3600 : 86400);
    return formatTimeAgo(seconds);
  };

  return (
    <Box sx={{ width: '100%', height: 300, opacity: timeRange !== deferredTimeRange ? 0.6 : 1 }}>
      <LineChart
        xAxis={[{
          data: chartData.x,
          label: 'Time Ago',
          valueFormatter: xAxisFormatter,
        }]}
        series={series.map(s => ({
          data: s.data,
          label: s.label,
          color: s.color,
          showMark: false,
          curve: "monotoneX",
        }))}
        yAxis={[{ label: 'Event Count' }]}
        slotProps={{
          legend: {
            labelStyle: {
              fontWeight: 500,
              fontSize: 12,
            },
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            markGap: 5,
            itemGap: 10,
          },
        }}
      />
    </Box>
  );
});

export default SentryLineChart;
