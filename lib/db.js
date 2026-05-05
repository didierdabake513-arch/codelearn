/**
 * Simple file-based storage using /tmp (works on Vercel for ephemeral data)
 * For production, replace with a real DB (Planetscale, Supabase, etc.)
 * Users and progress are stored in memory + /tmp
 */

import fs from 'fs'
import path from 'path'

const TMP = '/tmp/codelearn'
const url = process.env.https://avygmwfbdkzvdtmoyccm.supabase.co
const key = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eWdtd2ZiZGt6dmR0bW95Y2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzY3MDYsImV4cCI6MjA5MzU1MjcwNn0.vEsJpm - MfE0XqM8_cFPsAWUE3RzKmG4BAmd1ZRf - kx8
function ensureDir() {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true })
}

function readFile(name, fallback = {}) {
  ensureDir()
  const p = path.join(TMP, name + '.json')
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch { }
  return fallback
}

function writeFile(name, data) {
  ensureDir()
  fs.writeFileSync(path.join(TMP, name + '.json'), JSON.stringify(data, null, 2))
}

// ── USERS ──────────────────────────────────────────────────────────────────
export function getUsers() {
  return readFile('users', {})
}

export function saveUsers(users) {
  writeFile('users', users)
}

export function getUserByEmail(email) {
  const users = getUsers()
  return Object.values(users).find(u => u.email === email) || null
}

export function getUserById(id) {
  return getUsers()[id] || null
}

export function createUser({ id, email, passwordHash, name }) {
  const users = getUsers()
  users[id] = { id, email, passwordHash, name, createdAt: Date.now() }
  saveUsers(users)
  return users[id]
}

// ── PROGRESS ───────────────────────────────────────────────────────────────
export function getProgress(userId) {
  const all = readFile('progress', {})
  return all[userId] || { xp: 0, lessonsCompleted: [], quizzesCompleted: [] }
}

export function saveProgress(userId, data) {
  const all = readFile('progress', {})
  all[userId] = { ...data, updatedAt: Date.now() }
  writeFile('progress', all)
}

// ── COURSES ────────────────────────────────────────────────────────────────
// Courses are stored as individual JSON files in /tmp/codelearn/courses/
export function getCoursesList() {
  ensureDir()
  const dir = path.join(TMP, 'courses')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
          // Return only metadata for listing
          return {
            id: raw.id,
            icon: raw.icon,
            name: raw.name,
            desc: raw.desc,
            level: raw.level,
            cat: raw.cat,
            color: raw.color,
            bg: raw.bg,
            totalLessons: (raw.chapters || []).reduce((a, ch) => a + (ch.lessons || []).length, 0),
            uploadedAt: raw.uploadedAt || 0,
          }
        } catch { return null }
      })
      .filter(Boolean)
      .sort((a, b) => (a.uploadedAt || 0) - (b.uploadedAt || 0))
  } catch { return [] }
}

export function getCourseData(courseId) {
  ensureDir()
  const p = path.join(TMP, 'courses', courseId + '.json')
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

export function saveCourse(courseData) {
  ensureDir()
  const dir = path.join(TMP, 'courses')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  courseData.uploadedAt = Date.now()
  fs.writeFileSync(path.join(dir, courseData.id + '.json'), JSON.stringify(courseData, null, 2))
}

export function deleteCourse(courseId) {
  const p = path.join(TMP, 'courses', courseId + '.json')
  if (fs.existsSync(p)) fs.unlinkSync(p)
}
