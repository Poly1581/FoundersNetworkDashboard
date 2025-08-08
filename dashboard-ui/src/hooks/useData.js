/**
 * @fileoverview Custom React hook for data fetching with caching capabilities.
 * 
 * Provides a reusable hook for API data fetching with built-in caching, loading states,
 * and error handling. Uses a Map-based cache to store and retrieve previously fetched
 * data, reducing unnecessary API calls and improving performance. Returns loading,
 * error, and data states along with refresh functionality.
 */

import { useState, useEffect, useCallback } from 'react';

const cache = new Map();

export const useData = (cacheKey, fetcher) => {
    const [data, setData] = useState(cache.get(cacheKey));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!data);

    const fetchData = useCallback(async () => {
        if (cache.has(cacheKey)) {
            setData(cache.get(cacheKey));
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const result = await fetcher();
            cache.set(cacheKey, result);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [cacheKey, fetcher]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = useCallback(() => {
        cache.delete(cacheKey);
        fetchData();
    }, [cacheKey, fetchData]);

    return { data, error, loading, refresh };
};
