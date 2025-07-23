/**
 * React Query hooks for data fetching
 * Replaces the custom dataManager and useDataManager
 */
// TODO: Change to Factory Design Pattern (so nothing changes when we add any other API)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSentryData, updateIssueStatus } from '../api/sentryApi';
import { fetchAllHubSpotData } from '../api/hubspotApi';

// Query keys for consistent caching
export const QUERY_KEYS = {
    SENTRY: ['sentry'],
    HUBSPOT: ['hubspot'],
};

/**
 * Hook to fetch Sentry data
 */
export const useSentryData = () => {
    return useQuery({
        queryKey: QUERY_KEYS.SENTRY,
        queryFn: fetchAllSentryData,
        staleTime: 2 * 60 * 1000, // 2 minutes for real-time-ish data
    });
};

/**
 * Hook to fetch HubSpot data
 */
export const useHubSpotData = () => {
    return useQuery({
        queryKey: QUERY_KEYS.HUBSPOT,
        queryFn: fetchAllHubSpotData,
        staleTime: 5 * 60 * 1000, // 5 minutes for less frequently changing data
    });
};

/**
 * Hook to update issue status with optimistic updates
 */
export const useUpdateIssueStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ issueId, status }) => updateIssueStatus(issueId, status),
        onMutate: async ({ issueId, status }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SENTRY });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(QUERY_KEYS.SENTRY);

            // Optimistically update the cache
            queryClient.setQueryData(QUERY_KEYS.SENTRY, (old) => {
                if (!old) return old;

                return {
                    ...old,
                    issues: old.issues.map(issue =>
                        issue.id === issueId ? { ...issue, status } : issue
                    ),
                };
            });

            // Return a context object with the snapshotted value
            return { previousData };
        },
        onError: (err, variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(QUERY_KEYS.SENTRY, context.previousData);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SENTRY });
        },
    });
};

/**
 * Hook to refresh all data
 */
export const useRefreshAllData = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SENTRY });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HUBSPOT });
    };
};

/**
 * Hook to refresh specific section
 */
export const useRefreshSection = () => {
    const queryClient = useQueryClient();

    return (section) => {
        if (section === 'sentry') {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SENTRY });
        } else if (section === 'hubspot') {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HUBSPOT });
        }
    };
};

/**
 * Combined hook that provides all data and actions
 * This replaces the useDataManager and useDataActions hooks
 */
export const useAppData = () => {
    const sentryQuery = useSentryData();
    const hubspotQuery = useHubSpotData();
    const updateIssueStatusMutation = useUpdateIssueStatus();
    const refreshAllData = useRefreshAllData();
    const refreshSection = useRefreshSection();

    return {
        // Data
        sentry: sentryQuery.data || { loading: sentryQuery.isLoading, error: sentryQuery.error?.message },
        hubspot: hubspotQuery.data || { loading: hubspotQuery.isLoading, error: hubspotQuery.error?.message },

        // Loading states
        isLoading: sentryQuery.isLoading || hubspotQuery.isLoading,

        // Actions
        updateIssueStatus: updateIssueStatusMutation.mutate,
        refreshAllData,
        refreshSection,

        // Query objects for more granular control
        sentryQuery,
        hubspotQuery,
        updateIssueStatusMutation,
    };
};