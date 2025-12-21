import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Detect if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = !!(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SERVERLESS
);

// Global pool cache untuk serverless (WAJIB untuk Vercel)
// Mencegah multiple pool instances yang menyebabkan timeout
declare global {
  var _pgPool: Pool | undefined;
}

// Check if using Supabase Transaction Pooler
const isSupabasePooler = (connectionString?: string): boolean => {
  if (!connectionString) return false;
  return (
    connectionString.includes("pooler.supabase.com") &&
    connectionString.includes(":6543")
  );
};

// Get database configuration
const getDbConfig = (): PoolConfig => {
  // Priority: DATABASE_URL (recommended for Supabase + Vercel)
  if (process.env.DATABASE_URL) {
    const isPooler = isSupabasePooler(process.env.DATABASE_URL);

    // Log connection info untuk debugging
    if (isServerless) {
      try {
        const dbHost = process.env.DATABASE_URL.split("@")[1]?.split("/")[0];
        console.log(`🔍 DB Connection: ${dbHost || "DATABASE_URL"}`);
        if (isPooler) {
          console.log("✅ Using Supabase Transaction Pooler (recommended)");
        } else if (process.env.DATABASE_URL.includes("supabase.co")) {
          console.warn(
            "⚠️ WARNING: Using direct Supabase connection. Switch to Transaction Pooler!"
          );
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 1, // WAJIB untuk Supabase free tier & serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000, // 15s untuk Supabase pooler
      statement_timeout: 30000, // 30 seconds max query time
      allowExitOnIdle: isServerless,
    };
  }

  // Fallback: individual connection parameters (untuk development)
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "inventory_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    ssl:
      process.env.DB_HOST && !process.env.DB_HOST.includes("localhost")
        ? { rejectUnauthorized: false }
        : false,
    max: isServerless ? 1 : 20,
    idleTimeoutMillis: isServerless ? 10000 : 30000,
    connectionTimeoutMillis: isServerless ? 15000 : 30000,
    statement_timeout: 30000,
    allowExitOnIdle: isServerless,
  };
};

// Create or reuse global pool (WAJIB untuk serverless)
// Mencegah "new Pool()" dibuat berulang kali yang menyebabkan timeout
if (!global._pgPool) {
  const dbConfig = getDbConfig();
  global._pgPool = new Pool(dbConfig);

  // Handle pool errors
  global._pgPool.on("error", (err) => {
    console.error("❌ Unexpected error on idle client", err);
  });

  // Log successful connection
  if (isServerless) {
    global._pgPool.on("connect", () => {
      console.log("✅ Database connection established (serverless)");
    });
  }
}

export const pool = global._pgPool;

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

    // Log connection details
    let dbInfo: string;
    if (process.env.DATABASE_URL) {
      try {
        const dbHost =
          process.env.DATABASE_URL.split("@")[1]?.split("/")[0] ||
          "DATABASE_URL";
        dbInfo = dbHost;
      } catch {
        dbInfo = "DATABASE_URL";
      }
    } else {
      dbInfo = `${process.env.DB_HOST || "localhost"}:${
        process.env.DB_PORT || "5432"
      }`;
    }

    const mode = isServerless ? "serverless" : "standard";
    const poolerStatus =
      process.env.DATABASE_URL && isSupabasePooler(process.env.DATABASE_URL)
        ? " (Transaction Pooler ✅)"
        : "";

    console.log(`✅ Database connected: ${dbInfo} (${mode}${poolerStatus})`);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    if (
      process.env.DATABASE_URL &&
      !isSupabasePooler(process.env.DATABASE_URL)
    ) {
      console.error(
        "💡 TIP: Pastikan menggunakan Supabase Transaction Pooler (port 6543)"
      );
    }
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
