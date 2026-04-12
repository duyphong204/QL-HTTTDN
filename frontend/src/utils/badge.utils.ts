import { ROLE_BADGE } from '@/constants/role'

interface BadgeConfig {
  label: string
  color: string
}

export const getPositionBadge = (position?: string): BadgeConfig => {
  if (!position) {
    return { label: '—', color: 'bg-gray-100 text-gray-600' }
  }

  if (position in ROLE_BADGE) {
    const config = ROLE_BADGE[position as keyof typeof ROLE_BADGE]
    return { label: config.label, color: config.color }
  }

  return { label: position, color: 'bg-indigo-100 text-indigo-700' }
}
