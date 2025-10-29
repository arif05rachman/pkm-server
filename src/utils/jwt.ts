import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "@/config/env";
import { JWTPayload } from "@/types";

/**
 * Generate JWT access token
 * @param payload - JWT payload data
 * @returns string - JWT token
 */
export const generateAccessToken = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.JWT.SECRET, {
    expiresIn: config.JWT.EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 * @param payload - JWT payload data
 * @returns string - JWT refresh token
 */
export const generateRefreshToken = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.JWT.SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns JWTPayload - Decoded token payload
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.JWT.SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param token - JWT token to decode
 * @returns JWTPayload | null - Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate a secure random refresh token
 * @returns string - Secure random token
 */
export const generateSecureRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Generate both access and refresh tokens
 * @param payload - JWT payload data
 * @returns Object with both tokens
 */
export const generateTokens = (
  payload: Omit<JWTPayload, "iat" | "exp">
): {
  accessToken: string;
  refreshToken: string;
} => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateSecureRefreshToken(),
  };
};

/**
 * Generate new access token from refresh token payload
 * @param payload - JWT payload data
 * @returns string - New access token
 */
export const generateAccessTokenFromRefresh = (
  payload: Omit<JWTPayload, "iat" | "exp">
): string => {
  return generateAccessToken(payload);
};
