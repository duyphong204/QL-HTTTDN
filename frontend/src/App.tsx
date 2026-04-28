import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from './routes'
import { queryClient } from '@/lib/queryClient'
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap'

function AppContent() {
  useAuthBootstrap()

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
