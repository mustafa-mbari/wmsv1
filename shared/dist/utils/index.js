"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.validateEmail = exports.createApiResponse = void 0;
const createApiResponse = (success, data, message, error) => {
    return {
        success,
        data,
        message,
        error
    };
};
exports.createApiResponse = createApiResponse;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
//# sourceMappingURL=index.js.map