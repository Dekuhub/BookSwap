// Global configuration variables
export const config = {
    // API Configuration
    API_URL: '/api/v1',
    
    // Application Configuration
    APP_NAME: 'BookSwap',
    APP_VERSION: '1.0.0',
    
    // Feature Flags
    ENABLE_ANALYTICS: false,
    
    // Timeouts
    API_TIMEOUT: 30000, // 30 seconds
    
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    
    // Cache
    CACHE_DURATION: 3600, // 1 hour in seconds
} as const;

// Type for the config object
export type Config = typeof config;

export const API_URL = '/api/v1'; 