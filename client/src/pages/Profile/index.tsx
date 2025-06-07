import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, User, Phone, MessageSquare, Moon, Sun, LogOut } from 'lucide-react'
import { useAuthStore } from '@/services/authStore'
import { useThemeStore } from '@/services/themeStore'
import Avatar from '@/components/common/Avatar'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { User as UserType } from '@shared/types'

interface ProfileForm {
  name: string
  status: string
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuthStore()
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      status: user?.status || ''
    }
  })

  const handleSave = async (data: ProfileForm) => {
    const success = await updateProfile(data)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-whatsapp-light text-white p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Perfil</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Avatar Section */}
        <div className="card p-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="xl"
              className="ring-4 ring-whatsapp-light/20"
            />
            <Button variant="secondary" size="sm">
              Alterar foto
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              Informações do perfil
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {isEditing ? (
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <Input
                label="Nome"
                {...form.register('name', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                error={form.formState.errors.name?.message}
              />

              <Input
                label="Recado"
                placeholder="Disponível"
                {...form.register('status')}
                error={form.formState.errors.status?.message}
              />

              <div className="flex space-x-3 pt-4">
                <Button type="submit" size="sm">
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Nome</p>
                  <p className="font-medium text-gray-900 dark:text-dark-text">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Recado</p>
                  <p className="font-medium text-gray-900 dark:text-dark-text">
                    {user.status || 'Disponível'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Telefone</p>
                  <p className="font-medium text-gray-900 dark:text-dark-text">{user.phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">
            Configurações
          </h2>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-dark-text">Tema</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {theme === 'dark' ? 'Modo escuro' : theme === 'light' ? 'Modo claro' : 'Sistema'}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
              >
                Alterar
              </Button>
            </div>

            {/* Logout */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">Sair</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    Desconectar da conta
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage