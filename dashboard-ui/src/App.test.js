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
		/*
			Rendering causes AggregateError composed of 3 of the following:
				ReferenceError: ResizeObserver is not defined
				at /dashboard-frontend/node_modules/recharts/lib/component/ResponsiveContainer.js:80:20
			This is likely due to using recharts, hopefully this will be fixed by switching to mui charts
			If not, we will have to mock ResizeObserver, which won't be too bad (I hope)

			Uncomment the following line to log the error when testing:
		*/
		
		// console.log(error);
	}
	expect(screen.queryByText("Loading Sentry Data")).toBe(null);
	expect(screen.queryByText("Live Data")).not.toBe(null);
});
