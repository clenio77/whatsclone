import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MessageCircle, Phone, User, Shield } from 'lucide-react'
import { useAuthStore } from '@/services/authStore'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { cn } from '@/utils/cn'

interface RegisterForm {
  name: string
  phone: string
}

interface VerificationForm {
  phone: string
  token: string
}

type Step = 'register' | 'verification' | 'login'

const LoginPage = () => {
  const [step, setStep] = useState<Step>('register')
  const [phoneNumber, setPhoneNumber] = useState('')

  const { register: registerUser, sendVerification, verifyPhone, login, isLoading } = useAuthStore()

  const registerForm = useForm<RegisterForm>()
  const verificationForm = useForm<VerificationForm>()

  const handleRegister = async (data: RegisterForm) => {
    const success = await registerUser(data.name, data.phone)
    if (success) {
      setPhoneNumber(data.phone)
      setStep('verification')
      verificationForm.setValue('phone', data.phone)
    }
  }

  const handleSendVerification = async () => {
    const success = await sendVerification(phoneNumber)
    if (success) {
      setStep('verification')
    }
  }

  const handleVerification = async (data: VerificationForm) => {
    const success = await verifyPhone(data.phone, data.token)
    if (success) {
      // Usuário será redirecionado automaticamente pelo App.tsx
    }
  }

  const handleLogin = async () => {
    const success = await login(phoneNumber)
    if (success) {
      // Usuário será redirecionado automaticamente pelo App.tsx
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-light to-whatsapp-dark p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <MessageCircle className="w-8 h-8 text-whatsapp-light" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">WhatsClone</h1>
          <p className="text-white/80">
            {step === 'register' && 'Crie sua conta para começar'}
            {step === 'verification' && 'Verifique seu número de telefone'}
            {step === 'login' && 'Entre na sua conta'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-6">
          {/* Registro */}
          {step === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary mb-4">
                <User className="w-5 h-5" />
                <span className="text-sm">Informações pessoais</span>
              </div>

              <Input
                label="Nome completo"
                placeholder="Digite seu nome"
                {...registerForm.register('name', {
                  required: 'Nome é obrigatório',
                  minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                })}
                error={registerForm.formState.errors.name?.message}
              />

              <Input
                label="Número de telefone"
                placeholder="+55 11 99999-9999"
                type="tel"
                {...registerForm.register('phone', {
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Formato de telefone inválido'
                  }
                })}
                error={registerForm.formState.errors.phone?.message}
              />

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                className="mt-6"
              >
                <Phone className="w-4 h-4 mr-2" />
                Continuar
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-sm text-whatsapp-dark hover:underline"
                >
                  Já tem uma conta? Fazer login
                </button>
              </div>
            </form>
          )}

          {/* Verificação */}
          {step === 'verification' && (
            <form onSubmit={verificationForm.handleSubmit(handleVerification)} className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary mb-4">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Código de verificação</span>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Enviamos um código SMS para
                </p>
                <p className="font-medium text-gray-900 dark:text-dark-text">
                  {phoneNumber}
                </p>
              </div>

              <Input
                label="Código de verificação"
                placeholder="Digite o código de 4 dígitos"
                type="text"
                maxLength={4}
                {...verificationForm.register('token', {
                  required: 'Código é obrigatório',
                  pattern: {
                    value: /^\d{4}$/,
                    message: 'Código deve ter 4 dígitos'
                  }
                })}
                error={verificationForm.formState.errors.token?.message}
              />

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                className="mt-6"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verificar
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isLoading}
                  className="text-sm text-whatsapp-dark hover:underline disabled:opacity-50"
                >
                  Reenviar código
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Voltar
                </button>
              </div>
            </form>
          )}

          {/* Login */}
          {step === 'login' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-dark-text-secondary mb-4">
                <Phone className="w-5 h-5" />
                <span className="text-sm">Fazer login</span>
              </div>

              <Input
                label="Número de telefone"
                placeholder="+55 11 99999-9999"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <Button
                onClick={handleLogin}
                loading={isLoading}
                fullWidth
                className="mt-6"
                disabled={!phoneNumber}
              >
                <Phone className="w-4 h-4 mr-2" />
                Entrar
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm text-whatsapp-dark hover:underline"
                >
                  Não tem uma conta? Registrar-se
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-xs">
            Ao continuar, você concorda com nossos Termos de Serviço
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage