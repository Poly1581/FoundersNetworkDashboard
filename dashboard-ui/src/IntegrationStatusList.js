import React from 'react';
import { Card, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';

const IntegrationStatusList = React.memo(({ integrations }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Integration Status</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Service</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Success</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {integrations.map((integration, index) => (
                                <TableRow key={index}>
                                    <TableCell>{integration.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={integration.status}
                                            color={integration.status === 'Healthy' ? 'success' : integration.status === 'Degraded' ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{integration.lastSuccess}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
});

export default IntegrationStatusList;
