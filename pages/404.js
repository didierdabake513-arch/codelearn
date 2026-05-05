import Link from 'next/link'
import Head from 'next/head'
export default function NotFound() {
  return (
    <>
      <Head><title>404 — CodeLearn</title></Head>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', textAlign: 'center', padding: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 72, fontWeight: 700, color: 'var(--border2)' }}>404</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 10 }}>Page introuvable</h1>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 14 }}>Cette page n'existe pas.</p>
        <Link href="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    </>
  )
}
