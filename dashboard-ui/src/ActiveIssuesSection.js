import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon, Person as PersonIcon, PersonOff as PersonOffIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import { ignoreIssue, archiveIssue, bookmarkIssue, assignIssue, unassignIssue, fetchSentryMembers } from './api';
import AppContext from './context/AppContext';
import { getConsistentColorForCategory } from './utils/colorScheme';

export default function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, setExpandedRows, textContent, selectedIssue, highlightedIssueType, investigationContext }) {
    const { loadSentryData } = useContext(AppContext);
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

    const getRowColorForIssue = (issue, status) => {
        // Check if this issue should be highlighted from investigation
        const issueType = issue.metadata?.type || issue.type;
        const isHighlighted = highlightedIssueType && issueType === highlightedIssueType;
        
        if (isHighlighted) {
            return '#fff3cd'; // warm yellow highlight
        }
        
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
                console.log('Assigning issue:', selectedIssueForMenu.id, 'to user:', userId);
                const response = await assignIssue(selectedIssueForMenu.id, userId);
                console.log('Assignment response:', response);
                console.log('Successfully assigned issue to user:', userId);
                
                // Wait a moment then refresh the context data to get updated assignment info
                setTimeout(() => {
                    console.log('Refreshing data after assignment...');
                    loadSentryData();
                }, 1000);
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
                console.log('Unassigning issue:', selectedIssueForMenu.id);
                const response = await unassignIssue(selectedIssueForMenu.id);
                console.log('Unassignment response:', response);
                console.log('Successfully unassigned issue:', selectedIssueForMenu.id);
                
                // Wait a moment then refresh the context data to get updated assignment info
                setTimeout(() => {
                    console.log('Refreshing data after unassignment...');
                    loadSentryData();
                }, 1000);
            } catch (error) {
                console.error('Failed to unassign issue:', error);
                alert(`Failed to unassign issue: ${error.message}`);
            }
        }
        setAssignDialogOpen(false);
    };

    // Helper function to get assignee display info
    const getAssigneeInfo = (issue) => {
        const assignee = issue.assignedTo || issue.assignee;
        if (!assignee) return null;
        
        // Handle different assignee data structures
        if (typeof assignee === 'string') return assignee;
        if (assignee.name) return assignee.name;
        if (assignee.email) return assignee.email;
        if (assignee.username) return assignee.username;
        return 'Assigned';
    };


    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map(issue => (
                        <React.Fragment key={issue.id}>
                            <TableRow 
                                hover
                                data-issue-id={issue.id}
                                sx={{ 
                                    cursor: 'pointer',
                                    backgroundColor: selectedIssue?.id === issue.id ? 'action.selected' : getRowColorForIssue(issue, issue.status),
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => {
                                    onViewDetails(issue.id);
                                    // Toggle expansion
                                    if (expandedRows.includes(issue.id)) {
                                        setExpandedRows(prev => prev.filter(id => id !== issue.id));
                                    } else {
                                        setExpandedRows(prev => [...prev, issue.id]);
                                    }
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: selectedIssue?.id === issue.id ? 'bold' : 'normal',
                                                color: selectedIssue?.id === issue.id ? 'primary.main' : 'inherit'
                                            }}
                                        >
                                            {issue.title}
                                        </Typography>
                                        {(() => {
                                            const issueType = issue.metadata?.type || issue.type || 'Unknown Error';
                                            const typeColor = getConsistentColorForCategory(issueType);
                                            return (
                                                <Chip
                                                    label={issueType}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: typeColor,
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        height: '20px',
                                                        '& .MuiChip-label': {
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}
                                    </Box>
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
                                <TableCell>
                                    {(() => {
                                        const assigneeInfo = getAssigneeInfo(issue);
                                        return assigneeInfo ? (
                                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                                                {assigneeInfo}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Unassigned
                                            </Typography>
                                        );
                                    })()}
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
                            {expandedRows.includes(issue.id) && (
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
                                                Issue Details
                                            </Typography>
                                            
                                            {/* Main issue information grid */}
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>ID:</strong> <span style={{ color: '#666' }}>{issue.shortId || issue.id}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Status:</strong> <span style={{ color: issue.status === 'unresolved' ? '#d32f2f' : '#2e7d32' }}>{issue.status}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Level:</strong> <span style={{ color: issue.level === 'error' ? '#d32f2f' : issue.level === 'warning' ? '#ed6c02' : '#666' }}>{issue.level}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Count:</strong> <span style={{ color: '#666' }}>{issue.count || 'N/A'}</span>
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>First Seen:</strong> <span style={{ color: '#666' }}>{issue.firstSeen ? new Date(issue.firstSeen).toLocaleString() : 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Last Seen:</strong> <span style={{ color: '#666' }}>{issue.lastSeen ? new Date(issue.lastSeen).toLocaleString() : 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Platform:</strong> <span style={{ color: '#666' }}>{issue.platform || 'node'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Project:</strong> <span style={{ color: '#666' }}>{issue.project?.name || 'javascript-react'}</span>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Error message section */}
                                            {(issue.title || issue.metadata?.message) && (
                                                <Box sx={{ 
                                                    backgroundColor: '#f5f5f5', 
                                                    p: 2, 
                                                    borderRadius: 1, 
                                                    mb: 2,
                                                    border: '1px solid #e0e0e0'
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        Error Message:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        fontFamily: 'monospace', 
                                                        color: '#d32f2f',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {issue.title || issue.metadata?.message}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Location/Culprit section */}
                                            {issue.culprit && (
                                                <Box sx={{ 
                                                    backgroundColor: '#f5f5f5', 
                                                    p: 2, 
                                                    borderRadius: 1, 
                                                    mb: 2,
                                                    border: '1px solid #e0e0e0'
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        Location:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        fontFamily: 'monospace',
                                                        color: '#666',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {issue.culprit}
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
                                                {/* Assignee Information */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 1,
                                                    pb: 1,
                                                    borderBottom: '1px solid #f0f0f0'
                                                }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        Assigned to:
                                                    </Typography>
                                                    {(() => {
                                                        const assigneeInfo = getAssigneeInfo(issue);
                                                        return assigneeInfo ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                                    {assigneeInfo.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                                                                    {assigneeInfo}
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                                Unassigned
                                                            </Typography>
                                                        );
                                                    })()}
                                                </Box>
                                                
                                                {/* Action Buttons */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexWrap: 'wrap',
                                                    gap: 1
                                                }}>
                                                {issue.permalink && (
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        href={issue.permalink} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        VIEW IN SENTRY
                                                    </Button>
                                                )}
                                                {issue.status === 'unresolved' && (
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onResolveIssue(issue.id);
                                                        }}
                                                        color="success"
                                                    >
                                                        Resolve Issue
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await ignoreIssue(issue.id);
                                                            console.log('Successfully ignored issue:', issue.id);
                                                        } catch (error) {
                                                            console.error('Failed to ignore issue:', error);
                                                            alert(`Failed to ignore issue: ${error.message}`);
                                                        }
                                                    }}
                                                    color="warning"
                                                >
                                                    Ignore
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await archiveIssue(issue.id);
                                                            console.log('Successfully archived issue:', issue.id);
                                                        } catch (error) {
                                                            console.error('Failed to archive issue:', error);
                                                            alert(`Failed to archive issue: ${error.message}`);
                                                        }
                                                    }}
                                                    color="secondary"
                                                >
                                                    Archive
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await bookmarkIssue(issue.id);
                                                            console.log('Successfully bookmarked issue:', issue.id);
                                                        } catch (error) {
                                                            console.error('Failed to bookmark issue:', error);
                                                            alert(`Failed to bookmark issue: ${error.message}`);
                                                        }
                                                    }}
                                                    color="info"
                                                >
                                                    Bookmark
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedIssueForMenu(issue);
                                                        setAssignDialogOpen(true);
                                                    }}
                                                    color="primary"
                                                >
                                                    {(() => {
                                                        const assigneeInfo = getAssigneeInfo(issue);
                                                        return assigneeInfo ? `Reassign (${assigneeInfo})` : 'Assign Issue';
                                                    })()}
                                                </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
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
                    <Box>
                        <Typography variant="body2">
                            Assign Issue
                        </Typography>
                        {selectedIssueForMenu && (() => {
                            const assigneeInfo = getAssigneeInfo(selectedIssueForMenu);
                            return assigneeInfo ? (
                                <Typography variant="caption" color="text.secondary">
                                    Currently: {assigneeInfo}
                                </Typography>
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    Currently: Unassigned
                                </Typography>
                            );
                        })()}
                    </Box>
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
                                    <ListItemButton onClick={() => handleAssignToUser(member.user?.id || member.id)}>
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