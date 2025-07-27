import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Collapse } from '@mui/material';
import CollapsibleSection from './CollapsibleSection';

export default function IntegrationDetailsSection({ integrations, textContent, onAndViewDetails, expandedIntegrations }) {
    if (!integrations) return null;
    return (
        <CollapsibleSection title={textContent.heading}>
            {integrations.length === 0 ? <Typography>No integration data.</Typography> :
                <Table sx={{ mb: 4 }}>
                    <TableHead>
                        <TableRow>
                            {Object.values(textContent.columns).map(col => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integrations.map((i, index) => (
                            <React.Fragment key={i.name}>
                                <TableRow>
                                    <TableCell>{i.name}</TableCell>
                                    <TableCell>{i.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={i.status}
                                            color={i.status === 'Healthy' ? 'success' : i.status === 'Degraded' ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{i.responseTime}</TableCell>
                                    <TableCell>{i.lastSuccess}</TableCell>
                                    <TableCell>{i.uptime}</TableCell>
                                    <TableCell>{i.issue || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => onAndViewDetails(index)}>{textContent.viewDetails}</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                        <Collapse in={expandedIntegrations.includes(index)} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Integration Details
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Service: {i.name} | Category: {i.category} | Status: {i.status} | Response Time: {i.responseTime} | Last Success: {i.lastSuccess} | Uptime: {i.uptime} | Issue: {i.issue || '—'}
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>}
        </CollapsibleSection>
    );
}