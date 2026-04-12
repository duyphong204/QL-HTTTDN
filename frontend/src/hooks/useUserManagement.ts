import { useState, useCallback } from 'react'
import { useUserStore } from '@/stores/user.store'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import type { User } from '@/types/user.type'
import type { Role } from '@/types/auth.type'

type UserFormValues = {
  email: string
  password?: string
  role: Role
  profile: {
    fullName: string
  }
}

export const useUserManagement = () => {
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

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchUsers,
    debounceMs: 300,
  })

  const openCreateModal = useCallback(() => {
    setEditingUser(null)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handleDelete = useCallback(
    async (id: string, email: string) => {
      if (confirm('Bạn có chắc muốn xóa user: ' + email + '?')) {
        await deleteUser(id)
      }
    },
    [deleteUser]
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
      setModalOpen(false)
    },
    [editingUser, updateUser, addUser]
  )

  return {
    users,
    meta,
    isLoading,
    filters,
    modalOpen,
    setModalOpen,
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
