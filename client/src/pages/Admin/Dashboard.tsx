import { useEffect, useState } from 'react'
import { 
  Users, 
  MessageSquare, 
  Bot, 
  Shield, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react'
import { useAuthStore } from '@/services/authStore'
import { adminApi } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface DashboardStats {
  overview: {
    totalUsers: number
    activeUsers: number
    totalChats: number
    totalMessages: number
    totalBots: number
  }
  growth: {
    newUsers: number
    newChats: number
    newMessages: number
    period: string
  }
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    phone: string
    createdAt: string
    isVerified: boolean
    isOnline: boolean
  }>
  security: {
    totalEvents: number
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
  }
  sessions: {
    totalUsers: number
    totalSessions: number
    averageSessionsPerUser: string
  }
}

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getDashboard()
      
      if (response.success) {
        setStats(response.data)
      } else {
        toast.error('Erro ao carregar dashboard')
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast.error('Erro ao carregar dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-dark-text-secondary">
          Erro ao carregar dados do dashboard
        </p>
      </div>
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    growth,
    subtitle 
  }: {
    title: string
    value: string | number
    icon: any
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    growth?: number
    subtitle?: string
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      red: 'bg-red-500 text-white'
    }

    return (
      <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                {subtitle}
              </p>
            )}
            {growth !== undefined && (
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  +{growth} este mês
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Bem-vindo, {user?.name}
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.overview.totalUsers}
          icon={Users}
          color="blue"
          growth={stats.growth.newUsers}
        />
        <StatCard
          title="Usuários Online"
          value={stats.overview.activeUsers}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Total de Chats"
          value={stats.overview.totalChats}
          icon={MessageSquare}
          color="purple"
          growth={stats.growth.newChats}
        />
        <StatCard
          title="Total de Mensagens"
          value={stats.overview.totalMessages}
          icon={MessageSquare}
          color="orange"
          growth={stats.growth.newMessages}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Bots IA"
          value={stats.overview.totalBots}
          icon={Bot}
          color="purple"
        />
        <StatCard
          title="Eventos de Segurança"
          value={stats.security.totalEvents}
          icon={Shield}
          color="red"
          subtitle="Últimas 24 horas"
        />
        <StatCard
          title="Sessões Ativas"
          value={stats.sessions.totalSessions}
          icon={Clock}
          color="green"
          subtitle={`${stats.sessions.averageSessionsPerUser} por usuário`}
        />
      </div>

      {/* Recent Users and Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
            Usuários Recentes
          </h3>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isVerified ? (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-500" />
                  )}
                  {user.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Overview */}
        <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
            Eventos de Segurança
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.security.eventsBySeverity).map(([severity, count]) => {
              const severityColors = {
                CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                INFO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }

              return (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                      {severity}
                    </span>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    severityColors[severity as keyof typeof severityColors]
                  )}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
