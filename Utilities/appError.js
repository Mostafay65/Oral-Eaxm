class appError extends Error {
    constructor(message, statusCode, statusCodeText) {
        super(message);
        this.statusCode = statusCode;
        this.statusCodeText = statusCodeText;
    }
}

module.exports = appError;