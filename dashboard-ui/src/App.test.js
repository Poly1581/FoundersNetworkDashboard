import { render, screen } from '@testing-library/react';
import React from "react";
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './queryClient';

test('Loads sentry properly', async () => {
	try {
		render(
			<QueryClientProvider client={queryClient}>
				<CssBaseline />
				<App />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		);
	} catch (error) {
		console.log(error);
	}
	expect(queryByText("Loading Sentry Data")).toBe(null);
});
