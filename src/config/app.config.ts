export default () => ({
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'ecommerce',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    apiKey: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'your-stripe-secret',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'your-webhook-secret',
  },
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID || 'your-store-id',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'your-store-password',
  },
  bkash: {
    appKey: process.env.BKASH_APP_KEY || 'your-app-key',
    appSecret: process.env.BKASH_APP_SECRET || 'your-app-secret',
  },
  nagad: {
    merchantId: process.env.NAGAD_MERCHANT_ID || 'your-merchant-id',
    merchantKey: process.env.NAGAD_MERCHANT_KEY || 'your-merchant-key',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Admin',
  },
});
