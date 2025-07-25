/**
 * Error display utilities using Antd message and notification components
 * Provides user-friendly error display while maintaining performance
 */

import { App } from 'antd';
import { extractErrorDetails } from './errorHandler';
import type { ErrorDetails } from './errorHandler';
import { formatErrorForContext, createUserFriendlyError } from './errorFormatter';

/**
 * Display error using appropriate Antd component based on error type and severity
 */
export const displayError = (
  error: any,
  messageApi: any,
  notificationApi: any,
  options: {
    useNotification?: boolean;
    duration?: number;
    showDetails?: boolean;
  } = {}
) => {
  const {
    useNotification = false,
    duration = 4.5,
    showDetails = process.env.NODE_ENV === 'development'
  } = options;

  const errorDetails = extractErrorDetails(error);

  // Choose display method based on error type and options
  if (useNotification || errorDetails.details) {
    displayErrorNotification(errorDetails, notificationApi, { duration, showDetails });
  } else {
    displayErrorMessage(errorDetails, messageApi, { duration });
  }
};

/**
 * Display simple error message using Antd message component
 */
export const displayErrorMessage = (
  errorDetails: ErrorDetails,
  messageApi: any,
  options: { duration?: number } = {}
) => {
  const { duration = 4.5 } = options;

  // Format error for message context
  const formattedError = formatErrorForContext(errorDetails, 'message');

  // Display using appropriate message type
  switch (formattedError.type) {
    case 'warning':
      messageApi.warning(formattedError.description, duration);
      break;
    case 'error':
      messageApi.error(formattedError.description, duration);
      break;
    default:
      messageApi.error(formattedError.description, duration);
  }
};

/**
 * Display detailed error notification using Antd notification component
 */
export const displayErrorNotification = (
  errorDetails: ErrorDetails,
  notificationApi: any,
  options: { duration?: number; showDetails?: boolean } = {}
) => {
  const { duration = 4.5, showDetails = false } = options;

  // Format error for notification context
  const userFriendlyError = createUserFriendlyError(errorDetails);

  // Prepare notification content with user-friendly formatting
  let description = userFriendlyError.message;

  // Add validation details if available
  if (userFriendlyError.details && userFriendlyError.details.length > 0) {
    description = userFriendlyError.message + '\n• ' + userFriendlyError.details.join('\n• ');
  }

  // Choose notification type and title based on error type
  const getNotificationConfig = (type: ErrorDetails['type']) => {
    switch (type) {
      case 'validation':
        return { type: 'warning' as const, message: 'Please Check Your Input', icon: '⚠️' };
      case 'authentication':
        return { type: 'error' as const, message: 'Login Required', icon: '🔒' };
      case 'authorization':
        return { type: 'error' as const, message: 'Access Denied', icon: '🚫' };
      case 'network':
        return { type: 'error' as const, message: 'Connection Problem', icon: '🌐' };
      case 'server':
        return { type: 'error' as const, message: 'Server Error', icon: '🔧' };
      default:
        return { type: 'error' as const, message: 'Error', icon: '❌' };
    }
  };

  const config = getNotificationConfig(errorDetails.type);

  notificationApi[config.type]({
    message: `${config.icon} ${config.message}`,
    description,
    duration,
    placement: 'topRight'
  });
};

/**
 * Quick error display function for simple use cases
 */
export const showError = (error: any, messageApi: any) => {
  const errorDetails = extractErrorDetails(error);
  displayErrorMessage(errorDetails, messageApi);
};

/**
 * Quick notification display function for detailed errors
 */
export const showErrorNotification = (error: any, notificationApi: any, showDetails = false) => {
  const errorDetails = extractErrorDetails(error);
  displayErrorNotification(errorDetails, notificationApi, { showDetails });
};

/**
 * Success message helpers for consistency
 */
export const showSuccess = (message: string, messageApi: any, duration = 3) => {
  messageApi.success(message, duration);
};

export const showSuccessNotification = (
  title: string,
  description: string,
  notificationApi: any,
  duration = 4.5
) => {
  notificationApi.success({
    message: `✅ ${title}`,
    description,
    duration,
    placement: 'topRight'
  });
};
