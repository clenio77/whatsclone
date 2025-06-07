import { cn } from '@/utils/cn'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  online?: boolean
  className?: string
}

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  online = false, 
  className 
}: AvatarProps) => {
  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('avatar', sizeClasses[size], className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="avatar-image"
          onError={(e) => {
            // Fallback para iniciais se a imagem falhar
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
      ) : null}
      
      <div 
        className={cn(
          'avatar-fallback',
          src && 'hidden'
        )}
        style={{ display: src ? 'none' : 'flex' }}
      >
        {getInitials(name)}
      </div>
      
      {online && <div className="online-indicator" />}
    </div>
  )
}

export default Avatar
