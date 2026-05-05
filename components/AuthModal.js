import { useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { useProgress } from '../lib/useProgress'
import { toast } from './Toast'

export default function AuthModal({ initialTab = 'login', onClose, onSuccess }) {
  const { login, register, user } = useAuth()
  const { migrateGuestProgress } = useProgress(user)
  const [tab, setTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
        toast('Bienvenue ! 👋', 'green')
      } else {
        await register(form.email, form.password, form.name)
        await migrateGuestProgress()
        toast('Compte créé ! Bonne continuation 🚀', 'green')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg3)', borderRadius: 10, padding: 4 }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, transition: 'all .15s',
                background: tab === t ? 'var(--bg2)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text3)',
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
              }}
            >
              {t === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Prénom ou pseudo</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="Alice" required minLength={2} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="alice@exemple.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder={tab === 'register' ? 'Min. 6 caractères' : '••••••••'} required minLength={6} />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {error}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner" /> : tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
          {tab === 'login' ? (
            <>Pas encore de compte ? <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 600 }}>S'inscrire gratuitement</button></>
          ) : (
            <>Déjà un compte ? <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 600 }}>Se connecter</button></>
          )}
        </div>
      </div>
    </div>
  )
}
