import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCategoryStore } from '@/stores/category.store'
import { useClientTable } from '@/hooks/useClientTable'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import { categoryService } from '@/services/warehouse.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { Category } from '@/types/product.types'

export const useCategoryPage = () => {
  const { categories, isLoading, setCategories, setLoading } = useCategoryStore()

  const [name, setName] = useState('')
  const {
    modalOpen,
    editingEntity: editingCategory,
    openCreateModal: baseOpenCreateModal,
    openEditModal: baseOpenEditModal,
    closeModal,
  } = useEntityModal<Category>()
  const { confirmAndRun } = useConfirmAction()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [setCategories, setLoading])

  const createCategory = useCallback(
    async (name: string) => {
      try {
        const newCategory = await categoryService.create(name)
        setCategories([...categories, newCategory])
        toast.success('Thêm danh mục thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        toast.error(message)
        throw error
      }
    },
    [categories, setCategories],
  )

  const updateCategory = useCallback(
    async (id: string, name: string) => {
      try {
        const updated = await categoryService.update(id, name)
        setCategories(categories.map((cat) => (cat.id === id ? updated : cat)))
        toast.success('Cập nhật danh mục thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        toast.error(message)
        throw error
      }
    },
    [categories, setCategories],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await categoryService.delete(id)
        setCategories(categories.filter((cat) => cat.id !== id))
        toast.success('Xóa danh mục thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        toast.error(message)
      }
    },
    [categories, setCategories],
  )

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
