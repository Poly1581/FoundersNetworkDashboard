import React, { useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Avatar } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import { getSentryDashboardUrl } from './api';

export default function IntegrationDetailsSection({ integrations, textContent, onAndViewDetails, expandedIntegrations }) {
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    if (!integrations) return null;

    const getRowColor = (status) => {
        switch (status) {
            case 'Healthy':
                return '#e8f5e8'; // light green
            case 'Degraded':
                return '#fff3e0'; // light orange
            case 'Down':
                return '#ffebee'; // light red
            default:
                return 'inherit';
        }
    };

    const handleViewDetails = (index) => {
        const integration = integrations[index];
        if (selectedIntegration?.name === integration.name) {
            setSelectedIntegration(null);
        } else {
            setSelectedIntegration(integration);
        }
        onAndViewDetails(index);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Healthy':
                return '#2e7d32';
            case 'Degraded':
                return '#ed6c02';
            case 'Down':
                return '#d32f2f';
            default:
                return '#666';
        }
    };

    // Handler functions for Sentry integration buttons
    const handleViewDashboard = async (e, integration) => {
        e.stopPropagation();
        try {
            if (integration.name.toLowerCase().includes('sentry')) {
                const url = await getSentryDashboardUrl();
                window.open(url, '_blank');
            } else {
                // Fallback for other integrations
                window.open('#', '_blank');
            }
        } catch (error) {
            console.error('Failed to open dashboard:', error);
            alert('Failed to open dashboard. Please try again.');
        }
    };




    return (
        <>
            <CollapsibleSection title={textContent.heading}>
            {integrations.length === 0 ? <Typography>No integration data.</Typography> :
                <Table sx={{ mb: 4 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Service</TableCell>
                            <TableCell align="center">Category</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integrations.map((integration, index) => (
                            <React.Fragment key={integration.name || index}>
                                <TableRow 
                                    hover
                                    sx={{ 
                                        cursor: 'pointer',
                                        backgroundColor: selectedIntegration?.name === integration.name ? 'action.selected' : getRowColor(integration.status),
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                    onClick={() => handleViewDetails(index)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: selectedIntegration?.name === integration.name ? 'bold' : 'normal',
                                                    color: selectedIntegration?.name === integration.name ? 'primary.main' : 'inherit'
                                                }}
                                            >
                                                {integration.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={integration.category}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={integration.status}
                                            color={integration.status === 'Healthy' ? 'success' : integration.status === 'Degraded' ? 'warning' : 'error'}
                                            size="small"
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                    </TableCell>
                                </TableRow>
                                {expandedIntegrations.includes(index) && (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ backgroundColor: '#f8f9fa', py: 3, px: 3 }}>
                                            <Box sx={{ 
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 2,
                                                backgroundColor: 'white',
                                                p: 3
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ 
                                                    color: 'primary.main', 
                                                    fontWeight: 600,
                                                    borderBottom: '2px solid #e0e0e0',
                                                    pb: 1,
                                                    mb: 2
                                                }}>
                                                    Integration Details
                                                </Typography>
                                                
                                                {/* Main integration information grid */}
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Service:</strong> <span style={{ color: '#666' }}>{integration.name}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Category:</strong> <span style={{ color: '#666' }}>{integration.category}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Status:</strong> <span style={{ color: getStatusColor(integration.status) }}>{integration.status}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Response Time:</strong> <span style={{ color: '#666' }}>{integration.responseTime}</span>
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Last Success:</strong> <span style={{ color: '#666' }}>{integration.lastSuccess}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Uptime:</strong> <span style={{ color: '#666' }}>{integration.uptime}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Error Rate:</strong> <span style={{ color: integration.issue ? '#d32f2f' : '#2e7d32' }}>{integration.issue || 'None'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Health Score:</strong> <span style={{ color: integration.status === 'Healthy' ? '#2e7d32' : integration.status === 'Degraded' ? '#ed6c02' : '#d32f2f' }}>
                                                                {integration.status === 'Healthy' ? '100%' : integration.status === 'Degraded' ? '75%' : '25%'}
                                                            </span>
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Status details section */}
                                                <Box sx={{ 
                                                    backgroundColor: '#f5f5f5', 
                                                    p: 2, 
                                                    borderRadius: 1, 
                                                    mb: 2,
                                                    border: '1px solid #e0e0e0'
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        Service Health:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        color: getStatusColor(integration.status),
                                                        fontWeight: 500
                                                    }}>
                                                        {integration.status === 'Healthy' && 'All systems operational. Service is responding normally.'}
                                                        {integration.status === 'Degraded' && 'Service is experiencing some issues but remains functional.'}
                                                        {integration.status === 'Down' && 'Service is currently unavailable or experiencing critical issues.'}
                                                    </Typography>
                                                </Box>

                                                {/* Issue details section */}
                                                {integration.issue && (
                                                    <Box sx={{ 
                                                        backgroundColor: '#ffebee', 
                                                        p: 2, 
                                                        borderRadius: 1, 
                                                        mb: 2,
                                                        border: '1px solid #ffcdd2'
                                                    }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: '#d32f2f' }}>
                                                            Current Issues:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#d32f2f',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {integration.issue}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Actions section */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    gap: 2, 
                                                    mt: 3,
                                                    pt: 2,
                                                    borderTop: '1px solid #e0e0e0'
                                                }}>
                                                    {/* Action Buttons */}
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        flexWrap: 'wrap',
                                                        gap: 1
                                                    }}>
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            startIcon={<LinkIcon />}
                                                            onClick={(e) => handleViewDashboard(e, integration)}
                                                        >
                                                            VIEW DASHBOARD
                                                        </Button>
                                                        {integration.status === 'Down' && (
                                                            <Button 
                                                                variant="outlined" 
                                                                size="small" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Restart service
                                                                    console.log('Restarting service:', integration.name);
                                                                }}
                                                                color="warning"
                                                            >
                                                                Restart Service
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>}
            </CollapsibleSection>
            
        </>
    );
}