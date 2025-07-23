/**
 * React Query client configuration
 */
// TODO: Externalize into a .env code and reference it with variables instead of "magic numbers"
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 10 minutes
            cacheTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect by default
            refetchOnReconnect: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});