import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';

export default function IntegrationCard({ title, children, icon }) {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {icon && (
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                            {icon}
                        </Box>
                    )}
                    <Typography variant="h5" component="div">
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {children}
            </CardContent>
        </Card>
    );
}