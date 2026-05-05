import '../styles/globals.css'
import { AuthProvider } from '../lib/useAuth'
import Nav from '../components/Nav'
import Toast from '../components/Toast'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Nav />
      <Component {...pageProps} />
      <Toast />
    </AuthProvider>
  )
}
