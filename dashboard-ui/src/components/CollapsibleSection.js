/**
 * @fileoverview Reusable collapsible section component for organizing dashboard content.
 * 
 * A generic wrapper component that provides expand/collapse functionality for dashboard
 * sections. Features a clickable header with title and toggle icon, smooth animation
 * transitions, and configurable default open/closed state. Used throughout the dashboard
 * to organize and manage content visibility.
 */

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Collapse, IconButton } from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';

export default function CollapsibleSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} pb={0}>
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={() => setOpen(o => !o)} size="small">
                    {open ? <ArrowDownIcon /> : <ArrowRightIcon />}
                </IconButton>
            </Box>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CardContent>{children}</CardContent>
            </Collapse>
        </Card>
    );
}