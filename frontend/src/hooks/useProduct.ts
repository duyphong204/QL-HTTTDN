import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useProductStore } from '@/stores/product.store'
import { useCategoryStore } from '@/stores/category.store'
import { useSupplierStore } from '@/stores/supplier.store'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { useEntityModal } from '@/hooks/useEntityModal'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import { categoryService, productService, supplierService } from '@/services/warehouse.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product.types'

export const useProduct = () => {
  const products = useProductStore((state) => state.products)
  const meta = useProductStore((state) => state.meta)
  const filters = useProductStore((state) => state.filters)
  const isLoading = useProductStore((state) => state.isLoading)
  const setProducts = useProductStore((state) => state.setProducts)
  const setMeta = useProductStore((state) => state.setMeta)
  const setFilters = useProductStore((state) => state.setFilters)
  const setLoading = useProductStore((state) => state.setLoading)

  const categories = useCategoryStore((state) => state.categories)
  const setCategories = useCategoryStore((state) => state.setCategories)

  const suppliers = useSupplierStore((state) => state.suppliers)
  const setSuppliers = useSupplierStore((state) => state.setSuppliers)

  const {
    modalOpen,
    editingEntity: editingProduct,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Product>()
  const { confirmAndRun } = useConfirmAction()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await productService.getProducts(filters)
      setProducts(response.data)
      setMeta(response.meta)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách sản phẩm'))
    } finally {
      setLoading(false)
    }
  }, [filters, setLoading, setMeta, setProducts])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải danh mục'))
    }
  }, [setCategories])

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await supplierService.getSuppliers()
      setSuppliers(response.data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể tải nhà cung cấp'))
    }
  }, [setSuppliers])

  const createProduct = useCallback(
    async (data: CreateProductDto) => {
      try {
        await productService.createProduct(data)
        toast.success('Thêm sản phẩm thành công')
        await fetchProducts()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Thêm sản phẩm thất bại'))
        throw error
      }
    },
    [fetchProducts],
  )

  const updateProduct = useCallback(
    async (id: string, data: UpdateProductDto) => {
      try {
        await productService.updateProduct(id, data)
        toast.success('Cập nhật sản phẩm thành công')
        await fetchProducts()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Cập nhật sản phẩm thất bại'))
        throw error
      }
    },
    [fetchProducts],
  )

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        await productService.deleteProduct(id)
        toast.success('Xóa sản phẩm thành công')
        await fetchProducts()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, 'Xóa sản phẩm thất bại'))
      }
    },
    [fetchProducts],
  )

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
    meta,
    filters,
    isLoading,
    categories,
    suppliers,
    setProducts,
    setMeta,
    setFilters,
    setLoading,
    setCategories,
    setSuppliers,
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
