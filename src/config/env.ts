import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000"),

  // Database Configuration
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: parseInt(process.env.DB_PORT || "5432"),
    NAME: process.env.DB_NAME || "inventory_db",
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "password",
  },

  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || "your_super_secret_jwt_key",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },
};

export default config;
