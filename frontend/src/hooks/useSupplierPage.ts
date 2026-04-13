import { useSupplierStore } from "@/stores/supplier.store"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import { useEntityModal } from "@/hooks/useEntityModal"
import { useConfirmAction } from "@/hooks/useConfirmAction"
import type { Supplier, CreateSupplierDto } from "@/types/supplier.types"

export const useSupplierPage = () => {
  const {
    suppliers,
    meta,
    isLoading,
    filters,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
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