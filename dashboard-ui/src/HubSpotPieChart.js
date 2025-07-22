import React, { useMemo, useDeferredValue } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';

const sliceColors = [
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

function processDataForPieChart(mockData, timeRange) {
  const maxSeconds = {
    '1d': 86400,
    '7d': 7 * 86400,
    '30d': 30 * 86400,
  }[timeRange];

  const issueCounts = {};

  mockData.forEach(item => {
    if (item.offsetSeconds >= -maxSeconds) {
      issueCounts[item.category] = (issueCounts[item.category] || 0) + item.count;
    }
  });

  return Object.entries(issueCounts).map(([category, count], index) => ({
    id: index,
    value: count,
    label: category,
    color: sliceColors[index % sliceColors.length],
  }));
}

export default function HubSpotPieChart({ timeRange }) {
  const deferredTimeRange = useDeferredValue(timeRange);

  const pieData = useMemo(() => processDataForPieChart(MOCK_HUBSPOT_DATA, deferredTimeRange), [deferredTimeRange]);
  const totalIssues = useMemo(() => pieData.reduce((sum, item) => sum + item.value, 0), [pieData]);
  const hasData = pieData.length > 0;

  return (
    <Box style={{ opacity: timeRange !== deferredTimeRange ? 0.6 : 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" component="div">
          CRM Issues by Type
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasData ? (
          <PieChart
            series={[{
              data: pieData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              arcLabel: (item) => `${item.value}`,
              innerRadius: 60,
            }]}
            height={250}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
                padding: 0,
                labelStyle: {
                  fontSize: 12,
                }
              },
            }}
          />
        ) : (
          <PieChart
            series={[{ data: [{ id: 0, value: 1, color: '#f0f0f0' }] }]}
            height={250}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            mt: -2.5
          }}
        >
          {hasData ? (
            <>
              <Typography component="div" variant="h6" sx={{ lineHeight: 1 }}>
                Total
              </Typography>
              <Typography component="div" variant="h4">
                {totalIssues}
              </Typography>
            </>
          ) : (
            <Typography sx={{ color: 'text.secondary' }}>No data</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}