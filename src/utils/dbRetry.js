// Utility for retrying database operations with exponential backoff
export const withRetry = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (connection-related Prisma errors)
      const retryableCodes = ['P1001', 'P2024', 'P2028', 'P1017']; // Connection lost, timeout, etc.
      if (!retryableCodes.includes(error.code)) {
        throw error; // Non-retryable error, throw immediately
      }

      if (attempt === maxRetries) {
        throw error; // Max retries reached
      }

      // Exponential backoff: delay = baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError; // Should not reach here, but just in case
};
