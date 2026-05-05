import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import AuthModal from './AuthModal'

export default function Nav({ onSearch }) {
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (q.trim()) router.push(`/cours?q=${encodeURIComponent(q)}`)
  }

  const openLogin = () => { setAuthTab('login'); setAuthOpen(true) }
  const openRegister = () => { setAuthTab('register'); setAuthOpen(true) }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          Code<span className="accent">&lt;/&gt;</span>Learn
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un cours..." />
        </form>

        <div className="nav-spacer" />

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/" className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}>Accueil</Link>
          <Link href="/cours" className={`nav-link ${router.pathname.startsWith('/cours') ? 'active' : ''}`}>Cours</Link>
          {user && <Link href="/profil" className={`nav-link ${router.pathname === '/profil' ? 'active' : ''}`}>Profil</Link>}
        </div>

        {/* Auth area */}
        {!loading && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={openLogin}>Connexion</button>
              <button className="btn btn-primary btn-sm" onClick={openRegister}>S'inscrire</button>
            </div>
          )
        )}

        {/* Mobile hamburger */}
        <button
          className="nav-link"
          style={{ marginLeft: 4, padding: '7px 10px', display: 'none' }}
          id="nav-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </nav>

      {authOpen && (
        <AuthModal
          initialTab={authTab}
          onClose={() => setAuthOpen(false)}
        />
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          #nav-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
