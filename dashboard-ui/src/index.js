/**
 * @fileoverview Application entry point and root rendering configuration.
 * 
 * The main entry point for the React application that sets up the root DOM rendering,
 * global providers (React Query, Material-UI CssBaseline, Application State),
 * and development tools. Configures the complete application context and
 * initializes web vitals reporting for performance monitoring.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import reportWebVitals from './reportWebVitals';
import AppState from './context/AppState';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from './services/queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppState>
        <CssBaseline />
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </AppState>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
