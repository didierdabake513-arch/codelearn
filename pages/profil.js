import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useProgress } from '../lib/useProgress'
import styles from '../styles/Profil.module.css'

const BADGES = [
  { id: 'first', icon: '🚀', name: 'Premier pas', desc: '1ère leçon validée', condition: p => p.lessonsCompleted.length >= 1 },
  { id: 'five', icon: '⭐', name: 'En route', desc: '5 leçons validées', condition: p => p.lessonsCompleted.length >= 5 },
  { id: 'ten', icon: '🔥', name: 'Sur les rails', desc: '10 leçons validées', condition: p => p.lessonsCompleted.length >= 10 },
  { id: 'twenty', icon: '💪', name: 'Persévérant', desc: '20 leçons validées', condition: p => p.lessonsCompleted.length >= 20 },
  { id: 'quiz1', icon: '🧠', name: 'Quiz master', desc: '1er quiz réussi', condition: p => p.quizzesCompleted.length >= 1 },
  { id: 'quiz3', icon: '🏆', name: 'Champion', desc: '3 quiz réussis', condition: p => p.quizzesCompleted.length >= 3 },
  { id: 'xp100', icon: '💫', name: 'Centurion', desc: '100 XP gagnés', condition: p => p.xp >= 100 },
  { id: 'xp500', icon: '👑', name: 'Élite', desc: '500 XP gagnés', condition: p => p.xp >= 500 },
]

export default function ProfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { progress, loaded } = useProgress(user)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => setCourses(d.courses || []))
  }, [])

  if (authLoading || !loaded || !user) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)' }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
  }

  const startedIds = [...new Set(progress.lessonsCompleted.map(k => k.split('-')[0]))]
  const earned = BADGES.filter(b => b.condition(progress))
  const locked = BADGES.filter(b => !b.condition(progress))
  const totalLessons = courses.reduce((s, c) => s + (c.totalLessons || 0), 0)
  const globalPct = totalLessons ? Math.round(progress.lessonsCompleted.length / totalLessons * 100) : 0
  const levelLabel = progress.xp < 100 ? 'Débutant' : progress.xp < 300 ? 'Intermédiaire' : progress.xp < 700 ? 'Avancé' : 'Expert'

  return (
    <>
      <Head><title>Mon profil — CodeLearn</title></Head>
      <div className={styles.page}>
        <div className={styles.layout}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.avatar}>{user.name?.[0]?.toUpperCase() || 'C'}</div>
            <div className={styles.headerInfo}>
              <div className={styles.name}>{user.name}</div>
              <div className={styles.meta}>{user.email} · Niveau {levelLabel} · {earned.length} badge{earned.length > 1 ? 's' : ''}</div>
            </div>
            <Link href="/cours" className="btn btn-primary btn-sm">Continuer →</Link>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            {[
              { n: progress.xp, l: 'Points XP', c: 'var(--accent3)' },
              { n: progress.lessonsCompleted.length, l: 'Leçons validées', c: 'var(--green)' },
              { n: progress.quizzesCompleted.length, l: 'Quiz réussis', c: 'var(--amber)' },
              { n: startedIds.length, l: 'Cours commencés', c: 'var(--blue)' },
            ].map(s => (
              <div key={s.l} className={styles.stat}>
                <div className={styles.statN} style={{ color: s.c }}>{s.n}</div>
                <div className={styles.statL}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Global progress */}
          <div className={styles.progressSection}>
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>Progression globale ({globalPct}%)</span>
              <span className={styles.progressVal}>{progress.lessonsCompleted.length} / {totalLessons} leçons</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${globalPct}%` }} />
            </div>
          </div>

          <div className={styles.grid2}>
            {/* Courses in progress */}
            <div>
              <div className={styles.secTitle}>Cours en cours</div>
              {startedIds.length === 0 ? (
                <div className={styles.empty}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
                  <p>Tu n'as pas encore commencé de cours.</p>
                  <Link href="/cours" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Découvrir les cours →</Link>
                </div>
              ) : (
                <div className={styles.courseList}>
                  {startedIds.map(id => {
                    const c = courses.find(x => x.id === id)
                    const total = c?.totalLessons || 1
                    const done = progress.lessonsCompleted.filter(k => k.startsWith(id + '-')).length
                    const pct = Math.round(done / total * 100)
                    return (
                      <Link key={id} href={`/cours/${id}/0`} className={styles.courseItem}>
                        <span style={{ fontSize: 26, flexShrink: 0 }}>{c?.icon || '📖'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.courseItemName}>{c?.name || id}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 4px' }}>
                            <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--accent3)', fontWeight: 600, minWidth: 28 }}>{pct}%</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{done} / {total} leçons</div>
                        </div>
                        <span style={{ color: 'var(--accent3)', fontSize: 16 }}>→</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Badges */}
            <div>
              <div className={styles.secTitle}>Badges — {earned.length} / {BADGES.length}</div>
              <div className={styles.badges}>
                {earned.map(b => (
                  <div key={b.id} className={styles.badge}>
                    <span style={{ fontSize: 22 }}>{b.icon}</span>
                    <div><div className={styles.badgeName}>{b.name}</div><div className={styles.badgeDesc}>{b.desc}</div></div>
                  </div>
                ))}
                {locked.map(b => (
                  <div key={b.id} className={`${styles.badge} ${styles.badgeLocked}`}>
                    <span style={{ fontSize: 22, filter: 'grayscale(1)', opacity: .4 }}>{b.icon}</span>
                    <div><div className={styles.badgeName}>{b.name}</div><div className={styles.badgeDesc}>{b.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
