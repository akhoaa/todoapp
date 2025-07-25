/**
 * Error message formatting utilities
 * Converts technical backend error messages into user-friendly text
 */

import type { ErrorDetails } from './errorHandler';

/**
 * User-friendly error message mappings
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
  'User not found': 'No account found with this email address. Please check your email or register for a new account.',
  'Email already exists': 'An account with this email address already exists. Please use a different email or try logging in.',
  'Unauthorized': 'You need to log in to access this feature.',
  'Token expired': 'Your session has expired. Please log in again.',

  // Validation errors
  'Email is required': 'Please enter your email address.',
  'Password is required': 'Please enter your password.',
  'Name is required': 'Please enter your name.',
  'Title is required': 'Please enter a task title.',
  'Description is required': 'Please enter a task description.',
  'Password must be at least 6 characters long': 'Your password must be at least 6 characters long.',
  'Please provide a valid email address': 'Please enter a valid email address (e.g., user@example.com).',

  // Task-related errors
  'Task not found': 'The task you\'re looking for doesn\'t exist or has been deleted.',
  'Cannot delete completed task': 'Completed tasks cannot be deleted. Please change the status first.',
  'Task title already exists': 'A task with this title already exists. Please choose a different title.',

  // Server errors
  'Internal server error': 'Something went wrong on our end. Please try again in a few moments.',
  'Service unavailable': 'The service is temporarily unavailable. Please try again later.',
  'Database connection failed': 'We\'re experiencing technical difficulties. Please try again later.',

  // Network errors
  'Network Error': 'Unable to connect to the server. Please check your internet connection and try again.',
  'Request timeout': 'The request took too long to complete. Please try again.',
  'Connection refused': 'Unable to connect to the server. Please try again later.',
};

/**
 * Field-specific validation message mappings
 */
const FIELD_ERROR_MAP: Record<string, string> = {
  email: 'email address',
  password: 'password',
  name: 'name',
  title: 'task title',
  description: 'task description',
  status: 'task status',
  currentPassword: 'current password',
  newPassword: 'new password',
  confirmPassword: 'password confirmation',
};

/**
 * Format a single error message to be more user-friendly
 */
export const formatErrorMessage = (message: string): string => {
  // Direct mapping for known messages
  if (ERROR_MESSAGE_MAP[message]) {
    return ERROR_MESSAGE_MAP[message];
  }

  // Handle validation messages with field names
  for (const [field, friendlyName] of Object.entries(FIELD_ERROR_MAP)) {
    if (message.toLowerCase().includes(field)) {
      return message.replace(new RegExp(field, 'gi'), friendlyName);
    }
  }

  // Handle common patterns
  if (message.includes('must be')) {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }

  if (message.includes('is required')) {
    return message.replace('is required', 'is required.');
  }

  if (message.includes('already exists')) {
    return message.charAt(0).toUpperCase() + message.slice(1) + ' Please choose a different value.';
  }

  // Default: capitalize first letter and ensure proper punctuation
  let formatted = message.charAt(0).toUpperCase() + message.slice(1);
  if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
    formatted += '.';
  }

  return formatted;
};

/**
 * Format validation error details into user-friendly messages
 */
export const formatValidationErrors = (details: string[]): string[] => {
  return details.map(detail => formatErrorMessage(detail));
};

/**
 * Create a comprehensive user-friendly error message
 */
export const createUserFriendlyError = (errorDetails: ErrorDetails): {
  title: string;
  message: string;
  details?: string[];
  actionable: boolean;
} => {
  const { type, message, details, statusCode } = errorDetails;

  let title = 'Error';
  let userMessage = formatErrorMessage(message);
  let actionable = true;

  // Customize based on error type
  switch (type) {
    case 'validation':
      title = 'Please Check Your Input';
      userMessage = 'Please review and correct the following:';
      break;

    case 'authentication':
      title = 'Login Required';
      if (statusCode === 401) {
        userMessage = 'Please check your email and password, then try again.';
      }
      break;

    case 'authorization':
      title = 'Access Denied';
      userMessage = 'You don\'t have permission to perform this action.';
      actionable = false;
      break;

    case 'network':
      title = 'Connection Problem';
      userMessage = 'Please check your internet connection and try again.';
      break;

    case 'server':
      title = 'Server Error';
      userMessage = 'We\'re experiencing technical difficulties. Please try again in a few moments.';
      if (statusCode && statusCode >= 500) {
        actionable = false;
      }
      break;
  }

  // Format validation details if available
  const formattedDetails = details ? formatValidationErrors(details) : undefined;

  return {
    title,
    message: userMessage,
    details: formattedDetails,
    actionable
  };
};

/**
 * Get suggested actions based on error type
 */
export const getSuggestedActions = (errorDetails: ErrorDetails): string[] => {
  const { type, statusCode } = errorDetails;

  switch (type) {
    case 'authentication':
      return [
        'Double-check your email address',
        'Verify your password is correct',
        'Try resetting your password if you\'ve forgotten it'
      ];

    case 'validation':
      return [
        'Review all required fields',
        'Check that your input meets the specified requirements',
        'Ensure all fields are properly formatted'
      ];

    case 'network':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ];

    case 'server':
      if (statusCode && statusCode >= 500) {
        return [
          'Wait a few minutes and try again',
          'Contact support if the problem persists'
        ];
      }
      return [
        'Try again in a moment',
        'Refresh the page and retry'
      ];

    default:
      return [
        'Try again',
        'Refresh the page if the problem persists'
      ];
  }
};

/**
 * Format error for display in different UI contexts
 */
export const formatErrorForContext = (
  errorDetails: ErrorDetails,
  context: 'message' | 'notification' | 'modal' | 'inline'
): {
  title?: string;
  description: string;
  type: 'error' | 'warning' | 'info';
} => {
  const userFriendlyError = createUserFriendlyError(errorDetails);

  switch (context) {
    case 'message':
      return {
        description: userFriendlyError.message,
        type: errorDetails.type === 'validation' ? 'warning' : 'error'
      };

    case 'notification':
      return {
        title: userFriendlyError.title,
        description: userFriendlyError.details
          ? `${userFriendlyError.message}\n• ${userFriendlyError.details.join('\n• ')}`
          : userFriendlyError.message,
        type: errorDetails.type === 'validation' ? 'warning' : 'error'
      };

    case 'modal':
      const actions = getSuggestedActions(errorDetails);
      return {
        title: userFriendlyError.title,
        description: `${userFriendlyError.message}\n\nSuggested actions:\n• ${actions.join('\n• ')}`,
        type: errorDetails.type === 'validation' ? 'warning' : 'error'
      };

    case 'inline':
      return {
        description: userFriendlyError.details
          ? userFriendlyError.details.join(', ')
          : userFriendlyError.message,
        type: 'error'
      };

    default:
      return {
        description: userFriendlyError.message,
        type: 'error'
      };
  }
};
