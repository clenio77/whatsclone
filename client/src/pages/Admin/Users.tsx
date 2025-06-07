import { useEffect, useState } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { adminApi } from '@/services/api'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'user' | 'admin'
  isVerified: boolean
  isOnline: boolean
  isLocked: boolean
  lockReason?: string
  createdAt: string
  lastSeen: string
}

interface UsersResponse {
  users: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchTerm, statusFilter, roleFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter
      })
      
      if (response.success) {
        setUsers(response.data.users)
        setPagination(response.data.pagination)
      } else {
        toast.error('Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await adminApi.updateUser(userId, updates)
      
      if (response.success) {
        toast.success('Usuário atualizado com sucesso')
        loadUsers()
        setShowEditModal(false)
        setSelectedUser(null)
      } else {
        toast.error('Erro ao atualizar usuário')
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return

    try {
      const response = await adminApi.deleteUser(userId)
      
      if (response.success) {
        toast.success('Usuário deletado com sucesso')
        loadUsers()
      } else {
        toast.error('Erro ao deletar usuário')
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      toast.error('Erro ao deletar usuário')
    }
  }

  const handleRevokeUserSessions = async (userId: string) => {
    try {
      const response = await adminApi.revokeUserSessions(userId)
      
      if (response.success) {
        toast.success('Sessões revogadas com sucesso')
      } else {
        toast.error('Erro ao revogar sessões')
      }
    } catch (error) {
      console.error('Erro ao revogar sessões:', error)
      toast.error('Erro ao revogar sessões')
    }
  }

  const UserRow = ({ user }: { user: User }) => {
    const [showActions, setShowActions] = useState(false)

    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-dark-border">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-dark-text">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
                {user.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            user.role === 'admin' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          )}>
            {user.role === 'admin' ? 'Admin' : 'Usuário'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            {user.isVerified ? (
              <UserCheck className="w-4 h-4 text-green-500" />
            ) : (
              <UserX className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-900 dark:text-dark-text">
              {user.isVerified ? 'Verificado' : 'Não verificado'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            )} />
            <span className="text-sm text-gray-900 dark:text-dark-text">
              {user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {user.isLocked ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Bloqueado
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Ativo
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg z-10 border border-gray-200 dark:border-dark-border">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setShowEditModal(true)
                      setShowActions(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border w-full text-left"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      handleRevokeUserSessions(user._id)
                      setShowActions(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border w-full text-left"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Revogar Sessões
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteUser(user._id)
                      setShowActions(false)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-dark-border w-full text-left"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
          Gerenciar Usuários
        </h1>
        <div className="text-sm text-gray-500 dark:text-dark-text-secondary">
          {pagination && `${pagination.totalUsers} usuários encontrados`}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-border">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
          >
            <option value="">Todos os status</option>
            <option value="verified">Verificados</option>
            <option value="unverified">Não verificados</option>
            <option value="online">Online</option>
            <option value="locked">Bloqueados</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
          >
            <option value="">Todos os roles</option>
            <option value="user">Usuários</option>
            <option value="admin">Administradores</option>
          </select>

          <Button type="submit">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Verificação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Conta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                  {users.map((user) => (
                    <UserRow key={user._id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-dark-text">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-border"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-border"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  )
}

// Modal component would be implemented here
const EditUserModal = ({ user, onClose, onSave }: {
  user: User
  onClose: () => void
  onSave: (userId: string, updates: Partial<User>) => void
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isLocked: user.isLocked,
    lockReason: user.lockReason || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(user._id, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
          Editar Usuário
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-dark-text">Verificado</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-dark-text">Bloqueado</span>
            </label>
          </div>

          {formData.isLocked && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                Motivo do bloqueio
              </label>
              <input
                type="text"
                value={formData.lockReason}
                onChange={(e) => setFormData({ ...formData, lockReason: e.target.value })}
                placeholder="Motivo do bloqueio..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminUsers
