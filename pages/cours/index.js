import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/Cours.module.css'

const LEVEL_LABEL = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', tous: 'Tous niveaux' }
const LEVEL_CLASS = { debutant: 'badge-debutant', intermediaire: 'badge-intermediaire', avance: 'badge-avance', tous: 'badge-tous' }

export default function CoursPage() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState('tous')
  const [filterCat, setFilterCat] = useState('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => {
      setCourses(d.courses || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (router.query.q) setSearch(router.query.q)
  }, [router.query.q])

  const filtered = courses.filter(c => {
    const matchLevel = filterLevel === 'tous' || c.level === filterLevel || c.level === 'tous'
    const matchCat = filterCat === 'tous' || c.cat === filterCat
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.desc || '').toLowerCase().includes(search.toLowerCase())
    return matchLevel && matchCat && matchSearch
  })

  const cats = [
    { id: 'tous', label: 'Toutes' },
    { id: 'web', label: 'Web Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'data', label: 'Data & IA' },
    { id: 'outils', label: 'Outils Dev' },
  ]
  const levels = [
    { id: 'tous', label: 'Tous niveaux' },
    { id: 'debutant', label: 'Débutant' },
    { id: 'intermediaire', label: 'Intermédiaire' },
    { id: 'avance', label: 'Avancé' },
  ]

  return (
    <>
      <Head>
        <title>Cours — CodeLearn</title>
        <meta name="description" content="Explore tous les cours interactifs disponibles sur CodeLearn." />
      </Head>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--text3)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Niveau</div>
            {levels.map(l => (
              <button key={l.id} className={`${styles.filterBtn} ${filterLevel === l.id ? styles.active : ''}`} onClick={() => setFilterLevel(l.id)}>{l.label}</button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Catégorie</div>
            {cats.map(c => (
              <button key={c.id} className={`${styles.filterBtn} ${filterCat === c.id ? styles.active : ''}`} onClick={() => setFilterCat(c.id)}>{c.label}</button>
            ))}
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.mainHeader}>
            <h1 className={styles.mainTitle}>Tous les cours</h1>
            <span className={styles.mainCount}>{filtered.length} cours</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>Aucun cours trouvé.</p>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterLevel('tous'); setFilterCat('tous') }}>
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(c => (
                <Link key={c.id} href={`/cours/${c.id}/0`} className={styles.card}>
                  <div className={styles.cardTop} style={{ background: c.bg || '#ffffff08' }}>
                    <span className={styles.cardIcon}>{c.icon || '📖'}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardName}>{c.name}</div>
                    <div className={styles.cardDesc}>{c.desc}</div>
                    <div className={styles.cardMeta}>
                      <span className={`badge ${LEVEL_CLASS[c.level] || 'badge-debutant'}`}>{LEVEL_LABEL[c.level] || c.level}</span>
                      <span className={styles.cardLessons}>{c.totalLessons} leçons</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
