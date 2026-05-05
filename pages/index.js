import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'
import AuthModal from '../components/AuthModal'
import styles from '../styles/Home.module.css'

export default function Home() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => setCourses(d.courses || []))
  }, [])

  const LEVEL_LABEL = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', tous: 'Tous niveaux' }
  const LEVEL_CLASS = { debutant: 'badge-debutant', intermediaire: 'badge-intermediaire', avance: 'badge-avance', tous: 'badge-tous' }

  return (
    <>
      <Head>
        <title>CodeLearn — Apprends à coder gratuitement</title>
        <meta name="description" content="Cours interactifs de programmation. Code directement dans ton navigateur et valide chaque exercice." />
      </Head>

      <main>
        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <div className={styles.glow1} />
            <div className={styles.glow2} />
            <div className={styles.grid} />
          </div>
          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <div className={styles.pill}>
                <span className={styles.pillDot} />
                Plateforme d'apprentissage interactive
              </div>
              <h1 className={styles.title}>
                Apprends à coder,<br />
                <span className={styles.titleAccent}>pratique réelle.</span>
              </h1>
              <p className={styles.sub}>
                Chaque leçon se valide en écrivant du vrai code.
                L'éditeur analyse ton résultat et débloque la suite.
              </p>
              <div className={styles.actions}>
                <Link href="/cours" className="btn btn-primary btn-lg">Explorer les cours →</Link>
                {!user && (
                  <button className="btn btn-ghost btn-lg" onClick={() => setAuthOpen(true)}>
                    Créer un compte gratuit
                  </button>
                )}
              </div>
              <div className={styles.pills}>
                <span className={styles.chip}>✓ Éditeur de code intégré</span>
                <span className={styles.chip}>✓ Validation automatique</span>
                <span className={styles.chip}>✓ 100% gratuit</span>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.codeCard}>
                <div className={styles.codeBar}>
                  <span className={styles.dot} style={{ background: '#ff5f57' }} />
                  <span className={styles.dot} style={{ background: '#febc2e' }} />
                  <span className={styles.dot} style={{ background: '#28c840' }} />
                  <span className={styles.codeFile}>lecon-01.html</span>
                </div>
                <div className={styles.codeBody}>
                  <div><span style={{ color: '#546e7a', fontStyle: 'italic' }}>{`<!-- Ta mission : créer un <h1> -->`}</span></div>
                  <div><span style={{ color: '#ff9cac' }}>{`<!DOCTYPE html>`}</span></div>
                  <div><span style={{ color: '#ff9cac' }}>{`<html>`}</span><span style={{ color: '#ff9cac' }}>{`<body>`}</span></div>
                  <div>&nbsp;&nbsp;<span style={{ color: '#ff9cac' }}>{`<h1>`}</span><span style={{ color: '#eeffff' }}>Bonjour le monde !<span className={styles.cursor} /></span><span style={{ color: '#ff9cac' }}>{`</h1>`}</span></div>
                  <div><span style={{ color: '#ff9cac' }}>{`</body>`}</span><span style={{ color: '#ff9cac' }}>{`</html>`}</span></div>
                </div>
                <div className={styles.testsPanel}>
                  <div className={styles.testsPanelBar}>
                    <span className={styles.testsDot} />
                    <span>Tests</span>
                  </div>
                  <div className={styles.testsList}>
                    <div className={styles.testPass}><span>✓</span> La page contient un {'<h1>'}</div>
                    <div className={styles.testPass}><span>✓</span> Le {'<h1>'} contient "Bonjour le monde !"</div>
                    <div className={styles.testPass}><span>✓</span> La page contient un {'<p>'}</div>
                  </div>
                  <div className={styles.testsSuccess}>🎉 Leçon validée ! +10 XP</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className={styles.statsBar}>
          {[
            { n: courses.length || '...', l: 'Cours disponibles' },
            { n: '50+', l: 'Leçons interactives' },
            { n: '100%', l: 'Gratuit' },
            { n: '∞', l: 'Exercices pratiques' },
          ].map(s => (
            <div key={s.l} className={styles.statItem}>
              <div className={styles.statN}>{s.n}</div>
              <div className={styles.statL}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── COURSES GRID ── */}
        <section className={styles.section}>
          <div className={styles.secHead}>
            <h2 className={styles.secTitle}>Cours disponibles</h2>
            <Link href="/cours" className={styles.secLink}>Voir tout →</Link>
          </div>
          <div className={styles.coursesGrid}>
            {courses.slice(0, 6).map(c => (
              <Link key={c.id} href={`/cours/${c.id}/0`} className={styles.courseCard}>
                <div className={styles.cardTop} style={{ background: c.bg || '#ffffff08' }}>
                  <span className={styles.cardIcon}>{c.icon}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>{c.name}</div>
                  <div className={styles.cardDesc}>{c.desc}</div>
                  <div className={styles.cardMeta}>
                    <span className={`badge ${LEVEL_CLASS[c.level] || 'badge-debutant'}`}>{LEVEL_LABEL[c.level] || c.level}</span>
                    <span className={styles.cardCount}>{c.totalLessons} leçons</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className={styles.howSection}>
          <h2 className={styles.secTitle} style={{ textAlign: 'center', marginBottom: 40 }}>Comment ça marche ?</h2>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Lis la théorie', desc: 'Chaque leçon commence par une explication courte et claire du concept.' },
              { n: '02', title: 'Reçois une mission', desc: 'Un exercice précis te demande d\'écrire du code pour accomplir une tâche.' },
              { n: '03', title: 'Code dans l\'éditeur', desc: 'Tu écris ton code directement dans le navigateur. Résultat visible en temps réel.' },
              { n: '04', title: 'Les tests valident', desc: 'Des tests automatiques analysent ton code. La leçon se débloque si tout passe.' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepN}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        {!user && (
          <section className={styles.cta}>
            <div className={styles.ctaGlow} />
            <h2 className={styles.ctaTitle}>Prêt à commencer ?</h2>
            <p className={styles.ctaSub}>Les 5 premières leçons sont gratuites sans compte. Inscris-toi pour continuer indéfiniment.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/cours" className="btn btn-primary btn-lg">Voir les cours →</Link>
              <button className="btn btn-ghost btn-lg" onClick={() => setAuthOpen(true)}>Créer un compte gratuit</button>
            </div>
          </section>
        )}
      </main>

      {authOpen && <AuthModal initialTab="register" onClose={() => setAuthOpen(false)} />}
    </>
  )
}
