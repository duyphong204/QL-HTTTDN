import { useEffect, useState } from 'react'
import { useCategoryStore } from '@/stores/category.store'
import { useClientTable } from '@/hooks/useClientTable'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import type { Category } from '@/types/category.type'

export const useCategoryPage = () => {
  const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore()

  const [name, setName] = useState('')
  const {
    modalOpen,
    editingEntity: editingCategory,
    openCreateModal: baseOpenCreateModal,
    openEditModal: baseOpenEditModal,
    closeModal,
  } = useEntityModal<Category>()
  const { confirmAndRun } = useConfirmAction()

  useEffect(() => {
    void fetchCategories()
  }, [fetchCategories])

  const { searchTerm, setSearchTerm, page, setPage, pagedData, meta } = useClientTable({
    data: categories,
    pageSize: 10,
    searchFn: (item, query) => item.name.toLowerCase().includes(query),
  })

  const openCreateModal = () => {
    setName('')
    baseOpenCreateModal()
  }

  const openEditModal = (category: Category) => {
    setName(category.name)
    baseOpenEditModal(category)
  }

  const handleNameChange = (value: string) => {
    setName(value)
  }

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const normalizedName = name.trim()
    if (!normalizedName) return

    if (editingCategory) {
      await updateCategory(editingCategory.id, normalizedName)
    } else {
      await createCategory(normalizedName)
    }

    closeModal()
    setName('')
  }

  const handleDelete = async (id: string, categoryName: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xoá danh mục "${categoryName}"?`,
      action: () => deleteCategory(id),
    })
  }

  return {
    categories,
    isLoading,
    modalOpen,
    editingCategory,
    name,
    searchTerm,
    page,
    pagedData,
    meta,
    setSearchTerm,
    setPage,
    openCreateModal,
    openEditModal,
    closeModal,
    handleNameChange,
    handleFormSubmit,
    handleDelete,
  }
}
