export interface AuthUser {
    id: string;
    name: string;
    username: string;
    roles: string[];
    permissions: string[];
    positionId?: string | null;
}

export interface JwtPayload {
    id: string;
    username: string;
    roles: string[];
    permissions: string[];
}

export interface LoginDTO {
    username: string;
    password: string;
}