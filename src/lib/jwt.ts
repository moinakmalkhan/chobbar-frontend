import { jwtDecode } from "jwt-decode";

export interface AccessClaims {
  exp: number;
  iat: number;
  user_id: number;
  email?: string;
  is_staff?: boolean;
  company_id?: string | null;
  role?: string | null;
}

/** Seconds of safety margin: refresh when the token has less than this left. */
export const REFRESH_SKEW_SECONDS = 45;

export function decodeToken(token: string | null | undefined): AccessClaims | null {
  if (!token) return null;
  try {
    return jwtDecode<AccessClaims>(token);
  } catch {
    return null;
  }
}

export function secondsUntilExpiry(token: string | null | undefined) {
  const claims = decodeToken(token);
  if (!claims?.exp) return -1;
  return claims.exp - Math.floor(Date.now() / 1000);
}

export function isExpiring(token: string | null | undefined, skew = REFRESH_SKEW_SECONDS) {
  return secondsUntilExpiry(token) <= skew;
}

export function isExpired(token: string | null | undefined) {
  return secondsUntilExpiry(token) <= 0;
}
