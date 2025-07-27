import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Chip, Card, CardContent, List, ListItem, ListItemText, Divider, IconButton, Button, Menu, MenuItem, CircularProgress, FormControl, InputLabel, Select, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Close as CloseIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { resolveIssue, ignoreIssue, archiveIssue, bookmarkIssue, assignIssue } from './api';
import { BarChart } from '@mui/x-charts/BarChart';


export default function UnifiedStackedBarChart({ 
    events = [], 
    hubspotEvents = [],
    timeRange: initialTimeRange = '30d', 
    title = 'Error Trends Over Time',
    onFilterChange,
    selectedFilter = null,
    showAPIComparison = false,
    onInvestigationChange
}) {
    const [highlightedSeries, setHighlightedSeries] = useState(null);
    const [investigationData, setInvestigationData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedEventForMenu, setSelectedEventForMenu] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [selectedAPI, setSelectedAPI] = useState('sentry'); // 'sentry', 'hubspot'
    const [selectedErrorTypes, setSelectedErrorTypes] = useState(new Set()); // Multi-select error types
    const [timeRange, setTimeRange] = useState(initialTimeRange); // Internal time range state
    const [patternsSvgId] = useState(`chart-patterns-${Math.random().toString(36).substr(2, 9)}`); // Unique ID for SVG patterns
    
    const chartData = useMemo(() => {
        // Create color mapping first
        const allErrorTypesForMapping = new Set();
        
        // Collect all unique error types from both APIs for color mapping
        events?.forEach(event => {
            const errorType = event.issueCategory || event.type || 'Unknown Error';
            allErrorTypesForMapping.add(errorType);
        });
        
        hubspotEvents?.forEach(event => {
            const errorType = event.issueCategory || event.category || event.type || 'Unknown Error';
            allErrorTypesForMapping.add(errorType);
        });
        
        const sortedErrorTypesForMapping = Array.from(allErrorTypesForMapping).sort();
        
        // Accessible colors with high contrast and distinct hues for colorblind users
        // Each color meets WCAG AA contrast ratio (4.5:1) against white backgrounds
        const accessibleColors = [
            '#DC2626', // Red - high contrast red
            '#EA580C', // Orange - distinct from red
            '#CA8A04', // Gold - darker yellow for contrast
            '#16A34A', // Green - distinct from orange/red
            '#0284C7', // Blue - clear blue tone
            '#7C3AED', // Purple - distinct from blue
            '#BE185D', // Magenta - distinct from purple
            '#059669', // Emerald - distinct from green
            '#0891B2', // Cyan - distinct from blue
            '#7C2D12', // Brown - earth tone
            '#1F2937', // Dark gray - neutral
            '#B91C1C', // Dark red variant
            '#F59E0B', // Amber - warm tone
            '#10B981', // Teal green
            '#8B5CF6', // Violet - lighter purple
            '#EC4899'  // Pink - distinct magenta
        ];
        
        // Pattern definitions for texture overlays to help distinguish colors
        const texturePatterns = [
            'none',           // Solid fill
            'diagonal-lines', // Diagonal stripes
            'dots',          // Dot pattern
            'vertical-lines', // Vertical stripes
            'horizontal-lines', // Horizontal stripes
            'cross-hatch',   // Cross hatch pattern
            'circles',       // Circle pattern
            'waves',         // Wave pattern
            'grid',          // Grid pattern
            'zigzag',        // Zigzag pattern
            'triangles',     // Triangle pattern
            'diamonds',      // Diamond pattern
            'hexagons',      // Hexagon pattern
            'stars',         // Star pattern
            'plus',          // Plus sign pattern
            'x-pattern'      // X pattern
        ];
        
        // Helper function to convert hex color to numerical value for ordering
        const hexToOrderValue = (hexColor) => {
            // Remove # if present and convert to integer
            const hex = hexColor.replace('#', '');
            return parseInt(hex, 16);
        };
        
        // Create mapping from error type to accessible color and texture pattern
        const localColorMap = {};
        const localPatternMap = {};
        const localColorOrder = {}; // Track color order for sorting based on hex values
        sortedErrorTypesForMapping.forEach((errorType, index) => {
            const colorIndex = index % accessibleColors.length;
            const patternIndex = index % texturePatterns.length;
            const assignedColor = accessibleColors[colorIndex];
            localColorMap[errorType] = assignedColor;
            localPatternMap[errorType] = texturePatterns[patternIndex];
            // Use hex value for ordering instead of array index
            localColorOrder[errorType] = hexToOrderValue(assignedColor);
        });
        
        const getLocalColorOrder = (errorType) => {
            return localColorOrder[errorType] || 999999999; // Use large number as fallback for hex values
        };
        const now = new Date();
        let timeRangeMs;
        
        switch (timeRange) {
            case '1d':
                timeRangeMs = 24 * 60 * 60 * 1000;
                break;
            case '7d':
                timeRangeMs = 7 * 24 * 60 * 60 * 1000;
                break;
            case '30d':
            default:
                timeRangeMs = 30 * 24 * 60 * 60 * 1000;
                break;
        }
        
        const startTime = new Date(now.getTime() - timeRangeMs);
        
        // Create time buckets
        const bucketSize = timeRange === '1d' ? 2 * 60 * 60 * 1000 : // 2 hour buckets for 1 day
                          timeRange === '7d' ? 12 * 60 * 60 * 1000 : // 12 hour buckets for 1 week
                          24 * 60 * 60 * 1000; // 1 day buckets for 1 month
        
        const buckets = new Map();
        
        // Initialize buckets
        for (let time = startTime.getTime(); time <= now.getTime(); time += bucketSize) {
            const bucketKey = Math.floor(time / bucketSize) * bucketSize;
            buckets.set(bucketKey, { timestamp: new Date(bucketKey) });
        }
        
        if (showAPIComparison) {
            // API comparison mode - show all actual Sentry error types + HubSpot as separate groups
            
            // Get all unique issue categories from actual Sentry events (using real API data)
            const allSentryTypes = new Set();
            events?.forEach(event => {
                // Use the processed issueCategory field from AppState.js (derived from issue.metadata.type || issue.type)
                const errorType = event.issueCategory || event.type || 'Unknown Error';
                allSentryTypes.add(errorType);
            });
            
            // Get all unique issue categories from HubSpot events  
            const allHubSpotTypes = new Set();
            hubspotEvents?.forEach(event => {
                const errorType = event.issueCategory || event.category || event.type || 'Unknown Error';
                allHubSpotTypes.add(errorType);
            });
            
            // Initialize buckets with all discovered error types based on selected API
            buckets.forEach(bucket => {
                if (selectedAPI === 'sentry') {
                    // Initialize only Sentry error type counters
                    allSentryTypes.forEach(type => {
                        bucket[`sentry_${type}`] = 0;
                    });
                } else if (selectedAPI === 'hubspot') {
                    // Initialize only HubSpot error type counters
                    allHubSpotTypes.forEach(type => {
                        bucket[`hubspot_${type}`] = 0;
                    });
                }
            });
            
            // Process events based on selected API
            if (selectedAPI === 'sentry') {
                // Process Sentry events using actual API data structure
                events?.forEach(event => {
                    // Use consistent timestamp field as defined in AppState.js and dataFilters.js
                    const eventTime = new Date(event.dateCreated || event.timestamp || event.lastSeen);
                    if (eventTime >= startTime) {
                        const bucketKey = Math.floor(eventTime.getTime() / bucketSize) * bucketSize;
                        if (buckets.has(bucketKey)) {
                            const bucket = buckets.get(bucketKey);
                            // Use issueCategory from processed data (derived from issue.metadata.type || issue.type)
                            const errorType = event.issueCategory || event.type || 'Unknown Error';
                            
                            // Only process if no error type filter is set, or if this error type is selected
                            if (selectedErrorTypes.size === 0 || selectedErrorTypes.has(errorType)) {
                                const sentryKey = `sentry_${errorType}`;
                                bucket[sentryKey]++;
                            }
                        }
                    }
                });
            } else if (selectedAPI === 'hubspot') {
                // Process HubSpot events using issueCategory
                hubspotEvents?.forEach(event => {
                    const eventTime = new Date(event.timestamp || event.created_at || event.dateCreated);
                    if (eventTime >= startTime) {
                        const bucketKey = Math.floor(eventTime.getTime() / bucketSize) * bucketSize;
                        if (buckets.has(bucketKey)) {
                            const bucket = buckets.get(bucketKey);
                            const errorType = event.issueCategory || event.category || event.type || 'Unknown Error';
                            
                            // Only process if no error type filter is set, or if this error type is selected
                            if (selectedErrorTypes.size === 0 || selectedErrorTypes.has(errorType)) {
                                const hubspotKey = `hubspot_${errorType}`;
                                bucket[hubspotKey]++;
                            }
                        }
                    }
                });
            }
            
            let sentryErrorTypes = Array.from(allSentryTypes).map(type => `sentry_${type}`);
            let hubspotErrorTypes = Array.from(allHubSpotTypes).map(type => `hubspot_${type}`);
            
            // Filter error types based on selection
            if (selectedErrorTypes.size > 0) {
                sentryErrorTypes = sentryErrorTypes.filter(type => {
                    const errorType = type.replace('sentry_', '');
                    return selectedErrorTypes.has(errorType);
                });
                hubspotErrorTypes = hubspotErrorTypes.filter(type => {
                    const errorType = type.replace('hubspot_', '');
                    return selectedErrorTypes.has(errorType);
                });
            }
            
            // Filter by selected API
            if (selectedAPI === 'sentry') {
                hubspotErrorTypes = [];
            } else if (selectedAPI === 'hubspot') {
                sentryErrorTypes = [];
            }
            
            // Sort error types by hex color order for consistent stacking (highest hex = top)
            sentryErrorTypes.sort((a, b) => {
                const errorTypeA = a.replace('sentry_', '');
                const errorTypeB = b.replace('sentry_', '');
                return getLocalColorOrder(errorTypeB) - getLocalColorOrder(errorTypeA); // Highest hex on top
            });
            
            hubspotErrorTypes.sort((a, b) => {
                const errorTypeA = a.replace('hubspot_', '');
                const errorTypeB = b.replace('hubspot_', '');
                return getLocalColorOrder(errorTypeB) - getLocalColorOrder(errorTypeA); // Highest hex on top
            });
            
            return {
                data: Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp),
                sentryErrorTypes,
                hubspotErrorTypes,
                allErrorTypes: [...sentryErrorTypes, ...hubspotErrorTypes],
                colorMap: localColorMap,
                patternMap: localPatternMap,
                colorOrder: localColorOrder
            };
        } else {
            // Error type breakdown mode
            const errorTypes = new Set();
            
            // Process events and categorize by error type/level
            events?.forEach(event => {
                const eventTime = new Date(event.timestamp || event.dateCreated || event.lastSeen);
                if (eventTime >= startTime) {
                    const bucketKey = Math.floor(eventTime.getTime() / bucketSize) * bucketSize;
                    if (buckets.has(bucketKey)) {
                        const bucket = buckets.get(bucketKey);
                        const errorType = event.level || event.type || 'error';
                        errorTypes.add(errorType);
                        
                        if (!bucket[errorType]) {
                            bucket[errorType] = 0;
                        }
                        bucket[errorType]++;
                    }
                }
            });
            
            // Fill missing error types with 0
            buckets.forEach(bucket => {
                errorTypes.forEach(type => {
                    if (!bucket[type]) {
                        bucket[type] = 0;
                    }
                });
            });
            
            return {
                data: Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp),
                errorTypes: Array.from(errorTypes),
                colorMap: localColorMap,
                patternMap: localPatternMap,
                colorOrder: localColorOrder
            };
        }
    }, [events, hubspotEvents, timeRange, showAPIComparison, selectedAPI, selectedErrorTypes]);
    
    const errorTypeButtons = useMemo(() => {
        if (!showAPIComparison) return [];
        
        // Dynamically collect error types based on selected API
        const allErrorTypes = new Set();
        
        if (selectedAPI === 'sentry') {
            // Get Sentry error types from events
            events?.forEach(event => {
                const errorType = event.issueCategory || event.type || 'Unknown Error';
                allErrorTypes.add(errorType);
            });
        } else if (selectedAPI === 'hubspot') {
            // Get HubSpot error types from hubspotEvents
            hubspotEvents?.forEach(event => {
                const errorType = event.issueCategory || event.category || event.type || 'Unknown Error';
                allErrorTypes.add(errorType);
            });
        }
        
        // Convert to array and sort alphabetically first
        return Array.from(allErrorTypes).sort();
    }, [events, hubspotEvents, showAPIComparison, selectedAPI]);
    
    // Sort error type buttons by hex color value order after chartData is available (highest hex = first)
    const sortedErrorTypeButtons = useMemo(() => {
        if (!chartData.colorOrder) return errorTypeButtons;
        
        return [...errorTypeButtons].sort((a, b) => {
            const orderA = chartData.colorOrder[a] || 999999999;
            const orderB = chartData.colorOrder[b] || 999999999;
            return orderB - orderA; // Highest hex values first
        });
    }, [errorTypeButtons, chartData]);

    // Function to get the color for an error type button using consistent colors
    const getColorForErrorTypeButton = (errorType, index) => {
        return getConsistentColorForErrorType(errorType);
    };
    
    // Function to create inline SVG pattern for buttons (since they can't use external patterns)
    const getInlinePatternStyle = (errorType) => {
        const pattern = getPatternForErrorType(errorType);
        const color = getConsistentColorForErrorType(errorType);
        
        if (pattern === 'none') {
            return { backgroundColor: color, backgroundImage: 'none' };
        }
        
        // Create CSS background patterns for buttons
        const patterns = {
            'diagonal-lines': `linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%), linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%)`,
            'dots': `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 2px, transparent 2px)`,
            'vertical-lines': `repeating-linear-gradient(90deg, ${color}, ${color} 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 6px)`,
            'horizontal-lines': `repeating-linear-gradient(0deg, ${color}, ${color} 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 6px)`,
            'cross-hatch': `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`,
            'grid': `repeating-linear-gradient(0deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 8px)`
        };
        
        return {
            backgroundColor: color,
            backgroundImage: patterns[pattern] || 'none',
            backgroundSize: pattern === 'dots' ? '10px 10px' : 'auto'
        };
    };
    
    const getColorForErrorType = (errorType) => {
        // For non-API comparison mode, still use the pattern system
        return getColorWithPattern(errorType);
    };
    
    const getConsistentColorForErrorType = (errorType) => {
        return chartData.colorMap?.[errorType] || '#757575';
    };
    
    const getPatternForErrorType = (errorType) => {
        return chartData.patternMap?.[errorType] || 'none';
    };
    
    const getPatternIdForErrorType = (errorType) => {
        const pattern = getPatternForErrorType(errorType);
        return pattern === 'none' ? null : `${patternsSvgId}-${errorType.replace(/[^a-zA-Z0-9]/g, '-')}`;
    };
    
    const getColorWithPattern = (errorType) => {
        // For MUI X Charts, we need to use solid colors and apply patterns via CSS
        return getConsistentColorForErrorType(errorType);
    };
    
    const getPatternDataAttribute = (errorType) => {
        const pattern = getPatternForErrorType(errorType);
        return pattern !== 'none' ? pattern : null;
    };
    
    
    // Apply patterns to chart bars after rendering
    useEffect(() => {
        if (!chartData.patternMap) return;
        
        const timer = setTimeout(() => {
            // Find all bar elements in the chart
            const chartContainer = document.querySelector('.MuiBarChart-root');
            if (!chartContainer) return;
            
            const bars = chartContainer.querySelectorAll('rect');
            bars.forEach((bar, index) => {
                // Skip non-data bars (axes, etc.)
                if (!bar.getAttribute('fill') || bar.getAttribute('fill') === 'none') return;
                
                const fillColor = bar.getAttribute('fill');
                
                // Find matching error type by color
                let matchingErrorType = null;
                Object.keys(chartData.colorMap).forEach(errorType => {
                    if (chartData.colorMap[errorType] === fillColor) {
                        matchingErrorType = errorType;
                    }
                });
                
                if (matchingErrorType && chartData.patternMap[matchingErrorType] !== 'none') {
                    // Create pattern overlay
                    const patternType = chartData.patternMap[matchingErrorType];
                    const patternOverlay = createPatternOverlay(bar, patternType, fillColor);
                    
                    if (patternOverlay) {
                        bar.parentNode.insertBefore(patternOverlay, bar.nextSibling);
                    }
                }
            });
        }, 100); // Small delay to ensure chart is rendered
        
        return () => clearTimeout(timer);
    }, [chartData.data, chartData.colorMap, chartData.patternMap]);
    
    const createPatternOverlay = (barElement, patternType, baseColor) => {
        const rect = barElement.getBoundingClientRect();
        const chartContainer = document.querySelector('.MuiBarChart-root');
        const chartRect = chartContainer.getBoundingClientRect();
        
        // Get bar dimensions and position relative to chart
        const x = parseFloat(barElement.getAttribute('x') || 0);
        const y = parseFloat(barElement.getAttribute('y') || 0);
        const width = parseFloat(barElement.getAttribute('width') || 0);
        const height = parseFloat(barElement.getAttribute('height') || 0);
        
        if (width <= 0 || height <= 0) return null;
        
        // Create pattern definition if it doesn't exist
        let defs = chartContainer.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            chartContainer.appendChild(defs);
        }
        
        const patternId = `pattern-${patternType}-${Math.random().toString(36).substr(2, 9)}`;
        const pattern = createSVGPatternElement(patternId, patternType, baseColor);
        defs.appendChild(pattern);
        
        // Create overlay rectangle with pattern
        const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        overlay.setAttribute('x', x);
        overlay.setAttribute('y', y);
        overlay.setAttribute('width', width);
        overlay.setAttribute('height', height);
        overlay.setAttribute('fill', `url(#${patternId})`);
        overlay.setAttribute('pointer-events', 'none');
        
        return overlay;
    };
    
    const createSVGPatternElement = (patternId, patternType, baseColor) => {
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', patternId);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        switch (patternType) {
            case 'diagonal-lines':
                pattern.setAttribute('width', '8');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="8" height="8" fill="${baseColor}"/>
                    <path d="M0,8 L8,0" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'dots':
                pattern.setAttribute('width', '10');
                pattern.setAttribute('height', '10');
                pattern.innerHTML = `
                    <rect width="10" height="10" fill="${baseColor}"/>
                    <circle cx="5" cy="5" r="2" fill="rgba(255,255,255,0.5)"/>
                `;
                break;
            case 'vertical-lines':
                pattern.setAttribute('width', '8');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="8" height="8" fill="${baseColor}"/>
                    <line x1="4" y1="0" x2="4" y2="8" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'horizontal-lines':
                pattern.setAttribute('width', '8');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="8" height="8" fill="${baseColor}"/>
                    <line x1="0" y1="4" x2="8" y2="4" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'cross-hatch':
                pattern.setAttribute('width', '8');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="8" height="8" fill="${baseColor}"/>
                    <path d="M0,8 L8,0 M0,0 L8,8" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                `;
                break;
            case 'circles':
                pattern.setAttribute('width', '12');
                pattern.setAttribute('height', '12');
                pattern.innerHTML = `
                    <rect width="12" height="12" fill="${baseColor}"/>
                    <circle cx="6" cy="6" r="3" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
                `;
                break;
            case 'waves':
                pattern.setAttribute('width', '16');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="16" height="8" fill="${baseColor}"/>
                    <path d="M0,4 Q4,0 8,4 T16,4" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'grid':
                pattern.setAttribute('width', '10');
                pattern.setAttribute('height', '10');
                pattern.innerHTML = `
                    <rect width="10" height="10" fill="${baseColor}"/>
                    <path d="M0,0 L10,0 L10,10 L0,10 Z M5,0 L5,10 M0,5 L10,5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                `;
                break;
            case 'zigzag':
                pattern.setAttribute('width', '12');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `
                    <rect width="12" height="8" fill="${baseColor}"/>
                    <path d="M0,4 L3,0 L6,4 L9,0 L12,4" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'triangles':
                pattern.setAttribute('width', '12');
                pattern.setAttribute('height', '12');
                pattern.innerHTML = `
                    <rect width="12" height="12" fill="${baseColor}"/>
                    <polygon points="6,2 10,8 2,8" fill="rgba(255,255,255,0.3)"/>
                `;
                break;
            case 'diamonds':
                pattern.setAttribute('width', '12');
                pattern.setAttribute('height', '12');
                pattern.innerHTML = `
                    <rect width="12" height="12" fill="${baseColor}"/>
                    <polygon points="6,1 10,6 6,11 2,6" fill="rgba(255,255,255,0.3)"/>
                `;
                break;
            case 'plus':
                pattern.setAttribute('width', '10');
                pattern.setAttribute('height', '10');
                pattern.innerHTML = `
                    <rect width="10" height="10" fill="${baseColor}"/>
                    <path d="M5,2 L5,8 M2,5 L8,5" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            case 'x-pattern':
                pattern.setAttribute('width', '10');
                pattern.setAttribute('height', '10');
                pattern.innerHTML = `
                    <rect width="10" height="10" fill="${baseColor}"/>
                    <path d="M2,2 L8,8 M8,2 L2,8" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                `;
                break;
            default:
                pattern.setAttribute('width', '8');
                pattern.setAttribute('height', '8');
                pattern.innerHTML = `<rect width="8" height="8" fill="${baseColor}"/>`;
        }
        
        return pattern;
    };
    
    const getColorOrder = (errorType) => {
        return chartData.colorOrder?.[errorType] || 999999999; // Use large number as fallback for hex values
    };
    
    const getRainbowColor = (index, total) => {
        // This is now deprecated in favor of getConsistentColorForErrorType
        const rainbowColors = [
            '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795', 
            '#3182ce', '#805ad5', '#d53f8c', '#f56500', '#ecc94b',
            '#48bb78', '#4fd1c7', '#4299e1', '#9f7aea', '#ed64a6'
        ];
        return rainbowColors[index % rainbowColors.length];
    };
    
    const getColorForAPIErrorType = (apiErrorType, errorIndex = 0) => {
        // Extract the error type from the API-specific prefix
        const errorType = apiErrorType.replace('sentry_', '').replace('hubspot_', '');
        return getColorWithPattern(errorType);
    };
    
    const handleBarClick = (event, dataIndex, seriesId) => {
        if (dataIndex !== undefined && seriesId && showAPIComparison) {
            const clickedBucket = chartData.data[dataIndex];
            const timestamp = clickedBucket.timestamp;
            
            // Determine which API and error type was clicked
            const api = seriesId.startsWith('sentry_') ? 'sentry' : 'hubspot';
            const errorType = seriesId.replace('sentry_', '').replace('hubspot_', '');
            
            // Get the specific events for this time bucket and error type
            const bucketSize = timeRange === '1d' ? 2 * 60 * 60 * 1000 : 
                              timeRange === '7d' ? 12 * 60 * 60 * 1000 : 
                              24 * 60 * 60 * 1000;
            
            const bucketStart = new Date(timestamp);
            const bucketEnd = new Date(timestamp.getTime() + bucketSize);
            
            let relevantEvents = [];
            
            if (api === 'sentry') {
                relevantEvents = events?.filter(event => {
                    // Use consistent timestamp field as in data processing
                    const eventTime = new Date(event.dateCreated || event.timestamp || event.lastSeen);
                    const eventType = event.issueCategory || event.type || 'Unknown Error';
                    return eventTime >= bucketStart && 
                           eventTime < bucketEnd && 
                           eventType === errorType;
                }) || [];
            } else if (api === 'hubspot') {
                relevantEvents = hubspotEvents?.filter(event => {
                    const eventTime = new Date(event.timestamp || event.created_at || event.dateCreated);
                    const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
                    return eventTime >= bucketStart && 
                           eventTime < bucketEnd && 
                           eventType === errorType;
                }) || [];
            }
            
            const newInvestigationData = {
                api,
                errorType,
                timestamp,
                bucketStart,
                bucketEnd,
                events: relevantEvents,
                seriesId
            };
            
            setInvestigationData(newInvestigationData);
            
            // Communicate investigation data to parent component
            if (onInvestigationChange) {
                onInvestigationChange(newInvestigationData);
            }
        }
        
        if (onFilterChange && dataIndex !== undefined) {
            const clickedData = chartData.data[dataIndex];
            onFilterChange(clickedData);
        }
    };
    
    const handleLegendClick = (seriesId) => {
        const newHighlighted = highlightedSeries === seriesId ? null : seriesId;
        setHighlightedSeries(newHighlighted);
        
        if (onFilterChange) {
            onFilterChange(newHighlighted ? { errorType: seriesId } : null);
        }
    };

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
            // Optionally refresh data or show success message
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
        
        // For now, assign to current user - could be enhanced with user selection dialog
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
    
    if (!chartData.data.length || (!chartData.errorTypes?.length && !chartData.allErrorTypes?.length)) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <Typography color="text.secondary">No error data available</Typography>
            </Box>
        );
    }

    const handleErrorTypeToggle = (errorType, event) => {
        // Check for alt/option key press to clear all selections
        if (event?.altKey || event?.metaKey) {
            setSelectedErrorTypes(new Set());
            return;
        }
        
        const newSelectedTypes = new Set(selectedErrorTypes);
        if (newSelectedTypes.has(errorType)) {
            newSelectedTypes.delete(errorType);
        } else {
            newSelectedTypes.add(errorType);
        }
        setSelectedErrorTypes(newSelectedTypes);
    };
    
    const handleErrorTypeClick = (errorType) => {
        // Find all events of this type regardless of time
        const allSentryEvents = events?.filter(event => {
            const eventType = event.issueCategory || event.type || 'Unknown Error';
            return eventType === errorType;
        }) || [];
        
        const allHubSpotEvents = hubspotEvents?.filter(event => {
            const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
            return eventType === errorType;
        }) || [];
        
        const combinedEvents = [...allSentryEvents, ...allHubSpotEvents];
        
        if (combinedEvents.length > 0) {
            // Determine primary API - if exists in both, show which has more events, if tie then prefer Sentry
            let api, seriesId;
            if (allSentryEvents.length > allHubSpotEvents.length) {
                api = 'sentry';
                seriesId = `sentry_${errorType}`;
            } else if (allHubSpotEvents.length > allSentryEvents.length) {
                api = 'hubspot';
                seriesId = `hubspot_${errorType}`;
            } else if (allSentryEvents.length > 0) {
                // Tie or equal, prefer Sentry
                api = 'sentry';
                seriesId = `sentry_${errorType}`;
            } else {
                api = 'hubspot';
                seriesId = `hubspot_${errorType}`;
            }
            
            const newInvestigationData = {
                api: allSentryEvents.length > 0 && allHubSpotEvents.length > 0 ? 'mixed' : api, // Show mixed if both APIs have this error
                errorType,
                timestamp: new Date(),
                bucketStart: new Date(0), // Start of time
                bucketEnd: new Date(), // Now
                events: combinedEvents,
                seriesId,
                isGlobalFilter: true,
                sentryCount: allSentryEvents.length,
                hubspotCount: allHubSpotEvents.length
            };
            
            setInvestigationData(newInvestigationData);
            
            if (onInvestigationChange) {
                onInvestigationChange(newInvestigationData);
            }
        }
    };

    const updateInvestigationTimeRange = (newTimeRange) => {
        setTimeRange(newTimeRange);
        if (investigationData) {
            // Trigger investigation data refresh with new time range
            setInvestigationData({ ...investigationData, timeRangeChanged: true });
        }
    };
    
    const updateInvestigationAPI = (newAPI) => {
        setSelectedAPI(newAPI);
        // Clear selected error types when switching APIs to prevent "No data available" bug
        setSelectedErrorTypes(new Set());
        if (investigationData) {
            // Close investigation panel when API changes
            setInvestigationData(null);
            if (onInvestigationChange) {
                onInvestigationChange(null);
            }
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            
            {/* API and Time Range Controls */}
            {showAPIComparison && (
                <Box mb={2}>
                    <Box display="flex" gap={2} alignItems="center" mb={2}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>API</InputLabel>
                            <Select
                                value={selectedAPI}
                                label="API"
                                onChange={(e) => updateInvestigationAPI(e.target.value)}
                            >
                                <MenuItem value="sentry">Sentry</MenuItem>
                                <MenuItem value="hubspot">HubSpot</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <ToggleButtonGroup
                            value={timeRange}
                            exclusive
                            onChange={(e, val) => val && updateInvestigationTimeRange(val)}
                            aria-label="Time range"
                            size="small"
                        >
                            <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
                            <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
                            <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
                        </ToggleButtonGroup>
                        
                        {selectedErrorTypes.size > 0 && (
                            <Button 
                                size="small" 
                                variant="outlined" 
                                onClick={() => setSelectedErrorTypes(new Set())}
                                sx={{ minWidth: 'auto', px: 1 }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        Error Types (multi-select with latching - click to toggle, alt+click to clear all):
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                        {sortedErrorTypeButtons.map((errorType, index) => {
                            const buttonColor = getColorForErrorTypeButton(errorType, index);
                            const patternStyle = getInlinePatternStyle(errorType);
                            const isSelected = selectedErrorTypes.has(errorType);
                            return (
                                <Chip
                                    key={errorType}
                                    label={errorType}
                                    onClick={(event) => handleErrorTypeToggle(errorType, event)}
                                    size="small"
                                    sx={{ 
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? patternStyle.backgroundColor : 'transparent',
                                        backgroundImage: isSelected ? patternStyle.backgroundImage : 'none',
                                        backgroundSize: isSelected ? patternStyle.backgroundSize : 'auto',
                                        color: isSelected ? 'white' : buttonColor,
                                        border: `2px solid ${buttonColor}`,
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        textShadow: isSelected ? '1px 1px 1px rgba(0,0,0,0.5)' : 'none',
                                        '&:hover': {
                                            backgroundColor: patternStyle.backgroundColor,
                                            backgroundImage: patternStyle.backgroundImage,
                                            backgroundSize: patternStyle.backgroundSize,
                                            color: 'white',
                                            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                                            opacity: 0.8,
                                            transform: 'scale(1.02)'
                                        },
                                        '&:active': {
                                            transform: 'scale(0.98)'
                                        }
                                    }}
                                />
                            );
                        })}
                    </Box>
                    
                </Box>
            )}
            
            {/* Filter chips */}
            {selectedFilter && (
                <Box mb={2}>
                    <Chip
                        label={`Filtered: ${selectedFilter.errorType || 'Time Range'}`}
                        onDelete={() => onFilterChange && onFilterChange(null)}
                        color="primary"
                        variant="outlined"
                    />
                </Box>
            )}
            
            <Box height={566}> {/* 400 * 1.414 = 566 */}
                <BarChart
                    dataset={chartData.data}
                    xAxis={[{
                        dataKey: 'timestamp',
                        scaleType: 'band',
                        valueFormatter: (date) => {
                            if (timeRange === '1d') {
                                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            } else if (timeRange === '7d') {
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            } else {
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }
                        }
                    }]}
                    yAxis={[{
                        tickFormatter: (value) => {
                            // Only show integer values on Y-axis
                            if (Number.isInteger(value)) {
                                return value.toString();
                            }
                            return '';
                        }
                    }]}
                    series={showAPIComparison ? 
                        [
                            // Sentry error types with stack group 'sentry'
                            ...chartData.sentryErrorTypes.map((errorType, index) => ({
                                id: errorType, // Add explicit id to ensure seriesId matches
                                dataKey: errorType,
                                label: errorType.replace('sentry_', ''),
                                color: getColorForAPIErrorType(errorType),
                                stack: 'sentry',
                                highlightScope: { highlighted: 'series', faded: 'global' },
                                opacity: highlightedSeries && highlightedSeries !== errorType ? 0.3 : 1
                            })),
                            // HubSpot error types with stack group 'hubspot'
                            ...chartData.hubspotErrorTypes.map((errorType, index) => ({
                                id: errorType, // Add explicit id to ensure seriesId matches
                                dataKey: errorType,
                                label: errorType.replace('hubspot_', ''),
                                color: getColorForAPIErrorType(errorType),
                                stack: 'hubspot',
                                highlightScope: { highlighted: 'series', faded: 'global' },
                                opacity: highlightedSeries && highlightedSeries !== errorType ? 0.3 : 1
                            }))
                        ] :
                        chartData.errorTypes.map(errorType => ({
                            dataKey: errorType,
                            label: errorType.charAt(0).toUpperCase() + errorType.slice(1),
                            color: getColorForErrorType(errorType),
                            stack: 'errors',
                            highlightScope: { highlighted: 'series', faded: 'global' },
                            opacity: highlightedSeries && highlightedSeries !== errorType ? 0.3 : 1
                        }))
                    }
                    height={566}
                    margin={{ left: 60, right: 20, top: 20, bottom: 100 }}
                    onItemClick={(event, d) => {
                        if (d && d.dataIndex !== undefined) {
                            handleBarClick(event, d.dataIndex, d.seriesId);
                        }
                    }}
                    slotProps={{
                        legend: { hidden: false },
                        tooltip: {
                            content: ({ active, payload, label }) => {
                                // console.log("Tooltip Payload:", payload);
                                if (active && payload && payload.length) {
                                    // Filter out entries with value 0 or undefined, and ensure value > 0
                                    const nonZeroPayload = payload.filter(entry => {
                                        return entry && 
                                               entry.value !== undefined && 
                                               entry.value !== null && 
                                               Number(entry.value) > 0;
                                    });
                                    
                                    if (nonZeroPayload.length === 0) {
                                        return null;
                                    }
                                    
                                    return (
                                        <Box 
                                            sx={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #ccc',
                                                borderRadius: 1,
                                                padding: 1,
                                                boxShadow: 2
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {label && new Date(label).toLocaleDateString()}
                                            </Typography>
                                            {nonZeroPayload
                                                .sort((a, b) => Number(b.value) - Number(a.value)) // Sort by value descending
                                                .map((entry, index) => (
                                                <Box key={index} display="flex" alignItems="center" gap={1}>
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            backgroundColor: entry.color,
                                                            borderRadius: '2px'
                                                        }}
                                                    />
                                                    <Typography variant="body2">
                                                        {entry.name?.replace('sentry_', '').replace('hubspot_', '')}: {entry.value}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    );
                                }
                                return null;
                            }
                        }
                    }}
                />
            </Box>
            
            {/* Investigation Panel */}
            {investigationData && (
                <Card sx={{ mt: 3, border: `2px solid ${getConsistentColorForErrorType(investigationData.errorType)}` }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ color: getConsistentColorForErrorType(investigationData.errorType) }}>
                                Investigating: {investigationData.api.toUpperCase()} {investigationData.errorType.toUpperCase()} Errors
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 90 }}>
                                    <InputLabel>API</InputLabel>
                                    <Select
                                        value={selectedAPI}
                                        label="API"
                                        onChange={(e) => updateInvestigationAPI(e.target.value)}
                                    >
                                        <MenuItem value="sentry">Sentry</MenuItem>
                                        <MenuItem value="hubspot">HubSpot</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <ToggleButtonGroup
                                    value={timeRange}
                                    exclusive
                                    onChange={(e, val) => val && updateInvestigationTimeRange(val)}
                                    aria-label="Time range"
                                    size="small"
                                >
                                    <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
                                    <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
                                    <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
                                </ToggleButtonGroup>
                                
                                <IconButton size="small" onClick={() => {
                                    setInvestigationData(null);
                                    if (onInvestigationChange) {
                                        onInvestigationChange(null);
                                    }
                                }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Box>
                        
                        <Box mb={2}>
                            {!investigationData.isGlobalFilter ? (
                                <Chip 
                                    label={`Time Range: ${investigationData.bucketStart.toLocaleString()} - ${investigationData.bucketEnd.toLocaleString()}`}
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
                                label={`${investigationData.events.length} events found`}
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 1, mb: 1 }}
                            />
                            {investigationData.api === 'mixed' ? (
                                <>
                                    <Chip 
                                        label={`SENTRY: ${investigationData.sentryCount} events`}
                                        sx={{ 
                                            backgroundColor: getConsistentColorForErrorType(investigationData.errorType),
                                            color: 'white',
                                            mr: 1, mb: 1 
                                        }}
                                    />
                                    <Chip 
                                        label={`HUBSPOT: ${investigationData.hubspotCount} events`}
                                        sx={{ 
                                            backgroundColor: getConsistentColorForErrorType(investigationData.errorType),
                                            color: 'white',
                                            mr: 1, mb: 1 
                                        }}
                                    />
                                </>
                            ) : (
                                <Chip 
                                    label={`API: ${investigationData.api.toUpperCase()}`}
                                    sx={{ 
                                        backgroundColor: getConsistentColorForErrorType(investigationData.errorType),
                                        color: 'white',
                                        mr: 1, mb: 1 
                                    }}
                                />
                            )}
                        </Box>
                        
                        {investigationData.events.length > 0 ? (
                            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {investigationData.events
                                    .filter(event => {
                                        // Filter out events that don't match the selected error type
                                        const eventType = event.issueCategory || event.category || event.type || 'Unknown Error';
                                        return eventType === investigationData.errorType;
                                    })
                                    .sort((a, b) => new Date(b.dateCreated || b.timestamp || b.lastSeen) - new Date(a.dateCreated || a.timestamp || a.lastSeen))
                                    .map((event, index) => (
                                    <React.Fragment key={event.id || index}>
                                        <ListItem alignItems="flex-start">
                                            <Box sx={{ width: '100%' }}>
                                                {/* Primary content */}
                                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Chip 
                                                            label={investigationData.errorType}
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: getConsistentColorForErrorType(investigationData.errorType),
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
                                        {index < investigationData.events.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography color="text.secondary" textAlign="center" py={2}>
                                No specific events found for this time period and error type.
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            )}

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
        </Box>
    );
}