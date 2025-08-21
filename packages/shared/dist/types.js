"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorError = void 0;
// Error types for better error handling
class MonitorError extends Error {
    constructor(message, statusCode, endpoint) {
        super(message);
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.name = 'MonitorError';
    }
}
exports.MonitorError = MonitorError;
//# sourceMappingURL=types.js.map