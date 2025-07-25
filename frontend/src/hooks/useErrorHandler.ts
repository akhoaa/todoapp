/**
 * Custom hook for handling and displaying backend errors
 * Provides a unified interface for error handling across the application
 */

import { useCallback } from 'react';
import { App } from 'antd';
import { 
  displayError, 
  showError, 
  showErrorNotification, 
  showSuccess, 
  showSuccessNotification 
} from '@/utils/errorDisplay';
import { extractErrorDetails } from '@/utils/errorHandler';

export interface UseErrorHandlerOptions {
  useNotification?: boolean;
  duration?: number;
  showDetails?: boolean;
}

export const useErrorHandler = (defaultOptions: UseErrorHandlerOptions = {}) => {
  const { message, notification } = App.useApp();
  
  // Handle errors with full customization
  const handleError = useCallback((
    error: any, 
    options: UseErrorHandlerOptions = {}
  ) => {
    const mergedOptions = { ...defaultOptions, ...options };
    displayError(error, message, notification, mergedOptions);
  }, [message, notification, defaultOptions]);
  
  // Quick error message display
  const showErrorMessage = useCallback((error: any, defaultMessage?: string) => {
    showError(error, message, defaultMessage);
  }, [message]);
  
  // Quick error notification display
  const showErrorNotificationMessage = useCallback((error: any, showDetails = false) => {
    showErrorNotification(error, notification, showDetails);
  }, [notification]);
  
  // Success message helpers
  const showSuccessMessage = useCallback((msg: string, duration = 3) => {
    showSuccess(msg, message, duration);
  }, [message]);
  
  const showSuccessNotificationMessage = useCallback((
    title: string, 
    description: string, 
    duration = 4.5
  ) => {
    showSuccessNotification(title, description, notification, duration);
  }, [notification]);
  
  // Extract error details for custom handling
  const getErrorDetails = useCallback((error: any) => {
    return extractErrorDetails(error);
  }, []);
  
  // Handle API responses with automatic success/error display
  const handleApiResponse = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      successMessage?: string;
      successTitle?: string;
      successDescription?: string;
      errorOptions?: UseErrorHandlerOptions;
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<T | null> => {
    try {
      const result = await apiCall();
      
      // Show success message if provided
      if (options.successMessage) {
        showSuccessMessage(options.successMessage);
      } else if (options.successTitle && options.successDescription) {
        showSuccessNotificationMessage(options.successTitle, options.successDescription);
      }
      
      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Handle error display
      handleError(error, options.errorOptions);
      
      // Call error callback
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }, [handleError, showSuccessMessage, showSuccessNotificationMessage]);
  
  return {
    // Core error handling
    handleError,
    showErrorMessage,
    showErrorNotification: showErrorNotificationMessage,
    
    // Success handling
    showSuccessMessage,
    showSuccessNotification: showSuccessNotificationMessage,
    
    // Utilities
    getErrorDetails,
    handleApiResponse,
    
    // Direct access to Antd APIs
    message,
    notification
  };
};

/**
 * Simplified hook for basic error handling
 */
export const useSimpleErrorHandler = () => {
  const { message } = App.useApp();
  
  const showError = useCallback((error: any, defaultMessage = 'An error occurred') => {
    const errorDetails = extractErrorDetails(error);
    message.error(errorDetails.message || defaultMessage);
  }, [message]);
  
  const showSuccess = useCallback((msg: string) => {
    message.success(msg);
  }, [message]);
  
  return { showError, showSuccess, message };
};
