import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Collapse, CircularProgress, Link } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';

export default function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, textContent }) {
    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map(issue => (
                        <React.Fragment key={issue.id}>
                            <TableRow>
                                <TableCell>{issue.title}</TableCell>
                                <TableCell>
                                    <Chip label={issue.status} size="small" color={issue.status === 'unresolved' ? 'error' : 'success'} />
                                </TableCell>
                                <TableCell align="right">
                                    {issue.status === 'unresolved' && (
                                        <Button size="small" onClick={() => onResolveIssue(issue.id)}>
                                            {textContent.resolveIssue}
                                        </Button>
                                    )}
                                    <Button size="small" startIcon={<InfoIcon />} onClick={() => onViewDetails(issue.id)}>
                                        {textContent.viewDetails}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                    <Collapse in={expandedRows.includes(issue.id)} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Event Details
                                            </Typography>
                                            {allEventsData[issue.id] ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Latest Event ID: <Link href={`${issue.permalink}events/${allEventsData[issue.id][0].id}/`} target="_blank" rel="noopener">{allEventsData[issue.id][0].id}</Link>
                                                    {allEventsData[issue.id][0].message && ` | Message: ${allEventsData[issue.id][0].message}`}
                                                    {' | Timestamp: '}{new Date(allEventsData[issue.id][0].dateCreated).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            )}
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}