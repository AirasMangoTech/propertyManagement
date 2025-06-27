
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    });
};

// Error response
const sendError = (res, message, statusCode = 500, error = null) => {
    return res.status(statusCode).json({
        status: 'error',
        message,
        ...(error && { error })
    });
};

module.exports = {
    sendSuccess,
    sendError
};
