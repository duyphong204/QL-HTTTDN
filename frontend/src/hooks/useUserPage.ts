import { useCallback } from 'react'
import { useUserStore } from '@/stores/user.store'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import type { User } from '@/types/user.types'
import type { Role } from '@/types/auth.types'

type UserFormValues = {
  email: string
  password?: string
  role: Role
  profile: {
    fullName: string
  }
}

export const useUserPage = () => {
  const {
    users,
    meta,
    isLoading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    setFilters,
    filters,
  } = useUserStore()

  const {
    modalOpen,
    editingEntity: editingUser,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<User>()
  const { confirmAndRun } = useConfirmAction()

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchUsers,
    debounceMs: 300,
  })

  const handleDelete = useCallback(
    async (id: string, email: string) => {
      await confirmAndRun({
        message: 'Bạn có chắc muốn xóa user: ' + email + '?',
        action: () => deleteUser(id),
      })
    },
    [confirmAndRun, deleteUser]
  )

  const handleFormSubmit = useCallback(
    async (data: UserFormValues) => {
      if (editingUser) {
        await updateUser(editingUser.id, {
          email: data.email,
          role: data.role,
          profile: { fullName: data.profile.fullName },
        })
      } else {
        await addUser({
          email: data.email,
          password: data.password || '',
          role: data.role,
          profile: { fullName: data.profile.fullName },
        })
      }
      closeModal()
    },
    [closeModal, editingUser, updateUser, addUser]
  )

  return {
    users,
    meta,
    isLoading,
    filters,
    modalOpen,
    editingUser,
    searchTerm,
    setSearchTerm,
    updateFilters,
    goToPage,
    openCreateModal,
    openEditModal,
    closeModal,
    handleDelete,
    handleFormSubmit,
  }
}
