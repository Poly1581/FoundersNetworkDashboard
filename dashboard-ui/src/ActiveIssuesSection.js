import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Collapse, CircularProgress, Link, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import { MoreVert as MoreVertIcon, Person as PersonIcon, PersonOff as PersonOffIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import { ignoreIssue, archiveIssue, bookmarkIssue, assignIssue, fetchSentryMembers } from './api';

export default function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, textContent, selectedIssue }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssueForMenu, setSelectedIssueForMenu] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [sentryMembers, setSentryMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);

    useEffect(() => {
        const loadSentryMembers = async () => {
            try {
                setMembersLoading(true);
                const members = await fetchSentryMembers();
                setSentryMembers(members);
            } catch (error) {
                console.error('Failed to fetch Sentry members:', error);
            } finally {
                setMembersLoading(false);
            }
        };

        loadSentryMembers();
    }, []);

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

    const handleAssignClick = () => {
        setAssignDialogOpen(true);
        handleMenuClose();
    };

    const handleAssignDialogClose = () => {
        setAssignDialogOpen(false);
    };

    const handleAssignToUser = async (userId) => {
        if (selectedIssueForMenu) {
            try {
                await assignIssue(selectedIssueForMenu.id, userId);
                console.log('Successfully assigned issue to user:', userId);
                // Optionally refresh the issues list or show success message
            } catch (error) {
                console.error('Failed to assign issue:', error);
                alert(`Failed to assign issue: ${error.message}`);
            }
        }
        setAssignDialogOpen(false);
    };

    const handleUnassign = async () => {
        if (selectedIssueForMenu) {
            try {
                await assignIssue(selectedIssueForMenu.id, null);
                console.log('Successfully unassigned issue:', selectedIssueForMenu.id);
            } catch (error) {
                console.error('Failed to unassign issue:', error);
                alert(`Failed to unassign issue: ${error.message}`);
            }
        }
        setAssignDialogOpen(false);
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
                <MenuItem onClick={handleAssignClick}>
                    Assign
                </MenuItem>
            </Menu>

            {/* Assignment Dialog */}
            <Dialog 
                open={assignDialogOpen} 
                onClose={handleAssignDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Assign Issue: {selectedIssueForMenu?.title}
                </DialogTitle>
                <DialogContent>
                    {membersLoading ? (
                        <Box display="flex" justifyContent="center" p={2}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {/* Unassign option */}
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleUnassign}>
                                    <ListItemIcon>
                                        <PersonOffIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Unassign" 
                                        secondary="Remove current assignment"
                                    />
                                </ListItemButton>
                            </ListItem>
                            
                            {/* Member list */}
                            {sentryMembers.map((member) => (
                                <ListItem key={member.id} disablePadding>
                                    <ListItemButton onClick={() => handleAssignToUser(member.id)}>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {member.name?.charAt(0) || <PersonIcon />}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={member.name} 
                                            secondary={member.email}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                            
                            {sentryMembers.length === 0 && !membersLoading && (
                                <ListItem>
                                    <ListItemText 
                                        primary="No members found" 
                                        secondary="Unable to load organization members"
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAssignDialogClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </CollapsibleSection>
    );
}