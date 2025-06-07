import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './services/authStore'
import { useThemeStore } from './services/themeStore'
import LoginPage from './pages/Login'
import ChatPage from './pages/Chat'
import ProfilePage from './pages/Profile'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Verificar autenticação ao carregar a app
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/chat" replace /> : <LoginPage />} 
        />
        
        {/* Rotas protegidas */}
        <Route 
          path="/chat" 
          element={user ? <ChatPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/chat/:chatId" 
          element={user ? <ChatPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/login" replace />} 
        />
        
        {/* Rota padrão */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/chat" : "/login"} replace />} 
        />
        
        {/* Rota 404 */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/chat" : "/login"} replace />} 
        />
      </Routes>
    </div>
  )
}

export default App
