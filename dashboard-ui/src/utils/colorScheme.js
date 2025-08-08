/**
 * @fileoverview Color scheme utilities for consistent UI theming and data visualization.
 * 
 * Provides accessible color palettes and category-specific color mappings used throughout
 * the dashboard for consistent visual representation of error types, statuses, and data
 * categories. Includes functions for generating color appearances and maintaining
 * visual consistency across components and charts.
 */

// Shared color scheme for consistent categorization across all components
export const ACCESSIBLE_COLORS = [
    '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0284C7', '#7C3AED',
    '#BE185D', '#059669', '#0891B2', '#7C2D12', '#1F2937', '#B91C1C',
    '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'
];

// Consistent color mapping for specific error/issue categories
export const CATEGORY_COLOR_MAP = {
    // Sentry/API errors
    'API Rate Limit': '#DC2626',
    'Connection Error': '#EA580C', 
    'Reputation Issue': '#CA8A04',
    'Delivery Issue': '#16A34A',
    'Pipeline Sync Error': '#0284C7',
    'Contact Sync Error': '#7C3AED',
    'Unknown Error': '#757575',
    
    // Additional common categories
    'Authentication Error': '#BE185D',
    'Timeout Error': '#059669',
    'Network Error': '#0891B2',
    'Database Error': '#7C2D12',
    'Permission Error': '#1F2937',
    'Validation Error': '#B91C1C',
    'Configuration Error': '#F59E0B',
    'Service Unavailable': '#10B981',
    'Rate Limiting': '#8B5CF6',
    'Data Processing Error': '#EC4899'
};

// Default fallback color for unknown categories
export const DEFAULT_FALLBACK_COLOR = '#757575';

// Function to get consistent color for any category
export const getConsistentColorForCategory = (category) => {
    return CATEGORY_COLOR_MAP[category] || DEFAULT_FALLBACK_COLOR;
};

// Function to generate appearance maps for dynamic categories (like in charts)
export const generateAppearanceMaps = (allErrorTypes) => {
    const sortedTypes = Array.from(allErrorTypes).sort();
    const colorMap = {}, colorOrder = {};
    const hexToOrderValue = (hex) => parseInt(hex.replace('#', ''), 16);
    
    sortedTypes.forEach((type, index) => {
        // First try to use predefined category colors
        let color = CATEGORY_COLOR_MAP[type];
        
        // If no predefined color, use color from palette
        if (!color) {
            color = ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length];
        }
        
        colorMap[type] = color;
        colorOrder[type] = hexToOrderValue(color);
    });
    
    return { colorMap, colorOrder };
};