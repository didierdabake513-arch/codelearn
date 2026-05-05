import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'codelearn-dev-secret-change-in-production'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-dev-secret-change-in-production'

// ── USER AUTH ──────────────────────────────────────────────────────────────
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export function getAuthFromReq(req) {
  const token = req.cookies?.cl_token || req.headers?.authorization?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}

// ── ADMIN AUTH ─────────────────────────────────────────────────────────────
export function verifyAdminToken(token) {
  try { return jwt.verify(token, ADMIN_SECRET) } catch { return null }
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '8h' })
}

export function getAdminFromReq(req) {
  const token = req.cookies?.cl_admin || req.headers?.['x-admin-token']
  if (!token) return null
  return verifyAdminToken(token)
}

// ── FREE LESSON LIMIT ──────────────────────────────────────────────────────
export const FREE_LESSONS_LIMIT = 5
