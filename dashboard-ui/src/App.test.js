import { waitFor, render, screen } from '@testing-library/react';
import React from "react";
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './queryClient';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));

test('Loads sentry properly', async () => {
	render(
		<QueryClientProvider client={queryClient}>
			<CssBaseline />
			<App />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
	await waitFor(() => {
		expect(screen.queryAllByText("Sentry")).not.toBe([]);
	});
	await waitFor(() => {
		expect(screen.queryByText("Loading Sentry Data...")).toBe(null);
	});
});
