import React, { useState } from 'react';
import { Box, Typography, Chip, Menu, MenuItem, Button } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

const SystemHealthCard = React.memo(({ name, status, responseTime, lastSuccess, uptime, issue }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const activeAlerts = [
        { id: 1, title: 'Database Connection Timeout', severity: 'High', time: '2 mins ago' },
        { id: 2, title: 'API Rate Limit Exceeded', severity: 'Medium', time: '5 mins ago' },
        { id: 3, title: 'Memory Usage Above 85%', severity: 'Low', time: '10 mins ago' }
    ];

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ textAlign: 'left', width: '100%', mt: 2, p: 1 }}>
            <Typography>Overall Uptime (30d): <Chip component="strong" label="99.8%" color="success" size="small" /></Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Active Alerts:</Typography>
                <Button
                    onClick={handleClick}
                    size="small"
                    sx={{
                        minWidth: 'auto',
                        color: 'error.main',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        p: 0.5,
                        fontSize: '1.2rem'
                    }}
                    endIcon={<ArrowDropDownIcon />}
                >
                    3
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            'aria-labelledby': 'basic-button',
                        }
                    }}
                >
                    {activeAlerts.map((alert) => (
                        <MenuItem key={alert.id} onClick={handleClose}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {alert.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {alert.severity} • {alert.time}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            <Typography sx={{ mt: 1 }}>Last Full Check: <strong>a few seconds ago</strong></Typography>
        </Box>
    );
});

export default SystemHealthCard;
