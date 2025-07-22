// Performance monitoring hooks for better UX

import { useState, useEffect, useRef } from 'react';

export const usePerformanceMonitor = (operation) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [lastOperationTime, setLastOperationTime] = useState(null);
    const timeoutRef = useRef(null);

    const startOptimization = () => {
        setIsOptimizing(true);
        const startTime = performance.now();
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Set a minimum loading time for better UX perception
        timeoutRef.current = setTimeout(() => {
            const endTime = performance.now();
            setLastOperationTime(endTime - startTime);
            setIsOptimizing(false);
        }, 100); // Minimum 100ms for perception of responsiveness
    };

    const finishOptimization = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOptimizing(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        isOptimizing,
        lastOperationTime,
        startOptimization,
        finishOptimization
    };
};

export const useDataLoadingState = () => {
    const [loadingStates, setLoadingStates] = useState({
        initial: true,
        filtering: false,
        refreshing: false
    });

    const setLoadingState = (state, value) => {
        setLoadingStates(prev => ({
            ...prev,
            [state]: value
        }));
    };

    const isAnyLoading = Object.values(loadingStates).some(state => state);

    return {
        loadingStates,
        setLoadingState,
        isAnyLoading
    };
};