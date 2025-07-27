/**
 * Enhanced error message extraction system for backend API responses
 * Handles multiple error formats while maintaining performance
 */

// Define and export the ErrorDetails interface
export interface ErrorDetails {
  message: string;
  details?: string[];
  statusCode?: number;
  timestamp?: string;
  path?: string;
  type: 'validation' | 'authentication' | 'authorization' | 'server' | 'network' | 'unknown';
}

/**
 * Extract detailed error information from various backend response formats
 */
export const extractErrorDetails = (error: any): ErrorDetails => {
  // Network/connectivity errors
  if (!error.response && error.request) {
    return {
      message: 'Unable to connect to server. Please check your internet connection.',
      type: 'network'
    };
  }

  // No response object - client-side error
  if (!error.response) {
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'unknown'
    };
  }

  const { status, data } = error.response;
  const statusCode = status;

  // Handle different backend error response formats
  let message = 'An error occurred';
  let details: string[] = [];
  let type: ErrorDetails['type'] = 'unknown';

  // NestJS standard error format: { statusCode, message, timestamp, path }
  if (data && typeof data === 'object') {
    // Extract main message
    if (data.message) {
      if (Array.isArray(data.message)) {
        // Validation errors array
        message = 'Please check the following:';
        details = data.message;
        type = 'validation';
      } else if (typeof data.message === 'string') {
        message = data.message;
      }
    }

    // Extract additional details
    if (data.error && typeof data.error === 'string') {
      if (!message || message === 'An error occurred') {
        message = data.error;
      }
    }

    // Determine error type based on status code and content
    if (statusCode === 400) {
      type = details.length > 0 ? 'validation' : 'server';
    } else if (statusCode === 401) {
      type = 'authentication';
      if (!message || message === 'An error occurred') {
        message = 'Invalid credentials. Please check your email and password.';
      }
    } else if (statusCode === 403) {
      type = 'authorization';
      if (!message || message === 'An error occurred') {
        message = 'You do not have permission to perform this action.';
      }
    } else if (statusCode >= 500) {
      type = 'server';
      if (!message || message === 'An error occurred') {
        message = 'Server error. Please try again later.';
      }
    }
  }

  return {
    message,
    details: details.length > 0 ? details : undefined,
    statusCode,
    timestamp: data?.timestamp,
    path: data?.path,
    type
  };
};

/**
 * Legacy function for backward compatibility - optimized for performance
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  // Early return for null/undefined - fastest path
  if (!error) return defaultMessage;

  // Fast extraction using the new system
  const errorDetails = extractErrorDetails(error);

  // Format message with details if available
  if (errorDetails.details && errorDetails.details.length > 0) {
    return `${errorDetails.message}\n• ${errorDetails.details.join('\n• ')}`;
  }

  return errorDetails.message || defaultMessage;
};

/**
 * Utility function to handle API errors consistently
 * Can be used in catch blocks to display user-friendly error messages
 * Optimized to minimize processing time and avoid performance violations
 */
export const handleApiError = (error: any, defaultMessage: string = 'Operation failed'): string => {
  // Use performance.now() for precise timing in development
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;

  const errorMessage = getErrorMessage(error, defaultMessage);

  // Only log in development with performance monitoring
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Only log if processing takes longer than expected (>10ms)
    if (duration > 10) {
      console.warn(`Error handling took ${duration.toFixed(2)}ms:`, error);
    } else {
      console.error('API Error:', error);
    }
  }

  return errorMessage;
};

/**
 * Fast error message extraction for performance-critical paths
 * Minimal processing to avoid message handler performance violations
 */
export const getFastErrorMessage = (error: any): string => {
  return error?.message || error?.response?.data?.message || 'An error occurred';
};


