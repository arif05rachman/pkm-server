import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = !!(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SERVERLESS
);

// Use connection string if available (common in serverless environments)
// Otherwise, use individual connection parameters
const getDbConfig = (): PoolConfig => {
  const baseConfig: PoolConfig = {
    max: isServerless ? 1 : 20, // Single connection per serverless instance
    idleTimeoutMillis: isServerless ? 10000 : 30000,
    connectionTimeoutMillis: isServerless ? 90000 : 30000, // 90s for serverless to handle cold starts
    statement_timeout: 30000, // 30 seconds max query time
    allowExitOnIdle: isServerless, // Allow pool to exit when idle in serverless
  };

  // If DATABASE_URL is provided, use it (common in serverless platforms)
  if (process.env.DATABASE_URL) {
    return {
      ...baseConfig,
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    };
  }

  // Fallback to individual connection parameters
  return {
    ...baseConfig,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "inventory_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl:
      process.env.DB_HOST && !process.env.DB_HOST.includes("localhost")
        ? { rejectUnauthorized: false }
        : false,
  };
};

const dbConfig = getDbConfig();

export const pool = new Pool(dbConfig);

// Handle pool errors with better logging
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  // Don't crash the app, just log the error
});

// Handle connection errors
pool.on("connect", (client) => {
  if (isServerless) {
    console.log("✅ New database connection established (serverless)");
  }
});

// Wrap pool.query to handle AggregateError and retry for serverless
// This intercepts all queries and adds retry logic for timeout errors
const originalQuery = pool.query.bind(pool);
(pool as any).query = async function (queryText: any, values?: any) {
  const maxRetries = isServerless ? 3 : 1;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await originalQuery(queryText, values);
    } catch (error: any) {
      lastError = error;

      // Check if it's a timeout or connection error
      const isTimeoutError =
        error?.message?.includes("timeout") ||
        error?.message?.includes("ETIMEDOUT") ||
        error?.message?.includes("Connection terminated") ||
        error?.code === "ETIMEDOUT" ||
        error?.name === "AggregateError" ||
        (error?.errors && Array.isArray(error.errors)); // AggregateError has errors array

      if (isTimeoutError && attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(
          `⚠️ Database query timeout (attempt ${
            attempt + 1
          }/${maxRetries}), retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If not a timeout or last attempt, throw immediately
      throw error;
    }
  }

  throw lastError;
};

// Add connection retry logic for serverless environments
const connectWithRetry = async (retries = 3, delay = 1000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(
        `⚠️ Connection attempt ${i + 1} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Test database connection with retry logic
export const testConnection = async (): Promise<boolean> => {
  try {
    if (isServerless) {
      // Use retry logic for serverless
      await connectWithRetry();
    } else {
      const client = await pool.connect();
      client.release();
    }

    const dbInfo = process.env.DATABASE_URL
      ? "DATABASE_URL"
      : `${process.env.DB_HOST || "localhost"}:${
          process.env.DB_PORT || "5432"
        }`;

    console.log(
      `✅ Database connected successfully to ${dbInfo} (${
        isServerless ? "serverless" : "standard"
      } mode)`
    );
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

// Query wrapper with retry logic for serverless environments
export const queryWithRetry = async <T = any>(
  queryText: string,
  values?: any[],
  retries = 2,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(queryText, values);
      return result as T;
    } catch (error: any) {
      // If it's a connection timeout and we have retries left, retry
      if (
        (error.message?.includes("timeout") ||
          error.message?.includes("Connection terminated")) &&
        i < retries - 1
      ) {
        console.log(
          `⚠️ Query timeout, retrying (${i + 1}/${retries}) in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Query failed after retries");
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log("✅ Database pool closed");
  } catch (error) {
    console.error("❌ Error closing database pool:", error);
  }
};
