import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

function AppContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

function App() {
  return <AppContent />
}

export default App
