import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const textContent = {
    header: {
        title: 'Founders Network Dashboard',
        checkNow: 'Refresh All'
    }
};

export default function Header({ onRefresh, onExpandAll }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h4">{textContent.header.title}</Typography>
            <Box>
                <Button variant="outlined" onClick={onExpandAll} sx={{ mr: 1 }}>
                    Expand All
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} sx={{ mr: 1 }}>
                    {textContent.header.checkNow}
                </Button>
            </Box>
        </Box>
    );
}