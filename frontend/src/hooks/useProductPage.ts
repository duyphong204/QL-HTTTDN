import { useEffect } from 'react'
import { useProductStore } from '@/stores/product.store'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product.types'

export const useProductPage = () => {
  const {
    products,
    isLoading,
    meta,
    filters,
    categories,
    suppliers,
    fetchProducts,
    fetchCategories,
    fetchSuppliers,
    setFilters,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore()

  const {
    modalOpen,
    editingEntity: editingProduct,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Product>()
  const { confirmAndRun } = useConfirmAction()

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchProducts,
    debounceMs: 400,
  })

  useEffect(() => {
    void Promise.all([fetchCategories(), fetchSuppliers()])
  }, [fetchCategories, fetchSuppliers])

  const handleDelete = async (id: string, productName: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xoá sản phẩm "${productName}"?`,
      action: () => deleteProduct(id),
    })
  }

  const handleFormSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data as UpdateProductDto)
    } else {
      await createProduct(data as CreateProductDto)
    }

    closeModal()
  }

  return {
    products,
    isLoading,
    meta,
    filters,
    categories,
    suppliers,
    modalOpen,
    editingProduct,
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
