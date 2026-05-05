import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import styles from '../../styles/Admin.module.css'

const COURSE_TEMPLATE = {
  id: "mon-cours",
  icon: "📚",
  name: "Nom du cours",
  desc: "Description courte",
  level: "debutant",
  cat: "web",
  color: "#6c5ce7",
  bg: "#6c5ce718",
  chapters: [
    {
      title: "Chapitre 1",
      lessons: [
        {
          title: "Titre de la leçon",
          theory: "Explication théorique. Supporte **gras**, *italique*, `code` et ```blocs de code```.\n\n> Conseil ou note importante",
          task: "**Mission :** Décris ce que l'apprenant doit faire dans son éditeur.",
          starterCode: "<!-- Code de départ fourni à l'apprenant -->\n<!DOCTYPE html>\n<html>\n<body>\n  <!-- Écris ton code ici -->\n</body>\n</html>",
          tests: [
            {
              id: "t1",
              description: "Description du test (visible par l'apprenant)",
              check: "hasTag",
              arg: "h1"
            }
          ]
        }
      ]
    }
  ],
  quizzes: [
    {
      q: "Question du quiz ?",
      opts: ["Option A", "Option B", "Option C", "Option D"],
      correct: 0,
      exp: "Explication après réponse."
    }
  ]
}

