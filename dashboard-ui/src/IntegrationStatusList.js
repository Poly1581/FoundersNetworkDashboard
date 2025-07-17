import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Chip, Typography, Box } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

const statusIcons = {
  Healthy: <CheckCircle color="success" />,
  Degraded: <Warning color="warning" />,
  Down: <Error color="error" />,
};

const statusColors = {
  Healthy: 'success',
  Degraded: 'warning',
  Down: 'error',
};

export default function IntegrationStatusList({ integrations }) {
  if (!integrations || integrations.length === 0) {
    return <Typography>No integration data available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" component="div" sx={{ textAlign: 'center', mb: 1 }}>
        Integration Status
      </Typography>
      <List dense>
        {integrations.map((integration, index) => (
          <ListItem key={index} divider>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {statusIcons[integration.status] || <Error color="disabled" />}
            </ListItemIcon>
            <ListItemText
              primary={integration.name}
              secondary={integration.category}
            />
            <Chip
              label={integration.status}
              color={statusColors[integration.status] || 'default'}
              size="small"
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
