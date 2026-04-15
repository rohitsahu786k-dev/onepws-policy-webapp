import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export type AuthUser = {
  userId: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
};

export function getTokenFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='));

  return tokenCookie ? decodeURIComponent(tokenCookie.slice('token='.length)) : null;
}

export function verifyAuth(req: Request): AuthUser | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (!decoded.userId || !decoded.role || !decoded.status) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request) {
  const auth = verifyAuth(req);
  if (!auth) return { auth: null, error: { message: 'Unauthorized', status: 401 } };
  if (auth.role !== 'admin') return { auth: null, error: { message: 'Forbidden', status: 403 } };
  return { auth, error: null };
}