const TEST_TYPES = [
  { value: 'hasTag', label: 'hasTag — la page contient un tag', fields: ['arg (ex: h1, p, a)'] },
  { value: 'tagContainsText', label: 'tagContainsText — un tag contient du texte', fields: ['arg (tag)', 'text (texte cherché)'] },
  { value: 'hasAttr', label: 'hasAttr — un tag a un attribut', fields: ['tag', 'attr (ex: href, alt)'] },
  { value: 'minCount', label: 'minCount — au moins N éléments', fields: ['tag', 'min (nombre)'] },
  { value: 'cssContains', label: 'cssContains — le CSS contient un texte', fields: ['text (ex: display: flex)'] },
  { value: 'codeContains', label: 'codeContains — le code source contient un texte', fields: ['text'] },
  { value: 'consoleLog', label: 'consoleLog — console.log contient un texte', fields: ['text'] },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [courses, setCourses] = useState([])
  const [tab, setTab] = useState('list') // list | upload | template
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [aiInstruction, setAiInstruction] = useState('')
  const [aiMode, setAiMode] = useState('improve')
  const [aiOnlyMissionsTests, setAiOnlyMissionsTests] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMsg, setAiMsg] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const fileRef = useRef()
  const aiFileRef = useRef()

  // Check auth on load
  useEffect(() => {
    fetch('/api/admin/courses', { headers: { 'Content-Type': 'application/json' } })
      .then(r => { if (r.ok) { setAuthed(true); loadCourses() } })
      .catch(() => {})
  }, [])

  const doLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (r.ok) { setAuthed(true); loadCourses() }
      else { const d = await r.json(); setAuthError(d.error || 'Erreur') }
    } catch { setAuthError('Erreur réseau') }
    setAuthLoading(false)
  }

  const loadCourses = async () => {
    const r = await fetch('/api/admin/courses')
    if (r.ok) { const d = await r.json(); setCourses(d.courses || []) }
  }

  const uploadJSON = async () => {
    setJsonError('')
    setUploadMsg(null)
    let parsed
    try { parsed = JSON.parse(jsonInput) } catch (e) { setJsonError('JSON invalide : ' + e.message); return }
    setUploading(true)
    try {
      const r = await fetch('/api/admin/courses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      })
      const d = await r.json()
      if (r.ok) {
        setUploadMsg({ ok: true, msg: `✓ Cours "${parsed.name}" uploadé avec succès (ID: ${parsed.id})` })
        setJsonInput('')
        loadCourses()
      } else {
        setUploadMsg({ ok: false, msg: '✗ ' + (d.error || 'Erreur upload') })
      }
    } catch { setUploadMsg({ ok: false, msg: '✗ Erreur réseau' }) }
    setUploading(false)
  }

  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setJsonError('')
    setUploadMsg(null)
    try {
      const text = await file.text()
      // Remove BOM when the document was saved with UTF-8 BOM.
      setJsonInput(text.replace(/^\uFEFF/, ''))
      setTab('upload')
    } catch {
      setJsonError('Impossible de lire ce document. Utilise un fichier texte (.json, .txt, .md).')
    }
    e.target.value = ''
  }

  const deleteCourse = async (id) => {
    const r = await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE' })
    if (r.ok) { loadCourses(); setDeleteId(null) }
  }

  const generateWithAI = async () => {
    setAiLoading(true)
    setAiMsg('')
    try {
      const r = await fetch('/api/admin/ai-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: aiMode,
          instruction: aiInstruction,
          currentJson: jsonInput || '',
          sourceText: jsonInput || '',
          onlyMissionsTests: aiOnlyMissionsTests
        })
      })
      const d = await r.json()
      if (!r.ok) {
        setAiMsg('✗ ' + (d.error || 'Erreur IA'))
      } else {
        const generated = JSON.stringify(d.course, null, 2)
        setJsonInput(generated)
        setTab('upload')
        setAiMsg('✓ JSON généré avec succès. Vérifie puis clique sur "Uploader le cours".')
      }
    } catch {
      setAiMsg('✗ Erreur réseau IA')
    }
    setAiLoading(false)
  }

  const uploadAIFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      setJsonInput(text.replace(/^\uFEFF/, ''))
      setTab('ai')
      setAiMsg('✓ Document chargé dans la zone IA.')
    } catch {
      setAiMsg('✗ Impossible de lire ce document.')
    }
    e.target.value = ''
  }

  if (!authed) {
    return (
      <>
        <Head><title>Admin — CodeLearn</title></Head>
        <div className={styles.loginPage}>
          <div className={styles.loginCard}>
            <div className={styles.loginIcon}>🔐</div>
            <h1 className={styles.loginTitle}>Administration</h1>
            <form onSubmit={doLogin}>
              <div className="form-group">
                <label className="form-label">Mot de passe admin</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              {authError && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {authError}</div>}
              <button className="btn btn-primary btn-full" type="submit" disabled={authLoading}>
                {authLoading ? <span className="spinner" /> : 'Accéder'}
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Admin — CodeLearn</title></Head>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logo}>⚡ Admin Panel</span>
            <span className={styles.badge}>{courses.length} cours</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setTab('template') }}>📄 Voir le template</button>
            <input ref={fileRef} type="file" accept=".json,.txt,.md,application/json,text/plain,text/markdown" style={{ display: 'none' }} onChange={uploadFile} />
            <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>📄 Charger un document</button>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('upload')}>➕ Ajouter un cours</button>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          {[
            { id: 'list', label: `📚 Cours (${courses.length})` },
            { id: 'upload', label: '➕ Ajouter / Modifier' },
            { id: 'template', label: '📄 Template JSON' },
            { id: 'doc', label: '📖 Documentation' },
            { id: 'ai', label: '🤖 IA Cours' },
          ].map(t => (
            <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* LISTE */}
          {tab === 'list' && (
            <div>
              <h2 className={styles.sectionTitle}>Cours publiés</h2>
              {courses.length === 0 ? (
                <div className={styles.empty}>
                  <p>Aucun cours. Commence par ajouter un cours via l'onglet "Ajouter".</p>
                </div>
              ) : (
                <div className={styles.courseTable}>
                  <div className={styles.tableHeader}>
                    <span>Cours</span>
                    <span>Niveau</span>
                    <span>Catégorie</span>
                    <span>Leçons</span>
                    <span>Actions</span>
                  </div>
                  {courses.map(c => (
                    <div key={c.id} className={styles.tableRow}>
                      <div className={styles.courseInfo}>
                        <span style={{ fontSize: 22, marginRight: 10 }}>{c.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>ID: {c.id}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${c.level || 'debutant'}`}>{c.level}</span>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{c.cat}</span>
                      <span style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{c.totalLessons}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`/cours/${c.id}/0`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">👁 Voir</a>
                        {deleteId === c.id ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>Confirmer</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteId(null)}>Annuler</button>
                          </>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(c.id)}>🗑 Supprimer</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UPLOAD */}
          {tab === 'upload' && (
            <div>
              <h2 className={styles.sectionTitle}>Ajouter / Modifier un cours</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Colle le JSON de ton cours ci-dessous. Si l'ID existe déjà, le cours sera <strong>remplacé</strong>.
                Utilise l'onglet "Template" pour le format attendu.
              </p>

              {uploadMsg && (
                <div style={{
                  padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600,
                  background: uploadMsg.ok ? 'var(--green-bg)' : 'var(--red-bg)',
                  color: uploadMsg.ok ? 'var(--green)' : 'var(--red)',
                  border: `1px solid ${uploadMsg.ok ? 'rgba(0,214,143,.2)' : 'rgba(255,77,106,.2)'}`,
                }}>
                  {uploadMsg.msg}
                </div>
              )}

              <div style={{ position: 'relative', marginBottom: 14 }}>
                <textarea
                  className={styles.jsonEditor}
                  value={jsonInput}
                  onChange={e => { setJsonInput(e.target.value); setJsonError('') }}
                  placeholder={JSON.stringify(COURSE_TEMPLATE, null, 2)}
                  rows={28}
                  spellCheck={false}
                />
                {jsonInput && (
                  <button
                    style={{ position: 'absolute', top: 10, right: 10, background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: 'var(--text3)' }}
                    onClick={() => { setJsonInput(''); setJsonError(''); setUploadMsg(null) }}
                  >✕ Effacer</button>
                )}
              </div>

              {jsonError && <div className="form-error" style={{ marginBottom: 12 }}>⚠ {jsonError}</div>}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={uploadJSON} disabled={uploading || !jsonInput.trim()}>
                  {uploading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Upload en cours...</> : '⬆️ Uploader le cours'}
                </button>
                <button className="btn btn-secondary" onClick={() => { setJsonInput(JSON.stringify(COURSE_TEMPLATE, null, 2)); setJsonError('') }}>
                  Charger le template vide
                </button>
                <input ref={fileRef} type="file" accept=".json,.txt,.md,application/json,text/plain,text/markdown" style={{ display: 'none' }} onChange={uploadFile} />
                <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>📄 Charger un document</button>
              </div>
            </div>
          )}

          {/* TEMPLATE */}
          {tab === 'template' && (
            <div>
              <h2 className={styles.sectionTitle}>Template JSON d'un cours</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Copie ce template, remplis les champs, puis upload via l'onglet "Ajouter".
                Tu peux aussi télécharger le fichier .json et l'uploader directement.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  const blob = new Blob([JSON.stringify(COURSE_TEMPLATE, null, 2)], { type: 'application/json' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = 'cours-template.json'
                  a.click()
                }}>⬇️ Télécharger template.json</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setJsonInput(JSON.stringify(COURSE_TEMPLATE, null, 2)); setTab('upload') }}>
                  Utiliser ce template →
                </button>
              </div>
              <pre className={styles.templatePre}>{JSON.stringify(COURSE_TEMPLATE, null, 2)}</pre>
            </div>
          )}

          {/* DOCS */}
          {tab === 'doc' && (
            <div className={styles.docs}>
              <h2 className={styles.sectionTitle}>Documentation — Types de tests</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
                Chaque leçon contient un tableau <code>tests</code>. Chaque test a un <code>id</code>, une <code>description</code> (visible par l'apprenant), et un type <code>check</code>.
              </p>
              <div className={styles.testTypeList}>
                {TEST_TYPES.map(t => (
                  <div key={t.value} className={styles.testTypeCard}>
                    <div className={styles.testTypeName}>{t.value}</div>
                    <div className={styles.testTypeLabel}>{t.label}</div>
                    <div className={styles.testTypeFields}>
                      Champs requis : {t.fields.join(', ')}
                    </div>
                    <pre className={styles.testTypeExample}>{JSON.stringify({
                      id: "t1",
                      description: "Description visible",
                      check: t.value,
                      ...(t.value === 'hasTag' ? { arg: 'h1' } : {}),
                      ...(t.value === 'tagContainsText' ? { arg: 'h1', text: 'Bonjour' } : {}),
                      ...(t.value === 'hasAttr' ? { tag: 'a', attr: 'href' } : {}),
                      ...(t.value === 'minCount' ? { tag: 'li', min: 3 } : {}),
                      ...(t.value === 'cssContains' ? { text: 'display: flex' } : {}),
                      ...(t.value === 'codeContains' ? { text: 'const ' } : {}),
                      ...(t.value === 'consoleLog' ? { text: 'Bonjour' } : {}),
                    }, null, 2)}</pre>
                  </div>
                ))}
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: 40 }}>Niveaux et catégories valides</h2>
              <div className={styles.grid2}>
                <div>
                  <div className={styles.docLabel}>level</div>
                  {['debutant', 'intermediaire', 'avance', 'tous'].map(l => (
                    <div key={l} className={styles.docItem}><code>{l}</code></div>
                  ))}
                </div>
                <div>
                  <div className={styles.docLabel}>cat</div>
                  {['web', 'backend', 'data', 'outils'].map(c => (
                    <div key={c} className={styles.docItem}><code>{c}</code></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI */}
          {tab === 'ai' && (
            <div>
              <h2 className={styles.sectionTitle}>Assistant IA pour les cours</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Assistant local au site (sans API externe). Il peut convertir un document normal vers le format CodeLearn
                ou améliorer un JSON existant (missions, starterCode, tests, quizzes).
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${aiMode === 'improve' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setAiMode('improve')}
                >
                  Améliorer le JSON courant
                </button>
                <button
                  className={`btn btn-sm ${aiMode === 'normalize' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setAiMode('normalize')}
                >
                  Convertir un format normal
                </button>
                <button
                  className={`btn btn-sm ${aiMode === 'create' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setAiMode('create')}
                >
                  Créer un nouveau cours
                </button>
              </div>

              {aiMode === 'improve' && (
                <div style={{ marginBottom: 12 }}>
                  <button
                    className={`btn btn-sm ${aiOnlyMissionsTests ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setAiOnlyMissionsTests(v => !v)}
                    type="button"
                  >
                    {aiOnlyMissionsTests ? '✓ Appliquer seulement aux missions/tests' : 'Appliquer seulement aux missions/tests'}
                  </button>
                </div>
              )}

              <textarea
                className={styles.jsonEditor}
                rows={10}
                value={aiInstruction}
                onChange={e => setAiInstruction(e.target.value)}
                placeholder={
                  aiMode === 'improve'
                    ? 'Ex: Améliore ce cours Python pour débutants, missions plus progressives, tests plus précis, style clair et court.'
                    : aiMode === 'normalize'
                    ? 'Colle un document/texte brut ici. L IA le convertit au format JSON CodeLearn.'
                    : 'Ex: Crée un cours JavaScript intermédiaire sur les tableaux et objets avec 2 chapitres.'
                }
                spellCheck={false}
              />

              {aiMsg && (
                <div style={{ marginTop: 12, fontSize: 13, color: aiMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>
                  {aiMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <input
                  ref={aiFileRef}
                  type="file"
                  accept=".json,.txt,.md,application/json,text/plain,text/markdown"
                  style={{ display: 'none' }}
                  onChange={uploadAIFile}
                />
                <button className="btn btn-secondary" onClick={() => aiFileRef.current?.click()}>
                  📄 Uploader un fichier ici
                </button>
                <button className="btn btn-primary" onClick={generateWithAI} disabled={aiLoading}>
                  {aiLoading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Génération...</> : '🤖 Générer avec IA'}
                </button>
                <button className="btn btn-ghost" onClick={() => setTab('upload')}>
                  Aller à l'upload →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
