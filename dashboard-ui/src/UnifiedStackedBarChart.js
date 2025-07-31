import React, { useMemo, useState, useCallback, useEffect, useContext } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, List, ListItem, Divider,
    IconButton, Button, Menu, MenuItem, CircularProgress, FormControl, InputLabel, Select, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, ListItemButton, ListItemIcon, Avatar
} from '@mui/material';
import { Close as CloseIcon, MoreVert as MoreVertIcon, Person as PersonIcon, PersonOff as PersonOffIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { resolveIssue, ignoreIssue, archiveIssue, bookmarkIssue, assignIssue, unassignIssue, fetchSentryMembers } from './api';
import AppContext from './context/AppContext';
import { SET_ACTIVE_PAGE } from './context/AppReducer';
import { generateAppearanceMaps, DEFAULT_FALLBACK_COLOR } from './utils/colorScheme';

// --- Helper Functions ---

const createTimeBuckets = (timeRange, allEvents = []) => {
    const now = new Date();
    let startTime, bucketSize;

    if (timeRange === 'all') {
        if (allEvents.length === 0) return { buckets: new Map(), bucketSize: 0, startTime: now };
        startTime = allEvents.reduce((earliest, event) => {
            const eventTime = new Date(event.dateCreated || event.timestamp || event.lastSeen);
            return eventTime < earliest ? eventTime : earliest;
        }, new Date());

        const durationDays = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
        if (durationDays <= 2) bucketSize = 2 * 60 * 60 * 1000;
        else if (durationDays <= 14) bucketSize = 24 * 60 * 60 * 1000;
        else if (durationDays <= 90) bucketSize = 7 * 24 * 60 * 60 * 1000;
        else bucketSize = 30 * 24 * 60 * 60 * 1000;

    } else {
        let timeRangeMs;
        switch (timeRange) {
            case '1d': timeRangeMs = 24 * 36e5; bucketSize = 2 * 36e5; break;
            case '7d': timeRangeMs = 7 * 24 * 36e5; bucketSize = 12 * 36e5; break;
            case '90d': timeRangeMs = 90 * 24 * 36e5; bucketSize = 24 * 36e5; break;
            default: timeRangeMs = 30 * 24 * 36e5; bucketSize = 24 * 36e5; break;
        }
        startTime = new Date(now.getTime() - timeRangeMs);
    }

    const buckets = new Map();
    for (let time = startTime.getTime(); time <= now.getTime(); time += bucketSize) {
        const bucketKey = Math.floor(time / bucketSize) * bucketSize;
        buckets.set(bucketKey, { timestamp: new Date(bucketKey) });
    }
    return { buckets, bucketSize, startTime };
};

// --- Sub-Components ---

const ChartControls = React.memo(({ selectedAPI, onApiChange, sortedErrorTypeButtons, selectedErrorTypes, onClearSelection, onToggleErrorType, onErrorTypeClick, colorMap, errorTypeCounts, totalCount }) => (
    <Box mb={2}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>API</InputLabel>
                <Select value={selectedAPI} label="API" onChange={onApiChange}>
                    <MenuItem value="sentry">Sentry</MenuItem>
                    <MenuItem value="mailgun">Mailgun</MenuItem>
                </Select>
            </FormControl>
            {(totalCount || 0) > 0 && (
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Total: {totalCount || 0}
                </Typography>
            )}
            {selectedErrorTypes.size > 0 && (
                <Button size="small" variant="outlined" onClick={onClearSelection} sx={{ minWidth: 'auto', px: 1 }}>Clear All</Button>
            )}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>Error Types:</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            {sortedErrorTypeButtons.map(errorType => {
                const buttonColor = colorMap[errorType] || DEFAULT_FALLBACK_COLOR;
                const isSelected = selectedErrorTypes.has(errorType);
                const count = errorTypeCounts?.[errorType] || 0;
                const label = count > 0 ? `${errorType} (${count})` : errorType;
                return (
                    <Chip
                        key={errorType}
                        label={label}
                        onClick={(event) => onToggleErrorType(errorType, event)}
                        onDoubleClick={() => onErrorTypeClick && onErrorTypeClick(errorType)}
                        size="small"
                        sx={{
                            cursor: 'pointer',
                            backgroundColor: isSelected ? buttonColor : 'transparent',
                            color: isSelected ? 'white' : buttonColor,
                            border: `2px solid ${buttonColor}`,
                            fontWeight: isSelected ? 'bold' : 'normal',
                            '&:hover': { backgroundColor: buttonColor, color: 'white', opacity: 0.9 },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    />
                );
            })}
        </Box>
    </Box>
));

const InvestigationPanel = React.memo(({ data, colorMap, onClose }) => {
    const { dispatch } = useContext(AppContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEventForMenu, setSelectedEventForMenu] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [sentryMembers, setSentryMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState({ open: false, action: '', title: '', message: '' });

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
    
    if (!data) return null;
    
    const { api, errorType, events, bucketStart, bucketEnd, isGlobalFilter, sentryCount, mailgunCount } = data;
    const panelColor = colorMap[errorType] || DEFAULT_FALLBACK_COLOR;
    const relevantEvents = events.filter(event => {
        const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
        if (eventType !== errorType) return false;
        
        // For time-specific buckets, only include events within the time range
        if (!isGlobalFilter && bucketStart && bucketEnd) {
            const eventTime = new Date(event.dateCreated || event.timestamp || event.lastSeen);
            return eventTime >= bucketStart && eventTime < bucketEnd;
        }
        
        // For global filters, include all events of this type
        return true;
    });
    
    console.log('Investigation Panel Data:', { 
        api, 
        errorType, 
        totalEvents: events.length, 
        relevantEventsAfterFiltering: relevantEvents.length,
        timeRange: isGlobalFilter ? 'Global (all time)' : `${bucketStart?.toLocaleString()} - ${bucketEnd?.toLocaleString()}`,
        isGlobalFilter
    });

    const handleMenuClick = (event, eventItem) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedEventForMenu(eventItem);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedEventForMenu(null);
    };

    const showConfirmationDialog = (action, title, message) => {
        setConfirmationDialog({ open: true, action, title, message });
        handleMenuClose();
    };

    const handleConfirmationClose = () => {
        setConfirmationDialog({ open: false, action: '', title: '', message: '' });
    };

    const executeConfirmedAction = () => {
        const { action } = confirmationDialog;
        handleConfirmationClose();
        
        switch (action) {
            case 'resolve':
                executeResolve();
                break;
            case 'ignore':
                executeIgnore();
                break;
            case 'archive':
                executeArchive();
                break;
            case 'bookmark':
                executeBookmark();
                break;
            default:
                break;
        }
    };

    // Helper function to extract issue IDs from events
    const getValidEventsWithIssueIds = (events) => {
        return events.map(event => {
            // In Sentry, groupID is the issue ID, id is the event ID
            // The API expects issue IDs, not event IDs
            const issueId = event.groupID || event.issueId || event.originalIssue?.id || event.id || event.shortId;
            return issueId ? { ...event, resolveId: issueId } : null;
        }).filter(Boolean);
    };

    // Helper function to get assignee display info
    const getAssigneeInfo = (event) => {
        const assignee = event.assignedTo || event.assignee || event.originalIssue?.assignedTo;
        if (!assignee) return null;
        
        // Handle different assignee data structures
        if (typeof assignee === 'string') return assignee;
        if (assignee.name) return assignee.name;
        if (assignee.email) return assignee.email;
        if (assignee.username) return assignee.username;
        return 'Assigned';
    };

    const handleResolve = () => {
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        const timeScope = isGlobalFilter ? 'across ALL time in your project' : 'in the selected time range';
        const message = `Are you sure you want to resolve ALL ${relevantEvents.length} ${errorType} issues ${timeScope}?\n\nThis action will affect entire issues, not just events in the time range.\n\nThis cannot be undone.`;
        
        showConfirmationDialog('resolve', `Resolve ${relevantEvents.length} ${errorType} Issues`, message);
    };

    const executeResolve = async () => {
        if (!relevantEvents.length) return;
        setLoadingAction('resolve');
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        
        console.log(`Resolving ${relevantEvents.length} events of type ${errorType} ${isGlobalFilter ? '(all time)' : `in time range ${bucketStart?.toLocaleString()} - ${bucketEnd?.toLocaleString()}`}`);
        console.log('All relevant events in time range:', relevantEvents);
        console.log('Valid events with resolve IDs:', validEvents);
        
        // Log which ID we're using for resolution and check for assignee info
        if (validEvents.length > 0) {
            const firstEvent = relevantEvents[0];
            const resolveId = validEvents[0].resolveId;
            console.log(`Using ID for resolution: ${resolveId} (from ${firstEvent.groupID ? 'groupID' : firstEvent.issueId ? 'issueId' : firstEvent.originalIssue?.id ? 'originalIssue.id' : firstEvent.id ? 'event.id' : 'shortId'})`);
            console.log('Event assignee data:', firstEvent.assignedTo || firstEvent.assignee || 'No assignee info found');
        }
        
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to resolve. The events may not contain proper issue identifiers.');
            setLoadingAction(null);
            handleMenuClose();
            return;
        }

        try {
            // Resolve each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => resolveIssue(event.resolveId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully resolved ${successful}/${validEvents.length} issues of type: ${errorType}`);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to resolve:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Resolved ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be resolved (likely already resolved, deleted, or moved in Sentry).`
                    : `Resolved ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully resolved all ${successful} ${errorType} issues ${timeScope}`);
            }
        } catch (error) {
            console.error('Failed to resolve issues:', error);
            alert(`Failed to resolve issues: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleIgnore = () => {
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        const timeScope = isGlobalFilter ? 'across ALL time in your project' : 'in the selected time range';
        const message = `Are you sure you want to ignore ALL ${relevantEvents.length} ${errorType} issues ${timeScope}?\n\nThis action will affect entire issues, not just events in the time range.\n\nThis cannot be undone.`;
        
        showConfirmationDialog('ignore', `Ignore ${relevantEvents.length} ${errorType} Issues`, message);
    };

    const executeIgnore = async () => {
        if (!relevantEvents.length) return;
        setLoadingAction('ignore');
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to ignore. The events may not contain proper issue identifiers.');
            setLoadingAction(null);
            handleMenuClose();
            return;
        }

        try {
            // Ignore each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => ignoreIssue(event.resolveId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully ignored ${successful}/${validEvents.length} issues of type: ${errorType}`);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to ignore:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Ignored ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be ignored (likely already resolved, deleted, or moved in Sentry).`
                    : `Ignored ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully ignored all ${successful} ${errorType} issues ${timeScope}`);
            }
        } catch (error) {
            console.error('Failed to ignore issues:', error);
            alert(`Failed to ignore issues: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleArchive = () => {
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        const timeScope = isGlobalFilter ? 'across ALL time in your project' : 'in the selected time range';
        const message = `Are you sure you want to archive ALL ${relevantEvents.length} ${errorType} issues ${timeScope}?\n\nThis action will affect entire issues, not just events in the time range.\n\nThis cannot be undone.`;
        
        showConfirmationDialog('archive', `Archive ${relevantEvents.length} ${errorType} Issues`, message);
    };

    const executeArchive = async () => {
        if (!relevantEvents.length) return;
        setLoadingAction('archive');
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to archive. The events may not contain proper issue identifiers.');
            setLoadingAction(null);
            handleMenuClose();
            return;
        }

        try {
            // Archive each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => archiveIssue(event.resolveId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully archived ${successful}/${validEvents.length} issues of type: ${errorType}`);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to archive:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Archived ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be archived (likely already resolved, deleted, or moved in Sentry).`
                    : `Archived ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully archived all ${successful} ${errorType} issues ${timeScope}`);
            }
        } catch (error) {
            console.error('Failed to archive issues:', error);
            alert(`Failed to archive issues: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleBookmark = () => {
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        const timeScope = isGlobalFilter ? 'across ALL time in your project' : 'in the selected time range';
        const message = `Are you sure you want to bookmark ALL ${relevantEvents.length} ${errorType} issues ${timeScope}?\n\nThis action will affect entire issues, not just events in the time range.`;
        
        showConfirmationDialog('bookmark', `Bookmark ${relevantEvents.length} ${errorType} Issues`, message);
    };

    const executeBookmark = async () => {
        if (!relevantEvents.length) return;
        setLoadingAction('bookmark');
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to bookmark. The events may not contain proper issue identifiers.');
            setLoadingAction(null);
            handleMenuClose();
            return;
        }

        try {
            // Bookmark each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => bookmarkIssue(event.resolveId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully bookmarked ${successful}/${validEvents.length} issues of type: ${errorType}`);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to bookmark:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Bookmarked ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be bookmarked (likely already resolved, deleted, or moved in Sentry).`
                    : `Bookmarked ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully bookmarked all ${successful} ${errorType} issues ${timeScope}`);
            }
        } catch (error) {
            console.error('Failed to bookmark issues:', error);
            alert(`Failed to bookmark issues: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleAssignClick = () => {
        setAssignDialogOpen(true);
        handleMenuClose();
    };

    const handleAssignDialogClose = () => {
        setAssignDialogOpen(false);
    };

    const handleAssignToUser = async (userId) => {
        if (!relevantEvents.length) return;
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to assign. The events may not contain proper issue identifiers.');
            setAssignDialogOpen(false);
            return;
        }

        try {
            // Assign each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => assignIssue(event.resolveId, userId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully assigned ${successful}/${validEvents.length} issues of type ${errorType} to user:`, userId);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to assign:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Assigned ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be assigned (likely already resolved, deleted, or moved in Sentry).`
                    : `Assigned ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully assigned all ${successful} ${errorType} issues ${timeScope} to user`);
            }
        } catch (error) {
            console.error('Failed to assign issues:', error);
            alert(`Failed to assign issues: ${error.message}`);
        }
        setAssignDialogOpen(false);
    };

    const handleUnassign = async () => {
        if (!relevantEvents.length) return;
        
        const validEvents = getValidEventsWithIssueIds(relevantEvents);
        if (validEvents.length === 0) {
            alert('No valid issue IDs found to unassign. The events may not contain proper issue identifiers.');
            setAssignDialogOpen(false);
            return;
        }

        try {
            // Unassign each event individually to handle partial failures
            const results = await Promise.allSettled(
                validEvents.map(event => unassignIssue(event.resolveId))
            );
            
            const successful = results.filter(result => result.status === 'fulfilled').length;
            const failed = results.filter(result => result.status === 'rejected');
            
            console.log(`Successfully unassigned ${successful}/${validEvents.length} issues of type: ${errorType}`);
            
            const timeScope = isGlobalFilter ? 'across all time' : `in the selected time range`;
            
            if (failed.length > 0) {
                console.warn('Some issues failed to unassign:', failed);
                const hasNotFoundErrors = failed.some(f => f.reason?.message?.includes('404'));
                const errorMessage = hasNotFoundErrors 
                    ? `Unassigned ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues could not be unassigned (likely already resolved, deleted, or moved in Sentry).`
                    : `Unassigned ${successful}/${validEvents.length} ${errorType} issues ${timeScope}. ${failed.length} issues failed due to API errors.`;
                alert(errorMessage);
            } else {
                alert(`Successfully unassigned all ${successful} ${errorType} issues ${timeScope}`);
            }
        } catch (error) {
            console.error('Failed to unassign issues:', error);
            alert(`Failed to unassign issues: ${error.message}`);
        }
        setAssignDialogOpen(false);
    };

    return (
        <>
            <Card sx={{ mt: 3, border: `2px solid ${panelColor}` }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6" sx={{ color: panelColor }}>
                                Investigating: {api.toUpperCase()} {errorType.toUpperCase()} Errors
                            </Typography>
                            <Button 
                                size="small" 
                                startIcon={<MoreVertIcon />} 
                                onClick={(e) => handleMenuClick(e, relevantEvents[0])}
                                variant="outlined"
                            >
                                Actions
                            </Button>
                        </Box>
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Box mb={2}>
                        {!isGlobalFilter ? (
                            <Chip
                                label={`Time Range: ${bucketStart.toLocaleString()} - ${bucketEnd.toLocaleString()}`}
                                variant="outlined"
                                sx={{ mr: 1, mb: 1 }}
                            />
                        ) : (
                            <Chip
                                label="All Time - Global Filter"
                                color="secondary"
                                variant="outlined"
                                sx={{ mr: 1, mb: 1 }}
                            />
                        )}
                        <Chip
                            label={`${relevantEvents.length} events found`}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                        />
                        {api === 'mixed' ? (
                            <>
                                <Chip
                                    label={`SENTRY: ${sentryCount} events`}
                                    sx={{
                                        backgroundColor: panelColor,
                                        color: 'white',
                                        mr: 1, mb: 1
                                    }}
                                />
                                <Chip
                                    label={`MAILGUN: ${mailgunCount} events`}
                                    sx={{
                                        backgroundColor: panelColor,
                                        color: 'white',
                                        mr: 1, mb: 1
                                    }}
                                />
                            </>
                        ) : (
                            <Chip
                                label={`API: ${api.toUpperCase()}`}
                                sx={{
                                    backgroundColor: panelColor,
                                    color: 'white',
                                    mr: 1, mb: 1
                                }}
                            />
                        )}
                    </Box>
                    
                    {relevantEvents.length > 0 ? (
                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {relevantEvents
                                .sort((a, b) => new Date(b.dateCreated || b.timestamp || b.lastSeen) - new Date(a.dateCreated || a.timestamp || a.lastSeen))
                                .map((event, index) => (
                                    <React.Fragment key={event.id || index}>
                                        <ListItem alignItems="flex-start">
                                            <Box sx={{ width: '100%' }}>
                                                {/* Primary content */}
                                                <Box display="flex" alignItems="center" mb={1}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Chip
                                                            label={errorType}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: panelColor,
                                                                color: 'white'
                                                            }}
                                                        />
                                                        <Typography variant="body1" component="div" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                                            {event.title || event.message || 'Unknown Error'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                {/* Secondary content */}
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                                                        {new Date(event.timestamp || event.dateCreated || event.lastSeen).toLocaleString()}
                                                    </Typography>
                                                    {event.culprit && (
                                                        <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                                            Location: {event.culprit}
                                                        </Typography>
                                                    )}
                                                    {event.count && (
                                                        <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                                            Count: {event.count}
                                                        </Typography>
                                                    )}
                                                    {event.shortId && (
                                                        <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
                                                            Issue ID: {event.shortId}
                                                        </Typography>
                                                    )}
                                                    {(() => {
                                                        const assigneeInfo = getAssigneeInfo(event);
                                                        return assigneeInfo ? (
                                                            <Typography variant="body2" color="primary.main" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                                                Assigned to: {assigneeInfo}
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.9rem' }}>
                                                                Unassigned
                                                            </Typography>
                                                        );
                                                    })()}
                                                </Box>
                                            </Box>
                                        </ListItem>
                                        {index < relevantEvents.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            }
                        </List>
                    ) : (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                            No specific events found for this time period and error type.
                        </Typography>
                    )}
                </CardContent>
            </Card>
            
            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {isGlobalFilter ? (
                    // For global filters, show full issue actions with warning
                    <>
                        <MenuItem onClick={handleResolve} disabled={loadingAction === 'resolve'}>
                            {loadingAction === 'resolve' ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={16} />
                                    Resolving...
                                </Box>
                            ) : (
                                `Resolve All ${errorType} Issues (${relevantEvents.length} issues)`
                            )}
                        </MenuItem>
                        <MenuItem onClick={handleIgnore} disabled={loadingAction === 'ignore'}>
                            {loadingAction === 'ignore' ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={16} />
                                    Ignoring...
                                </Box>
                            ) : (
                                `Ignore All ${errorType} Issues (${relevantEvents.length} issues)`
                            )}
                        </MenuItem>
                        <MenuItem onClick={handleArchive} disabled={loadingAction === 'archive'}>
                            {loadingAction === 'archive' ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={16} />
                                    Archiving...
                                </Box>
                            ) : (
                                `Archive All ${errorType} Issues (${relevantEvents.length} issues)`
                            )}
                        </MenuItem>
                        <MenuItem onClick={handleBookmark} disabled={loadingAction === 'bookmark'}>
                            {loadingAction === 'bookmark' ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={16} />
                                    Bookmarking...
                                </Box>
                            ) : (
                                `Bookmark All ${errorType} Issues (${relevantEvents.length} issues)`
                            )}
                        </MenuItem>
                        <MenuItem onClick={handleAssignClick}>
                            {loadingAction === 'assign' ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CircularProgress size={16} />
                                    Assigning...
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="body2">
                                        Assign All {errorType} Issues ({relevantEvents.length} issues)
                                    </Typography>
                                    {(() => {
                                        const assignees = relevantEvents.map(event => getAssigneeInfo(event)).filter(Boolean);
                                        const uniqueAssignees = [...new Set(assignees)];
                                        if (uniqueAssignees.length > 0) {
                                            return (
                                                <Typography variant="caption" color="text.secondary">
                                                    Currently: {uniqueAssignees.length === 1 ? uniqueAssignees[0] : `${uniqueAssignees.length} different assignees`}
                                                </Typography>
                                            );
                                        }
                                        return (
                                            <Typography variant="caption" color="text.secondary">
                                                Currently: Unassigned
                                            </Typography>
                                        );
                                    })()}
                                </Box>
                            )}
                        </MenuItem>
                    </>
                ) : (
                    // For time-specific buckets, show warning and limited actions
                    <>
                        <MenuItem disabled>
                            <Box>
                                <Typography variant="body2" color="warning.main" fontWeight="bold">
                                    Limited Actions Available
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Sentry API only allows resolving entire issues,<br/>
                                    not events within specific time periods.
                                </Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem onClick={() => {
                            const timeRange = `${bucketStart?.toLocaleString()} - ${bucketEnd?.toLocaleString()}`;
                            alert(`Found ${relevantEvents.length} ${errorType} events in time range:\n${timeRange}\n\nNote: Individual events cannot be resolved separately from their parent issues in Sentry.`);
                            handleMenuClose();
                        }}>
                            View Time Range Summary
                        </MenuItem>
                        <MenuItem onClick={() => {
                            console.log(`${errorType} events in selected time range:`, relevantEvents);
                            alert(`Event details logged to console for ${relevantEvents.length} events`);
                            handleMenuClose();
                        }}>
                            Export Event Details to Console
                        </MenuItem>
                        <MenuItem onClick={() => {
                            // Store the error type and related events for enhanced Live Data display
                            sessionStorage.setItem('highlightIssueType', errorType);
                            sessionStorage.setItem('highlightFromInvestigation', 'true');
                            
                            // Store detailed investigation data for better Live Data display
                            const investigationContext = {
                                errorType,
                                api,
                                totalEvents: relevantEvents.length,
                                timeRange: isGlobalFilter ? 'all' : `${bucketStart?.toLocaleString()} - ${bucketEnd?.toLocaleString()}`,
                                isGlobalFilter,
                                sampleEvents: relevantEvents.slice(0, 3).map(event => ({
                                    id: event.id,
                                    title: event.title || event.message,
                                    timestamp: event.dateCreated || event.timestamp || event.lastSeen,
                                    shortId: event.shortId,
                                    culprit: event.culprit
                                }))
                            };
                            sessionStorage.setItem('investigationContext', JSON.stringify(investigationContext));
                            
                            // Navigate to Live Data page
                            dispatch({ type: SET_ACTIVE_PAGE, payload: 'liveData' });
                            handleMenuClose();
                            onClose(); // Close the investigation panel
                        }}>
                            <OpenInNewIcon sx={{ mr: 1, fontSize: 'small' }} />
                            View in Live Data Section
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* Assignment Dialog */}
            <Dialog 
                open={assignDialogOpen} 
                onClose={handleAssignDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Assign All {errorType.toUpperCase()} Issues ({relevantEvents.length} issues)
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

            {/* Confirmation Dialog */}
            <Dialog 
                open={confirmationDialog.open} 
                onClose={handleConfirmationClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle color="warning.main">
                    {confirmationDialog.title}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                        {confirmationDialog.message}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Note: This is how Sentry's API works - you can only perform actions on entire issues, not individual events within issues.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmationClose} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={executeConfirmedAction} 
                        color="warning" 
                        variant="contained"
                        autoFocus
                    >
                        Confirm Action
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});


