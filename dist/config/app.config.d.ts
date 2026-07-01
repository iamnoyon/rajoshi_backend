declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    sslcommerz: {
        storeId: string;
        storePassword: string;
    };
    bkash: {
        appKey: string;
        appSecret: string;
    };
    nagad: {
        merchantId: string;
        merchantKey: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        pass: string;
        fromName: string;
        fromEmail: string;
    };
    frontendUrl: string;
    admin: {
        email: string;
        password: string;
        name: string;
    };
};
export default _default;
