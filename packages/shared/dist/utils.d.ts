export declare function formatBytes(bytes: number): string;
export declare function formatUptime(seconds: number): string;
export declare function formatPercentage(value: number): string;
export declare function createApiResponse<T>(data: T, success?: boolean): {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
};
export declare function isValidPort(port: number): boolean;
//# sourceMappingURL=utils.d.ts.map