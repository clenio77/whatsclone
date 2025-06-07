import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X,
  MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/services/authStore'
import { cn } from '@/utils/cn'

const AdminLayout = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Verificar se usuário é admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/chat" replace />
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin'
    },
    {
      name: 'Usuários',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-dark-bg">
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-surface shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.current
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border'
                  )}
                >
                  <Icon className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    item.current
                      ? 'text-blue-500 dark:text-blue-300'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
            <div className="space-y-1">
              <Link
                to="/chat"
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                Voltar ao Chat
              </Link>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                Sair
              </button>
            </div>
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
                Administrador
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
