/**
 * React Hook for Data Manager Integration
 * Provides React components with access to centralized data state
 */

import { useState, useEffect } from 'react';
import dataManager from './dataManager';

/**
 * Custom hook to subscribe to data manager state
 * @returns {Object} Current data state from data manager
 */
export const useDataManager = () => {
    const [data, setData] = useState(dataManager.getData());

    useEffect(() => {
        // Subscribe to data changes
        const unsubscribe = dataManager.subscribe((newData) => {
            setData({ ...newData }); // Create new object to trigger re-render
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    return data;
};

/**
 * Hook to get specific section data
 * @param {string} section - Section name ('sentry' or 'hubspot')
 * @returns {Object} Section-specific data
 */
export const useSectionData = (section) => {
    const data = useDataManager();
    return data[section] || {};
};

/**
 * Hook to get data manager actions
 * @returns {Object} Data manager action methods
 */
export const useDataActions = () => {
    return {
        loadAllData: () => dataManager.loadAllData(),
        refreshSection: (section) => dataManager.refreshSection(section),
        updateIssueStatus: (issueId, status) => dataManager.updateIssueStatus(issueId, status),
        getData: () => dataManager.getData()
    };
};

export default useDataManager;