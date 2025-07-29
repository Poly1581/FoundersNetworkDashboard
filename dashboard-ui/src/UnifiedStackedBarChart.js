import React, { useMemo, useState, useCallback } from 'react';
import {
    Box, Typography, Chip, Card, CardContent, List, ListItem, Divider,
    IconButton, Button, Menu, MenuItem, CircularProgress, FormControl, InputLabel, Select, ListItemText
} from '@mui/material';
import { Close as CloseIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { resolveIssue, ignoreIssue, archiveIssue, bookmarkIssue, assignIssue } from './api';

// --- Constants ---
const ACCESSIBLE_COLORS = [
    '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0284C7', '#7C3AED',
    '#BE185D', '#059669', '#0891B2', '#7C2D12', '#1F2937', '#B91C1C',
    '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'
];

// --- Helper Functions ---

const generateAppearanceMaps = (allErrorTypes) => {
    const sortedTypes = Array.from(allErrorTypes).sort();
    const colorMap = {}, colorOrder = {};
    const hexToOrderValue = (hex) => parseInt(hex.replace('#', ''), 16);
    sortedTypes.forEach((type, index) => {
        const color = ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length];
        colorMap[type] = color;
        colorOrder[type] = hexToOrderValue(color);
    });
    return { colorMap, colorOrder };
};

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

