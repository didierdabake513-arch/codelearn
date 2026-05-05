import bcrypt from 'bcryptjs'
import { getUserByEmail } from '../../../lib/db'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body || {}
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis.' })

  const user = getUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })

  const token = signToken({ id: user.id, email: user.email, name: user.name })
  res.setHeader('Set-Cookie', `cl_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*30}`)
  res.status(200).json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
}
