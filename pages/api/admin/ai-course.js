import { getAdminFromReq } from '../../../lib/auth'

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

function slugify(s = '') {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function guessLevel(text = '') {
  const t = text.toLowerCase()
  if (/\b(avance|expert|optimisation|architecture)\b/.test(t)) return 'avance'
  if (/\b(intermediaire|intermédiaire|asynchrone|api|state|algorithme)\b/.test(t)) return 'intermediaire'
  return 'debutant'
}

function defaultStarterByTopic(text = '') {
  const t = text.toLowerCase()
  if (/\b(html|css)\b/.test(t)) {
    return '<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>'
  }
  return '// Écris ton code ici\n'
}

function defaultTestsByTopic(text = '') {
  const t = text.toLowerCase()
  if (/\bhtml\b/.test(t)) {
    return [{ id: 't1', description: 'Le code contient une balise HTML', check: 'codeContains', text: '<' }]
  }
  if (/\bcss\b/.test(t)) {
    return [{ id: 't1', description: 'Le code contient une règle CSS', check: 'codeContains', text: '{' }]
  }
  return [{ id: 't1', description: 'Le code contient une solution', check: 'codeContains', text: '' }]
}

function normalizeFromText(sourceText = '', instruction = '') {
  const raw = `${instruction}\n${sourceText}`.trim()
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const title = lines[0]?.slice(0, 80) || 'Nouveau cours'
  const lessonChunks = raw.split(/\n{2,}/).filter(Boolean).slice(0, 12)
  const lessons = lessonChunks.map((chunk, i) => {
    const first = chunk.split('\n')[0]?.slice(0, 60) || `Leçon ${i + 1}`
    return {
      title: first,
      theory: chunk,
      task: `Réalise la mission de la leçon "${first}" en respectant les consignes.`,
      starterCode: defaultStarterByTopic(raw),
      tests: defaultTestsByTopic(raw).map((t, ti) => ({ ...t, id: `t${ti + 1}` }))
    }
  })

  return {
    id: slugify(title) || `cours-${Date.now()}`,
    icon: '📚',
    name: title,
    desc: 'Cours converti automatiquement au format CodeLearn',
    level: guessLevel(raw),
    cat: 'web',
    color: '#6c5ce7',
    bg: '#6c5ce718',
    chapters: [{ title: 'Chapitre 1', lessons: lessons.length ? lessons : [{
      title: 'Introduction',
      theory: raw || 'Contenu à compléter.',
      task: 'Écris le code demandé dans cette mission.',
      starterCode: defaultStarterByTopic(raw),
      tests: [{ id: 't1', description: 'Le code a été modifié', check: 'codeContains', text: '' }]
    }] }],
    quizzes: []
  }
}

function improveCourseLocally(course, onlyMissionsTests = false) {
  const out = JSON.parse(JSON.stringify(course))
  out.chapters = (out.chapters || []).map(ch => ({
    ...ch,
    lessons: (ch.lessons || []).map((lesson) => {
      const improvedTask = lesson.task
        ? `Mission: ${lesson.task.replace(/^Mission:\s*/i, '').trim()}`
        : `Mission: Implémente "${lesson.title}" selon la théorie.`
      const improvedTests = Array.isArray(lesson.tests) && lesson.tests.length
        ? lesson.tests.map((t, i) => ({ id: t.id || `t${i + 1}`, description: t.description || `Test ${i + 1}`, ...t }))
        : [{ id: 't1', description: 'Le code contient une solution', check: 'codeContains', text: '' }]

      if (onlyMissionsTests) return { ...lesson, task: improvedTask, tests: improvedTests }
      return {
        ...lesson,
        theory: lesson.theory || 'Explication à compléter.',
        task: improvedTask,
        starterCode: lesson.starterCode || defaultStarterByTopic(lesson.title || ''),
        tests: improvedTests
      }
    })
  }))
  return out
}

function mergeMissionsAndTests(original, generated) {
  const out = JSON.parse(JSON.stringify(original))
  const origChapters = out?.chapters || []
  const genChapters = generated?.chapters || []

  for (let ci = 0; ci < origChapters.length; ci++) {
    const oLessons = origChapters[ci]?.lessons || []
    const gLessons = genChapters[ci]?.lessons || []
    for (let li = 0; li < oLessons.length; li++) {
      if (!gLessons[li]) continue
      if (typeof gLessons[li].task === 'string') oLessons[li].task = gLessons[li].task
      if (Array.isArray(gLessons[li].tests) && gLessons[li].tests.length > 0) oLessons[li].tests = gLessons[li].tests
    }
  }
  return out
}

export default async function handler(req, res) {
  const admin = getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Accès refusé.' })
  if (req.method !== 'POST') return res.status(405).end()

  const { mode = 'create', instruction = '', currentJson = '', sourceText = '', onlyMissionsTests = false } = req.body || {}

  try {
    if (mode === 'normalize') {
      const normalized = normalizeFromText(sourceText || currentJson || '', instruction)
      return res.status(200).json({ ok: true, course: normalized, raw: JSON.stringify(normalized) })
    }

    if (mode === 'improve') {
      let originalParsed
      try {
        originalParsed = JSON.parse(currentJson || '{}')
      } catch {
        return res.status(400).json({ error: 'Le JSON courant est invalide.' })
      }
      const improved = improveCourseLocally(originalParsed, onlyMissionsTests)
      if (onlyMissionsTests) {
        const merged = mergeMissionsAndTests(originalParsed, improved)
        return res.status(200).json({ ok: true, course: merged, raw: JSON.stringify(merged) })
      }
      return res.status(200).json({ ok: true, course: improved, raw: JSON.stringify(improved) })
    }

    const created = normalizeFromText(sourceText || instruction || 'Nouveau cours', instruction)
    return res.status(200).json({ ok: true, course: created, raw: JSON.stringify(created) })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Erreur serveur IA.' })
  }
}

