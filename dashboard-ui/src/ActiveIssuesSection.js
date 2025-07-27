import React, { useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Collapse, CircularProgress, Link, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';

export default function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, textContent, selectedIssue }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssueForMenu, setSelectedIssueForMenu] = useState(null);

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

    const handleIgnore = () => {
        // TODO: Implement ignore functionality
        console.log('Ignore issue:', selectedIssueForMenu?.id);
        handleMenuClose();
    };

    const handleArchive = () => {
        // TODO: Implement archive functionality
        console.log('Archive issue:', selectedIssueForMenu?.id);
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
                                    backgroundColor: selectedIssue?.id === issue.id ? 'action.selected' : 'inherit',
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
                <MenuItem onClick={() => {
                    // TODO: Implement bookmark functionality
                    console.log('Bookmark issue:', selectedIssueForMenu?.id);
                    handleMenuClose();
                }}>
                    Bookmark
                </MenuItem>
                <MenuItem onClick={() => {
                    // TODO: Implement assign functionality
                    console.log('Assign issue:', selectedIssueForMenu?.id);
                    handleMenuClose();
                }}>
                    Assign
                </MenuItem>
            </Menu>
        </CollapsibleSection>
    );
}