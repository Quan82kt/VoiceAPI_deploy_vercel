/**
 * Global error handling middleware
 * Catches any unhandled errors and returns a consistent error response
 */
const errorHandler = (err, req, res, next) => {
    console.error('🚨 Unhandled error:', err);

    // Don't send error details in production for security
    const isDevelopment = process.env.NODE_ENV === 'development';

    const errorResponse = {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path
    };

    // Add error details in development mode
    if (isDevelopment) {
        errorResponse.details = {
            message: err.message,
            stack: err.stack,
            name: err.name
        };
    }

    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        errorResponse.error = 'Bad Request';
        errorResponse.message = 'Invalid JSON in request body';
        errorResponse.code = 'INVALID_JSON';
        return res.status(400).json(errorResponse);
    }

    if (err.type === 'entity.too.large') {
        errorResponse.error = 'Payload Too Large';
        errorResponse.message = 'Request body is too large';
        errorResponse.code = 'PAYLOAD_TOO_LARGE';
        return res.status(413).json(errorResponse);
    }

    // Set CORS headers even for errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Default to 500 if no status is set
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
