/**
 * @fileoverview Navigation sidebar component for the dashboard.
 * 
 * Provides the main navigation interface with menu items for switching between
 * different dashboard pages (Overview and Live Data). Uses Material-UI drawer
 * component with persistent visibility and highlights the currently active page.
 */

import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { BarChart as BarChartIcon, Dashboard as DashboardIcon } from '@mui/icons-material';

const drawerWidth = 240;
const textContent = {
    sidebar: { overview: 'Overview', liveData: 'Live Data' },
};

export default function Sidebar({ activePage, onPageChange }) {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: 'rgba(248, 250, 252, 0.8)',
                    borderRight: '1px solid rgba(0, 0, 0, 0.08)'
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Typography variant="h5" sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>FN Dashboard</Typography>
            <Divider />
            <List>
                <ListItemButton selected={activePage === 'overview'} onClick={() => onPageChange('overview')}>
                    <ListItemIcon><BarChartIcon /></ListItemIcon><ListItemText primary={textContent.sidebar.overview} />
                </ListItemButton>
                <ListItemButton selected={activePage === 'liveData'} onClick={() => onPageChange('liveData')}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary={textContent.sidebar.liveData} />
                </ListItemButton>
            </List>
        </Drawer>
    );
}
