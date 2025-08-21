"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBytes = formatBytes;
exports.formatUptime = formatUptime;
exports.formatPercentage = formatPercentage;
exports.createApiResponse = createApiResponse;
exports.isValidPort = isValidPort;
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    else {
        return `${minutes}m`;
    }
}
function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}
function createApiResponse(data, success = true) {
    return {
        success,
        data: success ? data : undefined,
        error: success ? undefined : data?.message || 'Unknown error',
        timestamp: new Date().toISOString()
    };
}
function isValidPort(port) {
    return port >= 1 && port <= 65535;
}
//# sourceMappingURL=utils.js.map