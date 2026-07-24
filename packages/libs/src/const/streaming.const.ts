/**
 * Lifetime of presigned S3 streaming URLs (movie file), in seconds.
 * Shared between server (URL generation) and client (refetch scheduling)
 * so the client can request a fresh URL before the old one expires.
 */
export const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60;
