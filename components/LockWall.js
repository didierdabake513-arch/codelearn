import { useState } from 'react'
import AuthModal from './AuthModal'
import { FREE_LIMIT } from '../lib/useProgress'

export default function LockWall({ mode = 'freeLimit' }) {
  const [open, setOpen] = useState(false)
  const isSequenceLock = mode === 'sequence'

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(to bottom, rgba(7,7,14,0) 0%, rgba(7,7,14,0.97) 35%)',
        flexDirection: 'column', textAlign: 'center', padding: 32,
      }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: '36px 32px', maxWidth: 400,
          boxShadow: '0 32px 80px rgba(0,0,0,.6)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            {isSequenceLock ? 'Leçon verrouillée' : 'Limite gratuite atteinte'}
          </h2>
          {isSequenceLock ? (
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 6 }}>
              Valide d'abord les leçons précédentes pour débloquer la suite du cours.
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 6 }}>
              🔓 Tu as atteint la limite gratuite ({FREE_LIMIT} leçons).
              Crée un compte pour continuer — c'est <strong style={{ color: 'var(--green)' }}>100% gratuit</strong>.
            </p>
          )}
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 24 }}>
            Aucune carte bancaire. Ta progression est conservée.
          </p>
          {!isSequenceLock && (
            <>
              <button className="btn btn-primary btn-full" onClick={() => setOpen(true)}>
                Créer mon compte gratuit →
              </button>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
                ✓ Accès illimité &nbsp;·&nbsp; ✓ Progression sauvegardée
              </div>
            </>
          )}
        </div>
      </div>

      {open && !isSequenceLock && (
        <AuthModal initialTab="register" onClose={() => setOpen(false)} />
      )}
    </>
  )
}
