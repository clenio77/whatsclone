import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  actualTheme: 'light' | 'dark'
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const getActualTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'system',
      actualTheme: getSystemTheme(),

      // Actions
      setTheme: (theme: Theme) => {
        const actualTheme = getActualTheme(theme)
        set({ theme, actualTheme })
        
        // Aplicar tema imediatamente
        if (actualTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Atualizar tema do sistema após hidratação
          if (state.theme === 'system') {
            const systemTheme = getSystemTheme()
            state.actualTheme = systemTheme
          }
          
          // Aplicar tema
          if (state.actualTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }
    }
  )
)

// Listener para mudanças no tema do sistema
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme, setTheme } = useThemeStore.getState()
    if (theme === 'system') {
      setTheme('system') // Isso irá recalcular o actualTheme
    }
  })
}
