/*
  src/index.js
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
	<QueryClientProvider client={queryClient}>
		<CssBaseline />
			<App />
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
  </React.StrictMode>
);
