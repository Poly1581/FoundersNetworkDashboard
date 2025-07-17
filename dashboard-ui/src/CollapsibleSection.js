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