const ChartControls = React.memo(({ selectedAPI, onApiChange, sortedErrorTypeButtons, selectedErrorTypes, onClearSelection, onToggleErrorType, onErrorTypeClick, colorMap }) => (
    <Box mb={2}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>API</InputLabel>
                <Select value={selectedAPI} label="API" onChange={onApiChange}>
                    <MenuItem value="sentry">Sentry</MenuItem>
                    <MenuItem value="mailgun">Mailgun</MenuItem>
                </Select>
            </FormControl>
            {selectedErrorTypes.size > 0 && (
                <Button size="small" variant="outlined" onClick={onClearSelection} sx={{ minWidth: 'auto', px: 1 }}>Clear All</Button>
            )}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>Error Types (click to toggle filter, double-click to investigate, alt+click to clear all):</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            {sortedErrorTypeButtons.map(errorType => {
                const buttonColor = colorMap[errorType] || '#757575';
                const isSelected = selectedErrorTypes.has(errorType);
                return (
                    <Chip
                        key={errorType}
                        label={errorType}
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
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEventForMenu, setSelectedEventForMenu] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    
    if (!data) return null;
    
    const { api, errorType, events, bucketStart, bucketEnd, isGlobalFilter, sentryCount, mailgunCount } = data;
    const panelColor = colorMap[errorType] || '#757575';
    const relevantEvents = events.filter(event => {
        const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
        return eventType === errorType;
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

    const handleResolve = async () => {
        if (!selectedEventForMenu?.id) return;
        setLoadingAction('resolve');
        try {
            await resolveIssue(selectedEventForMenu.id);
            console.log('Successfully resolved event:', selectedEventForMenu.id);
        } catch (error) {
            console.error('Failed to resolve event:', error);
            alert(`Failed to resolve issue: ${error.message}`);
        } finally {
            setLoadingAction(null);
            handleMenuClose();
        }
    };

    const handleIgnore = async () => {
        if (!selectedEventForMenu?.id) return;
        setLoadingAction('ignore');
        try {
            await ignoreIssue(selectedEventForMenu.id);
            console.log('Successfully ignored event:', selectedEventForMenu.id);
        } catch (error) {
            console.error('Failed to ignore event:', error);
            alert(`Failed to ignore issue: ${error.message}`);
        } finally {
            setLoadingAction(null);
            handleMenuClose();
        }
    };

    const handleArchive = async () => {
        if (!selectedEventForMenu?.id) return;
        setLoadingAction('archive');
        try {
            await archiveIssue(selectedEventForMenu.id);
            console.log('Successfully archived event:', selectedEventForMenu.id);
        } catch (error) {
            console.error('Failed to archive event:', error);
            alert(`Failed to archive issue: ${error.message}`);
        } finally {
            setLoadingAction(null);
            handleMenuClose();
        }
    };

    const handleBookmark = async () => {
        if (!selectedEventForMenu?.id) return;
        setLoadingAction('bookmark');
        try {
            await bookmarkIssue(selectedEventForMenu.id);
            console.log('Successfully bookmarked event:', selectedEventForMenu.id);
        } catch (error) {
            console.error('Failed to bookmark event:', error);
            alert(`Failed to bookmark issue: ${error.message}`);
        } finally {
            setLoadingAction(null);
            handleMenuClose();
        }
    };

    const handleAssign = async () => {
        if (!selectedEventForMenu?.id) return;
        setLoadingAction('assign');
        try {
            await assignIssue(selectedEventForMenu.id, 'current-user');
            console.log('Successfully assigned event:', selectedEventForMenu.id);
        } catch (error) {
            console.error('Failed to assign event:', error);
            alert(`Failed to assign issue: ${error.message}`);
        } finally {
            setLoadingAction(null);
            handleMenuClose();
        }
    };

    return (
        <>
            <Card sx={{ mt: 3, border: `2px solid ${panelColor}` }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: panelColor }}>
                            Investigating: {api.toUpperCase()} {errorType.toUpperCase()} Errors
                        </Typography>
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
                                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
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
                                                    <Button
                                                        size="small"
                                                        startIcon={<MoreVertIcon />}
                                                        onClick={(e) => handleMenuClick(e, event)}
                                                        variant="outlined"
                                                        sx={{ minWidth: 'auto' }}
                                                    >
                                                        Actions
                                                    </Button>
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
                                                        <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.9rem' }}>
                                                            Issue ID: {event.shortId}
                                                        </Typography>
                                                    )}
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
                <MenuItem onClick={handleResolve} disabled={loadingAction === 'resolve'}>
                    {loadingAction === 'resolve' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            Resolving...
                        </Box>
                    ) : (
                        'Resolve'
                    )}
                </MenuItem>
                <MenuItem onClick={handleIgnore} disabled={loadingAction === 'ignore'}>
                    {loadingAction === 'ignore' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            Ignoring...
                        </Box>
                    ) : (
                        'Ignore'
                    )}
                </MenuItem>
                <MenuItem onClick={handleArchive} disabled={loadingAction === 'archive'}>
                    {loadingAction === 'archive' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            Archiving...
                        </Box>
                    ) : (
                        'Archive'
                    )}
                </MenuItem>
                <MenuItem onClick={handleBookmark} disabled={loadingAction === 'bookmark'}>
                    {loadingAction === 'bookmark' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            Bookmarking...
                        </Box>
                    ) : (
                        'Bookmark'
                    )}
                </MenuItem>
                <MenuItem onClick={handleAssign} disabled={loadingAction === 'assign'}>
                    {loadingAction === 'assign' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={16} />
                            Assigning...
                        </Box>
                    ) : (
                        'Assign'
                    )}
                </MenuItem>
            </Menu>
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

    const hasData = chartData.data.length > 0 && (chartData.sentryErrorTypes.length > 0 || chartData.mailgunErrorTypes.length > 0);

    return (
        <Box>
            {title && <Typography variant="h6" gutterBottom>{title}</Typography>}
            {showAPIComparison && <ChartControls selectedAPI={selectedAPI} onApiChange={handleApiChange} sortedErrorTypeButtons={sortedErrorTypeButtons} selectedErrorTypes={selectedErrorTypes} onClearSelection={() => setSelectedErrorTypes(new Set())} onToggleErrorType={handleToggleErrorType} onErrorTypeClick={handleErrorTypeClick} colorMap={chartData.colorMap} />}
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
                        series={[...chartData.sentryErrorTypes.map(type => ({ id: type, dataKey: type, label: type.replace('sentry_', ''), color: chartData.colorMap[type.replace('sentry_', '')], stack: 'sentry', highlightScope: { highlighted: 'series', faded: 'global' } })), ...chartData.mailgunErrorTypes.map(type => ({ id: type, dataKey: type, label: type.replace('mailgun_', ''), color: chartData.colorMap[type.replace('mailgun_', '')], stack: 'mailgun', highlightScope: { highlighted: 'series', faded: 'global' } }))]}
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
                        slotProps={{
                            tooltip: { content: ({ active, payload, label }) => {
                                    if (!active || !payload || payload.length === 0) return null;
                                    const nonZero = payload.filter(e => Number(e?.value) > 0);
                                    if (nonZero.length === 0) return null;
                                    return (<Box sx={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #ccc', borderRadius: 1, p: 1, boxShadow: 2 }}>
                                        <Typography variant="body2" fontWeight="bold" mb={1}>{label ? new Date(label).toLocaleDateString() : ''}</Typography>
                                        {nonZero.sort((a, b) => b.value - a.value).map(e => (<Box key={e.seriesId} display="flex" alignItems="center" gap={1}>
                                            <Box sx={{ width: 12, height: 12, backgroundColor: e.color, borderRadius: '2px' }} />
                                            <Typography variant="body2">{e.label}: {e.value}</Typography>
                                        </Box>))}
                                    </Box>);
                                }}
                        }}
                    />
                ) : (<Box display="flex" justifyContent="center" alignItems="center" height="100%"><Typography color="text.secondary">No error data available for the selected filters.</Typography></Box>)}
            </Box>
            <InvestigationPanel data={investigationData} colorMap={chartData.colorMap} onClose={handleClearInvestigation} />
        </Box>
    );
}