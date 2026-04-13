import { useCallback, useState } from 'react'

export const useEntityModal = <T>() => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<T | null>(null)

  const openCreateModal = useCallback(() => {
    setEditingEntity(null)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((entity: T) => {
    setEditingEntity(entity)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  return {
    modalOpen,
    setModalOpen,
    editingEntity,
    setEditingEntity,
    openCreateModal,
    openEditModal,
    closeModal,
  }
}
