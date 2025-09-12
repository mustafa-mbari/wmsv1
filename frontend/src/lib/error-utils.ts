/**
 * Extracts a meaningful error message from various error response formats
 * @param error - The error object from axios or other sources
 * @param defaultMessage - Default message if no specific error is found
 * @returns A formatted error message string
 */
export function getErrorMessage(error: any, defaultMessage: string = "An error occurred"): string {
  // Check for axios response errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Handle validation errors (arrays or objects)
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    
    if (Array.isArray(errors)) {
      return errors.join(", ");
    }
    
    if (typeof errors === 'object') {
      const errorMessages = Object.values(errors).flat() as string[];
      return errorMessages.join(", ");
    }
  }
  
  // Check for standard Error message
  if (error.message) {
    return error.message;
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    return "Network error. Please check your connection and try again.";
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    return "Request timeout. Please try again.";
  }
  
  // Handle specific HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Authentication required. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "Conflict detected. The resource already exists or there's a constraint violation.";
      case 422:
        return "Validation failed. Please check your input data.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return `HTTP ${error.response.status}: ${error.response.statusText || defaultMessage}`;
    }
  }
  
  return defaultMessage;
}

/**
 * Formats field validation errors into a readable format
 * @param errors - Object containing field validation errors
 * @returns Formatted error message string
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const formattedErrors: string[] = [];
  
  Object.entries(errors).forEach(([field, messages]) => {
    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    messages.forEach(message => {
      formattedErrors.push(`${fieldName}: ${message}`);
    });
  });
  
  return formattedErrors.join('\n');
}