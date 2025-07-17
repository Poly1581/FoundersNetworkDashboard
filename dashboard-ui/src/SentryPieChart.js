import React, { useState, useMemo } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

// A simple color palette for the pie chart slices
const sliceColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

/**
 * Processes Sentry events to generate data for the pie chart.
 * @param {Array} events - An array of Sentry event objects with `offsetSeconds`.
 * @param {string} timeRange - The selected time range ('1d', '7d', or '30d').
 * @returns {Array} An array of objects formatted for the MUI Pie Chart.
 */
function processDataForPieChart(events, timeRange) {
  const maxSeconds = {
    '1d': 86400,
    '7d': 7 * 86400,
    '30d': 30 * 86400,
  }[timeRange];

  const issueCounts = {};

  if (events) {
    events.forEach(event => {
      if (!event.issueCategory || event.offsetSeconds === undefined) return;

      if (event.offsetSeconds >= -maxSeconds) {
        issueCounts[event.issueCategory] = (issueCounts[event.issueCategory] || 0) + 1;
      }
    });
  }

  return Object.entries(issueCounts).map(([category, count], index) => ({
    id: index,
    value: count,
    label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    color: sliceColors[index % sliceColors.length],
  }));
}

export default function SentryPieChart({ allEvents, timeRange: initialTimeRange }) {
  const [timeRange, setTimeRange] = useState(initialTimeRange || '7d');

  const handleTimeRangeChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const pieData = useMemo(() => processDataForPieChart(allEvents, timeRange), [allEvents, timeRange]);
  const totalIssues = pieData.reduce((sum, item) => sum + item.value, 0);
  const hasData = pieData.length > 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" component="div">
          Issues by Type
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="Time range"
          size="small"
        >
          <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
          <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
          <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box className="pie-chart-container">
        {hasData ? (
          <PieChart
            series={[{
              data: pieData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              arcLabel: (item) => `${item.value}`,
              innerRadius: 60, // Make space for the total in the center
            }]}
            height={250}
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
            transform: 'translate(calc(-50% - 61px), -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
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