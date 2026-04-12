import { useCallback, useState } from "react"
import { useSupplierStore } from "@/stores/supplier.store"
import { usePaginatedList } from "@/hooks/usePaginatedList"
import type { Supplier, CreateSupplierDto } from "@/types/warehouse.type"

export const useSupplierManagement = () => {
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

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchSuppliers,
    debounceMs: 500,
  })

  const openCreateModal = () => {
    setEditingSupplier(null)
    setModalOpen(true)
  }

  const openEditModal = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier)
    setModalOpen(true)
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa nhà cung cấp: ${name}?`)) {
      await deleteSupplier(id)
    }
  }

  const handleFormSubmit = async (data: CreateSupplierDto) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data)
    } else {
      await createSupplier(data)
    }
    setModalOpen(false)
  }

  return {
    // Data
    suppliers,
    meta,
    isLoading,

    // State
    modalOpen,
    setModalOpen,
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
    handleDelete,
    handleFormSubmit,
  }
}