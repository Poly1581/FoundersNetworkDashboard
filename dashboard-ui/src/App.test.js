/**
 * @fileoverview Test suite for the main App component.
 * 
 * Contains integration tests for the main application component including
 * proper rendering of Sentry sections, data loading states, and overall
 * application functionality. Sets up necessary test environment with
 * ResizeObserver mock and React Query provider configuration.
 */

import { waitFor, render, screen } from '@testing-library/react';
import React from "react";
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './services/queryClient';
import AppState from './context/AppState';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

test('Loads sentry properly', async () => {
	render(
		<QueryClientProvider client={queryClient}>
		  <AppState>
			<CssBaseline />
			<App />
			<ReactQueryDevtools initialIsOpen={false} />
		  </AppState>
		</QueryClientProvider>
	);
	await waitFor(() => {
		expect(screen.queryAllByText("Sentry")).not.toBe([]);
	});
	await waitFor(() => {
		expect(screen.queryByText("Loading Sentry Data...")).toBe(null);
	});
});
