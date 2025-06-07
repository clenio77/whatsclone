import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@shared/types'
import { authApi } from './api'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (phone: string) => Promise<boolean>
  register: (name: string, phone: string) => Promise<boolean>
  sendVerification: (phone: string) => Promise<boolean>
  verifyPhone: (phone: string, token: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<boolean>
  setTokens: (accessToken: string, refreshToken: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (phone: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(phone)

          if (response.success) {
            const { user, accessToken, refreshToken } = response.data
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            })
            toast.success('Login realizado com sucesso!')
            return true
          } else {
            toast.error(response.error || 'Erro no login')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          console.error('Erro no login:', error)
          toast.error(error.response?.data?.error || 'Erro no login')
          set({ isLoading: false })
          return false
        }
      },

      register: async (name: string, phone: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(name, phone)

          if (response.success) {
            toast.success('Usuário registrado! Envie o código de verificação.')
            set({ isLoading: false })
            return true
          } else {
            toast.error(response.error || 'Erro no registro')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          console.error('Erro no registro:', error)
          toast.error(error.response?.data?.error || 'Erro no registro')
          set({ isLoading: false })
          return false
        }
      },

      sendVerification: async (phone: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.sendVerification(phone)

          if (response.success) {
            toast.success('Código enviado por SMS!')
            set({ isLoading: false })
            return true
          } else {
            toast.error(response.error || 'Erro ao enviar código')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          console.error('Erro ao enviar verificação:', error)
          toast.error(error.response?.data?.error || 'Erro ao enviar código')
          set({ isLoading: false })
          return false
        }
      },

      verifyPhone: async (phone: string, token: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.verifyPhone(phone, token)

          if (response.success) {
            const { user, accessToken, refreshToken } = response.data
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false
            })
            toast.success('Verificação realizada com sucesso!')
            return true
          } else {
            toast.error(response.error || 'Código inválido')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          console.error('Erro na verificação:', error)
          toast.error(error.response?.data?.error || 'Código inválido')
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
        toast.success('Logout realizado com sucesso!')
      },

      checkAuth: async () => {
        const { accessToken, refreshToken } = get()

        if (!accessToken) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })

        try {
          // Tentar usar o token atual
          const response = await authApi.getProfile()

          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // Token inválido, tentar refresh
            if (refreshToken) {
              const refreshResponse = await authApi.refreshToken(refreshToken)

              if (refreshResponse.success) {
                set({
                  accessToken: refreshResponse.data.accessToken,
                  isLoading: false
                })
                // Tentar novamente obter o perfil
                await get().checkAuth()
              } else {
                // Refresh falhou, fazer logout
                get().logout()
                set({ isLoading: false })
              }
            } else {
              get().logout()
              set({ isLoading: false })
            }
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
          get().logout()
          set({ isLoading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await authApi.updateProfile(data)

          if (response.success) {
            set({ user: response.data })
            toast.success('Perfil atualizado com sucesso!')
            return true
          } else {
            toast.error(response.error || 'Erro ao atualizar perfil')
            return false
          }
        } catch (error: any) {
          console.error('Erro ao atualizar perfil:', error)
          toast.error(error.response?.data?.error || 'Erro ao atualizar perfil')
          return false
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)