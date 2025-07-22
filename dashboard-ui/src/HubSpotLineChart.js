import React, { useMemo, useDeferredValue } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography } from '@mui/material';

const lineColors = [
  '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
  '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4'
];

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

function processDataForChart(mockData, timeRange = '30d') {
  const data = { x: [], total: [] };
  const issueCategories = [...new Set(mockData.map(e => e.category).filter(Boolean))];

  issueCategories.forEach(category => {
    data[category] = [];
  });

  const timeUnits = timeRange === '1d' ? 'hours' : 'days';
  const numBuckets = timeRange === '1d' ? 24 : (timeRange === '7d' ? 7 : 30);
  const maxSeconds = numBuckets * (timeUnits === 'hours' ? 3600 : 86400);

  for (let i = numBuckets - 1; i >= 0; i--) {
    data.x.push(-i);
    data.total.push(0);
    issueCategories.forEach(category => {
      data[category].push(0);
    });
  }

  mockData.forEach(item => {
    if (!item.category || item.offsetSeconds === undefined) return;

    const { offsetSeconds } = item;
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
      data.total[bucketIndex] += item.count;
      if (data[item.category]) {
        data[item.category][bucketIndex] += item.count;
      }
    }
  });

  const dynamicSeries = issueCategories
    .map((category, index) => ({
      dataKey: category,
      label: category,
      color: lineColors[index % lineColors.length],
      data: data[category],
    }))
    .filter(series => series.data.some(count => count > 0));

  const allSeries = [
    { dataKey: 'total', label: 'Total CRM Issues', color: '#ff6b35', data: data.total },
    ...dynamicSeries,
  ];

  return { chartData: data, series: allSeries };
}

const HubSpotLineChart = React.memo(({ timeRange }) => {
  const deferredTimeRange = useDeferredValue(timeRange);
  const { chartData, series } = useMemo(() => processDataForChart(MOCK_HUBSPOT_DATA, deferredTimeRange), [deferredTimeRange]);

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
        yAxis={[{ label: 'Issue Count' }]}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'top', horizontal: 'middle' },
          },
        }}
      />
    </Box>
  );
});

export default HubSpotLineChart;