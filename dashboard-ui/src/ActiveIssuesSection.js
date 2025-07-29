import React, { useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Collapse, CircularProgress, Link, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import { ignoreIssue, archiveIssue, bookmarkIssue, assignIssue } from './api';

export default function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, textContent, selectedIssue }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssueForMenu, setSelectedIssueForMenu] = useState(null);

    const getRowColorForIssue = (status) => {
        switch (status) {
            case 'unresolved':
                return '#ffebee'; // light red
            case 'resolved':
                return '#e8f5e8'; // light green
            default:
                return 'inherit';
        }
    };

    const handleMenuClick = (event, issue) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedIssueForMenu(issue);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedIssueForMenu(null);
    };

    const handleResolve = () => {
        if (selectedIssueForMenu) {
            onResolveIssue(selectedIssueForMenu.id);
        }
        handleMenuClose();
    };

    const handleIgnore = async () => {
        if (selectedIssueForMenu) {
            try {
                await ignoreIssue(selectedIssueForMenu.id);
                console.log('Successfully ignored issue:', selectedIssueForMenu.id);
            } catch (error) {
                console.error('Failed to ignore issue:', error);
                alert(`Failed to ignore issue: ${error.message}`);
            }
        }
        handleMenuClose();
    };

    const handleArchive = async () => {
        if (selectedIssueForMenu) {
            try {
                await archiveIssue(selectedIssueForMenu.id);
                console.log('Successfully archived issue:', selectedIssueForMenu.id);
            } catch (error) {
                console.error('Failed to archive issue:', error);
                alert(`Failed to archive issue: ${error.message}`);
            }
        }
        handleMenuClose();
    };
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
                            <TableRow 
                                hover
                                sx={{ 
                                    cursor: 'pointer',
                                    backgroundColor: selectedIssue?.id === issue.id ? 'action.selected' : getRowColorForIssue(issue.status),
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => onViewDetails(issue.id)}
                            >
                                <TableCell>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: selectedIssue?.id === issue.id ? 'bold' : 'normal',
                                            color: selectedIssue?.id === issue.id ? 'primary.main' : 'inherit'
                                        }}
                                    >
                                        {issue.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={issue.status} 
                                        size="small" 
                                        color={issue.status === 'unresolved' ? 'error' : 'success'} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(issue.id);
                                        }}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button 
                                        size="small" 
                                        startIcon={<MoreVertIcon />} 
                                        onClick={(e) => handleMenuClick(e, issue)}
                                        variant="outlined"
                                    >
                                        Actions
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
            
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedIssueForMenu?.status === 'unresolved' && (
                    <MenuItem onClick={handleResolve}>
                        Resolve Issue
                    </MenuItem>
                )}
                <MenuItem onClick={handleIgnore}>
                    Ignore
                </MenuItem>
                <MenuItem onClick={handleArchive}>
                    Archive
                </MenuItem>
                <MenuItem onClick={async () => {
                    if (selectedIssueForMenu) {
                        try {
                            await bookmarkIssue(selectedIssueForMenu.id);
                            console.log('Successfully bookmarked issue:', selectedIssueForMenu.id);
                        } catch (error) {
                            console.error('Failed to bookmark issue:', error);
                            alert(`Failed to bookmark issue: ${error.message}`);
                        }
                    }
                    handleMenuClose();
                }}>
                    Bookmark
                </MenuItem>
                <MenuItem onClick={async () => {
                    if (selectedIssueForMenu) {
                        try {
                            await assignIssue(selectedIssueForMenu.id, 'current-user');
                            console.log('Successfully assigned issue:', selectedIssueForMenu.id);
                        } catch (error) {
                            console.error('Failed to assign issue:', error);
                            alert(`Failed to assign issue: ${error.message}`);
                        }
                    }
                    handleMenuClose();
                }}>
                    Assign
                </MenuItem>
            </Menu>
        </CollapsibleSection>
    );
}