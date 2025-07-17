import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Collapse } from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon } from '@mui/icons-material';
import FilterBar from './FilterBar';
import CollapsibleSection from './CollapsibleSection';

export default function RecentAlertsSection({ alerts, showFilter, toggleFilter, filter, onFilterChange, expandedAlertDetails, onViewAlertDetails, textContent }) {
    if (!alerts) return null;
    return (
        <CollapsibleSection title={textContent.heading}>
            <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
                <Button size="small" onClick={toggleFilter}>{textContent.filter}</Button>
                <Button size="small" onClick={() => onFilterChange({ status: '', level: '', date: '' })}>{textContent.viewAll}</Button>
            </Box>

            {showFilter && (
                <Box mb={2}>
                    <FilterBar filter={filter} onFilterChange={onFilterChange} />
                </Box>
            )}

            {alerts.length === 0 ? (
                <Typography>No recent alerts.</Typography>
            ) : (
                <List>
                    {alerts.map((a, i) => (
                        <React.Fragment key={i}>
                            <ListItem
                                secondaryAction={
                                    <Box>
                                        <Button size="small" onClick={() => onViewAlertDetails(i)}>{textContent.details}</Button>
                                    </Box>
                                }
                            >
                                {a.severity === 'Warning'
                                    ? <WarningIcon color="warning" sx={{ mr: 1 }} />
                                    : <ErrorIcon color="error" sx={{ mr: 1 }} />}
                                <ListItemText
                                    primary={a.message}
                                    secondary={`${a.time} — ${a.details}`}
                                />
                            </ListItem>
                            <Collapse in={expandedAlertDetails.includes(i)} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1, ml: 7 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Short ID: {a.originalIssue.shortId} | Culprit: {a.originalIssue.culprit} | Last Seen: {new Date(a.originalIssue.lastSeen).toLocaleString()} | Status: {a.originalIssue.status}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
            )}
        </CollapsibleSection>
    );
}