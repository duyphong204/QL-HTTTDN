import { useCallback } from "react"
import { toast } from "sonner"
import { useSupplierStore } from "@/stores/supplier.store"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import { useEntityModal } from "@/hooks/useEntityModal"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import { supplierService } from "@/services/warehouse.service"
import { getErrorMessage } from "@/stores/store.helpers"
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "@/types/supplier.types"

export const useSupplierPage = () => {
  const {
    suppliers,
    meta,
    isLoading,
    filters,
    setSuppliers,
    setMeta,
    setLoading,
    setError,
    setFilters,
  } = useSupplierStore()

  const {
    modalOpen,
    editingEntity: editingSupplier,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Supplier>()
  const { confirmAndRun } = useConfirmAction()

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await supplierService.getSuppliers(filters)
      setSuppliers(response.data)
      setMeta(response.meta)
    } catch (err: unknown) {
      const message = getErrorMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [filters, setError, setLoading, setMeta, setSuppliers])

  const createSupplier = useCallback(
    async (data: CreateSupplierDto) => {
      try {
        const newSupplier = await supplierService.createSupplier(data)
        setSuppliers([newSupplier, ...suppliers])
        toast.success("Thêm nhà cung cấp thành công")
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
        throw err
      }
    },
    [setError, setSuppliers, suppliers],
  )

  const updateSupplier = useCallback(
    async (id: string, data: UpdateSupplierDto) => {
      try {
        const updated = await supplierService.updateSupplier(id, data)
        setSuppliers(suppliers.map((s) => (s.id === id ? updated : s)))
        toast.success("Cập nhật nhà cung cấp thành công")
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
        throw err
      }
    },
    [setError, setSuppliers, suppliers],
  )

  const deleteSupplier = useCallback(
    async (id: string) => {
      try {
        await supplierService.deleteSupplier(id)
        setSuppliers(suppliers.filter((s) => s.id !== id))
        toast.success("Xóa nhà cung cấp thành công")
      } catch (err: unknown) {
        const message = getErrorMessage(err)
        setError(message)
        toast.error(message)
      }
    },
    [setError, setSuppliers, suppliers],
  )

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchSuppliers,
    debounceMs: 500,
  })

  const handleDelete = async (id: string, name: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xóa nhà cung cấp: ${name}?`,
      action: () => deleteSupplier(id),
    })
  }

  const handleFormSubmit = async (data: CreateSupplierDto) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data)
    } else {
      await createSupplier(data)
    }
    closeModal()
  }

  return {
    // Data
    suppliers,
    meta,
    isLoading,

    // State
    modalOpen,
    editingSupplier,

    // Search & Filters
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    goToPage,

    // Handlers
    openCreateModal,
    openEditModal,
    closeModal,
    handleDelete,
    handleFormSubmit,
  }
}