// --- Main Chart Component ---

export default function UnifiedStackedBarChart({
                                                   events = [], mailgunEvents = [], timeRange = '30d', title = 'Error Trends Over Time', onInvestigationChange, showAPIComparison = false
                                               }) {
    const [investigationData, setInvestigationData] = useState(null);
    const [selectedAPI, setSelectedAPI] = useState('sentry');
    const [selectedErrorTypes, setSelectedErrorTypes] = useState(new Set());

    const chartData = useMemo(() => {
        console.log('📊 Chart Data Debug:', {
            sentryEvents: events?.length || 0,
            mailgunEvents: mailgunEvents?.length || 0,
            selectedAPI,
            mailgunEventSample: mailgunEvents?.slice(0, 2),
            timeRange
        });
        
        const allErrorTypes = new Set();
        (events || []).forEach(e => allErrorTypes.add(e.issueCategory || e.type || 'Unknown Error'));
        (mailgunEvents || []).forEach(e => allErrorTypes.add(e.issueCategory || e.category || e.type || 'Unknown Error'));
        const { colorMap, colorOrder } = generateAppearanceMaps(allErrorTypes);
        const allCombinedEvents = [...(events || []), ...(mailgunEvents || [])];
        const { buckets, startTime, bucketSize } = createTimeBuckets(timeRange, allCombinedEvents);

        if (showAPIComparison) {
            const allSentryTypes = new Set(), allMailgunTypes = new Set();
            (events || []).forEach(e => allSentryTypes.add(e.issueCategory || e.type || 'Unknown Error'));
            (mailgunEvents || []).forEach(e => allMailgunTypes.add(e.issueCategory || e.category || e.type || 'Unknown Error'));
            buckets.forEach(bucket => {
                if (selectedAPI === 'sentry') allSentryTypes.forEach(type => { bucket[`sentry_${type}`] = 0; });
                if (selectedAPI === 'mailgun') allMailgunTypes.forEach(type => { bucket[`mailgun_${type}`] = 0; });
            });
            const processEvents = (eventList, apiPrefix) => {
                (eventList || []).forEach(event => {
                    const eventTime = new Date(event.dateCreated || event.timestamp || event.lastSeen);
                    if (eventTime >= startTime) {
                        const bucketKey = Math.floor(eventTime.getTime() / bucketSize) * bucketSize;
                        if (buckets.has(bucketKey)) {
                            const errorType = event.issueCategory || (apiPrefix === 'mailgun_' ? event.category : event.type) || 'Unknown Error';
                            if (selectedErrorTypes.size === 0 || selectedErrorTypes.has(errorType)) {
                                buckets.get(bucketKey)[`${apiPrefix}${errorType}`]++;
                            }
                        }
                    }
                });
            };
            if (selectedAPI === 'sentry') processEvents(events, 'sentry_');
            if (selectedAPI === 'mailgun') processEvents(mailgunEvents, 'mailgun_');
            let sentryErrorTypes = Array.from(allSentryTypes).filter(type => selectedErrorTypes.size === 0 || selectedErrorTypes.has(type)).map(type => `sentry_${type}`);
            let mailgunErrorTypes = Array.from(allMailgunTypes).filter(type => selectedErrorTypes.size === 0 || selectedErrorTypes.has(type)).map(type => `mailgun_${type}`);
            if (selectedAPI === 'sentry') mailgunErrorTypes = [];
            if (selectedAPI === 'mailgun') sentryErrorTypes = [];
            const sortByColorOrder = (a, b, prefix) => (colorOrder[b.replace(prefix, '')] || 0) - (colorOrder[a.replace(prefix, '')] || 0);
            sentryErrorTypes.sort((a, b) => sortByColorOrder(a, b, 'sentry_'));
            mailgunErrorTypes.sort((a, b) => sortByColorOrder(a, b, 'mailgun_'));
            return { data: Array.from(buckets.values()), sentryErrorTypes, mailgunErrorTypes, colorMap };
        } else {
            return { data: [], sentryErrorTypes: [], mailgunErrorTypes: [], colorMap };
        }
    }, [events, mailgunEvents, timeRange, showAPIComparison, selectedAPI, selectedErrorTypes]);

    const errorTypeButtons = useMemo(() => {
        const types = new Set();
        const source = selectedAPI === 'sentry' ? events : mailgunEvents;
        (source || []).forEach(e => {
            const errorType = e.issueCategory || (selectedAPI === 'mailgun' ? e.category : e.type) || 'Unknown Error';
            types.add(errorType);
        });
        return Array.from(types).sort();
    }, [events, mailgunEvents, selectedAPI]);

    const sortedErrorTypeButtons = useMemo(() => {
        const { colorOrder } = generateAppearanceMaps(new Set(errorTypeButtons));
        return [...errorTypeButtons].sort((a, b) => (colorOrder[b] || 0) - (colorOrder[a] || 0));
    }, [errorTypeButtons]);

    const handleBarClick = useCallback((event, dataIndex, seriesId) => {
        if (!showAPIComparison || dataIndex === undefined || !seriesId) return;
        
        const clickedBucket = chartData.data[dataIndex];
        const { bucketSize } = createTimeBuckets(timeRange, [...events, ...mailgunEvents]);
        const bucketStart = clickedBucket.timestamp;
        const bucketEnd = new Date(bucketStart.getTime() + bucketSize);
        const api = seriesId.startsWith('sentry_') ? 'sentry' : 'mailgun';
        const errorType = seriesId.replace(/^(sentry_|mailgun_)/, '');
        
        const sourceEvents = api === 'sentry' ? events : mailgunEvents;
        const relevantEvents = sourceEvents.filter(e => {
            const eventTime = new Date(e.dateCreated || e.timestamp || e.lastSeen);
            const eventType = e.issueCategory || (api === 'mailgun' ? e.category : e.type) || 'Unknown Error';
            return eventTime >= bucketStart && eventTime < bucketEnd && eventType === errorType;
        });
        
        const newInvestigationData = {
            api,
            errorType,
            events: relevantEvents,
            bucketStart,
            bucketEnd,
            seriesId,
            isGlobalFilter: false
        };
        
        setInvestigationData(newInvestigationData);
        if (onInvestigationChange) onInvestigationChange(newInvestigationData);
    }, [chartData.data, events, mailgunEvents, onInvestigationChange, showAPIComparison, timeRange]);
    
    const handleErrorTypeClick = useCallback((errorType) => {
        // Find all events of this type regardless of time for global investigation
        const allSentryEvents = events?.filter(event => {
            const eventType = event.issueCategory || event.type || 'Unknown Error';
            return eventType === errorType;
        }) || [];
        
        const allMailgunEvents = mailgunEvents?.filter(event => {
            const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
            return eventType === errorType;
        }) || [];
        
        const combinedEvents = [...allSentryEvents, ...allMailgunEvents];
        
        if (combinedEvents.length > 0) {
            // Determine primary API - prefer the one with more events, or Sentry as fallback
            let api, seriesId;
            const maxCount = Math.max(allSentryEvents.length, allMailgunEvents.length);
            
            if (allSentryEvents.length === maxCount && allSentryEvents.length > 0) {
                api = 'sentry';
                seriesId = `sentry_${errorType}`;
            } else {
                api = 'mailgun';
                seriesId = `mailgun_${errorType}`;
            }
            
            // Check if mixed API (more than one API has events)
            const activeAPIs = [allSentryEvents.length > 0, allMailgunEvents.length > 0].filter(Boolean).length;
            
            const newInvestigationData = {
                api: activeAPIs > 1 ? 'mixed' : api,
                errorType,
                timestamp: new Date(),
                bucketStart: new Date(0), // Start of time
                bucketEnd: new Date(), // Now
                events: combinedEvents,
                seriesId,
                isGlobalFilter: true,
                sentryCount: allSentryEvents.length,
                mailgunCount: allMailgunEvents.length
            };
            
            setInvestigationData(newInvestigationData);
            if (onInvestigationChange) onInvestigationChange(newInvestigationData);
        }
    }, [events, mailgunEvents, onInvestigationChange]);

    const handleClearInvestigation = useCallback(() => {
        setInvestigationData(null);
        if (onInvestigationChange) onInvestigationChange(null);
    }, [onInvestigationChange]);

    const handleApiChange = useCallback((e) => {
        setSelectedAPI(e.target.value);
        setSelectedErrorTypes(new Set());
        handleClearInvestigation();
    }, [handleClearInvestigation]);

    const handleToggleErrorType = useCallback((errorType, event) => {
        if (event?.altKey || event?.metaKey) {
            setSelectedErrorTypes(new Set());
            return;
        }
        setSelectedErrorTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(errorType)) newSet.delete(errorType);
            else newSet.add(errorType);
            return newSet;
        });
    }, []);

    // Calculate error type counts and total count for the selected API
    const { errorTypeCounts, totalCount } = useMemo(() => {
        const counts = {};
        let total = 0;
        
        const sourceEvents = selectedAPI === 'sentry' ? events : mailgunEvents;
        
        sortedErrorTypeButtons.forEach(errorType => {
            const count = sourceEvents?.filter(event => {
                const eventType = event.issueCategory || (selectedAPI === 'mailgun' ? event.category : event.type) || 'Unknown Error';
                return eventType === errorType;
            }).length || 0;
            
            counts[errorType] = count;
            total += count;
        });
        
        return { errorTypeCounts: counts, totalCount: total };
    }, [events, mailgunEvents, selectedAPI, sortedErrorTypeButtons]);

    const hasData = chartData.data.length > 0 && (chartData.sentryErrorTypes.length > 0 || chartData.mailgunErrorTypes.length > 0);

    return (
        <Box>
            {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
            {showAPIComparison && <ChartControls selectedAPI={selectedAPI} onApiChange={handleApiChange} sortedErrorTypeButtons={sortedErrorTypeButtons} selectedErrorTypes={selectedErrorTypes} onClearSelection={() => setSelectedErrorTypes(new Set())} onToggleErrorType={handleToggleErrorType} onErrorTypeClick={handleErrorTypeClick} colorMap={chartData.colorMap} errorTypeCounts={errorTypeCounts} totalCount={totalCount} />}
            <Box height={566}>
                {hasData ? (
                    <BarChart
                        dataset={chartData.data}
                        xAxis={[{ dataKey: 'timestamp', scaleType: 'band', valueFormatter: (date) => {
                                const now = new Date();
                                const opts = { month: 'short', day: 'numeric' };
                                if (timeRange === '1d') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                if (date.getFullYear() !== now.getFullYear()) opts.year = '2-digit';
                                return date.toLocaleDateString('en-US', opts);
                            }}]}
                        yAxis={[{ tickFormatter: (value) => Number.isInteger(value) ? value.toString() : '' }]}
                        series={[...chartData.sentryErrorTypes.map(type => ({ id: type, dataKey: type, label: type.replace('sentry_', ''), color: chartData.colorMap[type.replace('sentry_', '')], stack: 'sentry', highlightScope: { highlighted: 'series', faded: 'global' }, valueFormatter: (value) => value === 0 ? null : value })), ...chartData.mailgunErrorTypes.map(type => ({ id: type, dataKey: type, label: type.replace('mailgun_', ''), color: chartData.colorMap[type.replace('mailgun_', '')], stack: 'mailgun', highlightScope: { highlighted: 'series', faded: 'global' }, valueFormatter: (value) => value === 0 ? null : value }))]}
                        height={566}
                        margin={{ left: 60, right: 20, top: 20, bottom: 100 }}
                        onItemClick={(event, d) => {
                            if (d && d.dataIndex !== undefined) {
                                handleBarClick(event, d.dataIndex, d.seriesId);
                            }
                        }}
                        slots={{
                            legend: null
                        }}
                    />
                ) : (<Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="text.secondary">No error data available for the selected filters.</Typography></Box>)}
            </Box>
            <InvestigationPanel data={investigationData} colorMap={chartData.colorMap} onClose={handleClearInvestigation} />
        </Box>
    );
}