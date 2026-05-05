import { useEffect, useState } from 'react'

let _addToast = null
export function toast(msg, type = '') {
  if (_addToast) _addToast(msg, type)
}

export default function Toast() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
    return () => { _addToast = null }
  }, [])
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}
