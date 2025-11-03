import cors from "cors";
import { config } from "@/config/env";

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.CORS.ORIGIN,
      `http://localhost:${config.PORT}`, // Match server port dynamically
      "http://localhost:3000", // Common frontend port
      "http://localhost:3001",
      "http://localhost:4000",
      "http://localhost:5173", // Vite default port
      "http://localhost:8080", // Vue CLI default port
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Authorization"],
  maxAge: 86400, // 24 hours
};

export const corsMiddleware = cors(corsOptions);
