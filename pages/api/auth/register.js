import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getUserByEmail, createUser } from '../../../lib/db'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password, name } = req.body || {}

  if (!email || !password || !name)
    return res.status(400).json({ error: 'Champs manquants.' })

  if (password.length < 6)
    return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères).' })

  if (getUserByEmail(email))
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' })

  const passwordHash = await bcrypt.hash(password, 10)
  const id = uuidv4()
  createUser({ id, email, passwordHash, name })

  const token = signToken({ id, email, name })

  res.setHeader('Set-Cookie', `cl_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*30}`)
  res.status(201).json({ ok: true, user: { id, email, name } })
}
