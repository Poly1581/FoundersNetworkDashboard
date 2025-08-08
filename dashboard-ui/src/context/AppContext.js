/**
 * @fileoverview React Context for global application state management.
 * 
 * Creates and exports the main React Context used throughout the application
 * for sharing state and methods between components. Provides access to dashboard
 * data, loading states, and state management functions across the component tree.
 */

import { createContext } from 'react';

const AppContext = createContext();

export default AppContext;
