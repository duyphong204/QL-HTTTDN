import { useCallback } from 'react'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/user.store'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import { userService } from '@/services/user.service'
import { getErrorMessage } from '@/stores/store.helpers'
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

export const useUser = () => {
  const {
    users,
    meta,
    isLoading,
    filters,
    setUsers,
    setMeta,
    setLoading,
    setError,
    setFilters,
  } = useUserStore()

  const {
    modalOpen,
    editingEntity: editingUser,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<User>()

  const { confirmAndRun } = useConfirmAction()
  const userList = Array.isArray(users) ? users : []

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.getUsers(filters)
      setUsers(response.data)
      setMeta(response.meta)
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [filters, setError, setLoading, setMeta, setUsers])

  const addUser = useCallback(
    async (data: UserFormValues) => {
      try {
        await userService.createUser({
          email: data.email,
          password: data.password || '',
          role: data.role,
          profile: { fullName: data.profile.fullName },
        })
        await fetchUsers()
        toast.success('Thêm người dùng thành công')
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
        throw err
      }
    },
    [fetchUsers, setError],
  )

  const updateUser = useCallback(
    async (id: string, data: UserFormValues) => {
      try {
        await userService.updateUser(id, {
          email: data.email,
          role: data.role,
          profile: { fullName: data.profile.fullName },
        })
        await fetchUsers()
        toast.success('Cập nhật người dùng thành công')
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
        throw err
      }
    },
    [fetchUsers, setError],
  )

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await userService.deleteUser(id)
        setUsers(userList.filter((u) => u.id !== id))
        await fetchUsers()
        toast.success('Xóa người dùng thành công')
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
        throw err
      }
    },
    [fetchUsers, setError, setUsers, userList],
  )

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchUsers,
    debounceMs: 300,
  })

  const handleDelete = useCallback(
    async (id: string, email?: string) => {
      await confirmAndRun({
        message: `Bạn có chắc muốn xóa user ${email ?? ''}?`,
        action: () => deleteUser(id),
      })
    },
    [confirmAndRun, deleteUser],
  )

  const handleFormSubmit = useCallback(
    async (data: UserFormValues) => {
      if (editingUser) {
        await updateUser(editingUser.id, data)
      } else {
        await addUser(data)
      }

      closeModal()
    },
    [addUser, closeModal, editingUser, updateUser],
  )

  return {
    users: userList,
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

export const useUserPage = useUser
