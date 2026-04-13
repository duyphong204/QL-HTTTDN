import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useClientTable } from '@/hooks/useClientTable'
import { useStockInStore } from '@/stores/stockIn.store'
import type { StockIn, StockInDetailInput } from '@/types/stockIn.types'

const emptyDetail = (): StockInDetailInput => ({ productId: '', quantity: 1, price: 0 })

export const useImportSlipPage = () => {
  const stockIns = useStockInStore((state) => state.stockIns)
  const selectedStockIn = useStockInStore((state) => state.selectedStockIn)
  const products = useStockInStore((state) => state.products)
  const suppliers = useStockInStore((state) => state.suppliers)
  const isLoading = useStockInStore((state) => state.isLoading)
  const fetchStockIns = useStockInStore((state) => state.fetchStockIns)
  const fetchStockInById = useStockInStore((state) => state.fetchStockInById)
  const createStockIn = useStockInStore((state) => state.createStockIn)
  const updateStockIn = useStockInStore((state) => state.updateStockIn)
  const deleteStockIn = useStockInStore((state) => state.deleteStockIn)
  const fetchReferenceData = useStockInStore((state) => state.fetchReferenceData)
  const clearSelectedStockIn = useStockInStore((state) => state.clearSelectedStockIn)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [supplierId, setSupplierId] = useState('')
  const [details, setDetails] = useState<StockInDetailInput[]>([emptyDetail()])

  const table = useClientTable<StockIn>({
    data: stockIns,
    pageSize: 10,
    searchFn: (slip, keyword) => {
      const slipCode = slip.id.slice(0, 8).toLowerCase()
      const supplierName = slip.supplier?.name?.toLowerCase() ?? ''
      return slipCode.includes(keyword) || supplierName.includes(keyword)
    },
  })

  useEffect(() => {
    void Promise.all([fetchStockIns(), fetchReferenceData()])
  }, [fetchStockIns, fetchReferenceData])

  const resetForm = () => {
    setEditingId(null)
    setSupplierId('')
    setDetails([emptyDetail()])
  }

  const openCreateModal = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditModal = (stockIn: StockIn) => {
    setEditingId(stockIn.id)
    setSupplierId(stockIn.supplierId)
    setDetails(
      stockIn.details?.length
        ? stockIn.details.map((detail) => ({
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
          }))
        : [emptyDetail()],
    )
    setFormOpen(true)
  }

  const closeFormModal = () => {
    setFormOpen(false)
    resetForm()
  }

  const openDetailModal = async (id: string) => {
    await fetchStockInById(id)
  }

  const closeDetailModal = () => {
    clearSelectedStockIn()
  }

  const addDetail = () => setDetails((prev) => [...prev, emptyDetail()])

  const removeDetail = (index: number) => {
    setDetails((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const updateDetail = (index: number, field: keyof StockInDetailInput, value: string | number) => {
    setDetails((prev) => prev.map((detail, idx) => (idx === index ? { ...detail, [field]: value } : detail)))
  }

  const totalAmount = useMemo(
    () => details.reduce((sum, detail) => sum + detail.quantity * detail.price, 0),
    [details],
  )

  const submitForm = async (event: FormEvent) => {
    event.preventDefault()

    const payload = {
      supplierId,
      details,
    }

    if (editingId) {
      await updateStockIn(editingId, payload)
    } else {
      await createStockIn(payload)
    }

    closeFormModal()
  }

  const removeSlip = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu nhập này?')) return
    await deleteStockIn(id)
  }

  return {
    stockIns,
    selectedStockIn,
    products,
    suppliers,
    isLoading,
    formOpen,
    editingId,
    supplierId,
    details,
    totalAmount,
    table,
    setSupplierId,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDetailModal,
    closeDetailModal,
    addDetail,
    removeDetail,
    updateDetail,
    submitForm,
    removeSlip,
  }
}
