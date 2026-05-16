export interface Account {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: 'User' | 'Admin';
    isVerified: boolean;
    verificationToken?: string | null;
    resetToken?: string | null;
    resetTokenExpires?: Date | null;
    refreshToken?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AccountResponse {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: Date;
}

export interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

export interface RegisterRequest {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptTerms: boolean;
}