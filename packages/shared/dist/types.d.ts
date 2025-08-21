export interface SystemOverview {
    hostname: string;
    uptime: number;
    loadAverage: [number, number, number];
    cpu: {
        usage: number;
        cores: number;
        temperature: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
    disk: {
        total: number;
        used: number;
        free: number;
        usage: number;
    };
}
export interface CpuMetrics {
    usage: number;
    cores: Array<{
        core: number;
        usage: number;
    }>;
    temperature: number;
    frequency: number;
    loadAverage: {
        '1min': number;
        '5min': number;
        '15min': number;
    };
}
export interface MemoryMetrics {
    total: number;
    used: number;
    free: number;
    available: number;
    usage: number;
    swap: {
        total: number;
        used: number;
        free: number;
    };
    buffers: number;
    cached: number;
}
export interface DiskMetrics {
    filesystems: Array<{
        filesystem: string;
        mountpoint: string;
        type: string;
        size: number;
        used: number;
        available: number;
        usage: number;
    }>;
    io: {
        read: {
            operations: number;
            bytes: number;
        };
        write: {
            operations: number;
            bytes: number;
        };
    };
}
export interface NetworkMetrics {
    interfaces: Array<{
        name: string;
        isUp: boolean;
        speed: number;
        rx: {
            bytes: number;
            packets: number;
            errors: number;
            dropped: number;
        };
        tx: {
            bytes: number;
            packets: number;
            errors: number;
            dropped: number;
        };
    }>;
    connections: {
        established: number;
        listening: number;
    };
}
export interface DockerContainer {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string;
    ports: Array<{
        privatePort: number;
        publicPort?: number;
        type: string;
    }>;
    created: string;
    started: string | null;
}
export interface ContainerStats {
    id: string;
    name: string;
    cpu: {
        usage: number;
        system: number;
    };
    memory: {
        usage: number;
        limit: number;
        percentage: number;
    };
    network: {
        rx: number;
        tx: number;
    };
    io: {
        read: number;
        write: number;
    };
}
export interface ContainerLogs {
    logs: Array<{
        timestamp: string;
        stream: 'stdout' | 'stderr';
        message: string;
    }>;
    totalLines: number;
}
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        system: boolean;
        docker: boolean;
        cache: boolean;
    };
}
export interface WebSocketMessage {
    type: 'metrics_update' | 'error' | 'connection_status';
    timestamp: string;
    data: {
        system?: SystemOverview;
        docker?: DockerContainer[];
        error?: string;
        status?: 'connected' | 'disconnected' | 'reconnecting';
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}
export type MonitorMode = 'real' | 'mock';
export declare class MonitorError extends Error {
    statusCode?: number | undefined;
    endpoint?: string | undefined;
    constructor(message: string, statusCode?: number | undefined, endpoint?: string | undefined);
}
//# sourceMappingURL=types.d.ts.map