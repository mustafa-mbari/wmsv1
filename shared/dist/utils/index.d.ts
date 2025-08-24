import { ApiResponse } from '../types';
export declare const createApiResponse: <T>(success: boolean, data?: T, message?: string, error?: string) => ApiResponse<T>;
export declare const validateEmail: (email: string) => boolean;
export declare const formatDate: (date: Date) => string;
//# sourceMappingURL=index.d.ts.map