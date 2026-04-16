import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useClientTable } from '@/hooks/useClientTable'
import { useConfirmAction } from '@/hooks/useConfirmAction'
import { useStockInStore } from '@/stores/stockIn.store'
import { useWarehouseReferenceStore } from '@/stores/warehouseReference.store'
import { stockInService, productService, supplierService } from '@/services/warehouse.service'
import { getErrorMessage } from '@/stores/store.helpers'
import type { StockIn, StockInDetailInput } from '@/types/stockIn.types'

const emptyDetail = (): StockInDetailInput => ({ productId: '', quantity: 1, price: 0 })

export const useImportSlipPage = () => {
  const stockIns = useStockInStore((state) => state.stockIns)
  const selectedStockIn = useStockInStore((state) => state.selectedStockIn)
  const products = useWarehouseReferenceStore((state) => state.products)
  const suppliers = useWarehouseReferenceStore((state) => state.suppliers)
  const isLoading = useStockInStore((state) => state.isLoading)
  const setStockIns = useStockInStore((state) => state.setStockIns)
  const setSelectedStockIn = useStockInStore((state) => state.setSelectedStockIn)
  const setProducts = useWarehouseReferenceStore((state) => state.setProducts)
  const setSuppliers = useWarehouseReferenceStore((state) => state.setSuppliers)
  const setLoading = useStockInStore((state) => state.setLoading)
  const setLoadingDetail = useStockInStore((state) => state.setLoadingDetail)
  const setError = useStockInStore((state) => state.setError)
  const clearSelectedStockIn = useStockInStore((state) => state.clearSelectedStockIn)
  const { confirmAndRun } = useConfirmAction()

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

  const fetchStockIns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await stockInService.getStockIns()
      setStockIns(data)
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [setError, setLoading, setStockIns])

  const fetchStockInById = useCallback(
    async (id: string) => {
      setLoadingDetail(true)
      try {
        const data = await stockInService.getStockInById(id)
        setSelectedStockIn(data)
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        toast.error(message)
      } finally {
        setLoadingDetail(false)
      }
    },
    [setLoadingDetail, setSelectedStockIn],
  )

  const fetchReferenceData = useCallback(async () => {
    try {
      const [productResponse, supplierResponse] = await Promise.all([
        productService.getProducts(),
        supplierService.getSuppliers(),
      ])
      setProducts(productResponse.data)
      setSuppliers(supplierResponse.data)
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      toast.error(message)
    }
  }, [setProducts, setSuppliers])

  const createStockIn = useCallback(
    async (payload: { supplierId: string; details: StockInDetailInput[] }) => {
      try {
        const newStockIn = await stockInService.createStockIn(payload)
        setStockIns([newStockIn, ...stockIns])
        toast.success('Tạo phiếu nhập thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        setError(message)
        toast.error(message)
        throw error
      }
    },
    [setError, setStockIns, stockIns],
  )

  const updateStockIn = useCallback(
    async (id: string, payload: { supplierId: string; details: StockInDetailInput[] }) => {
      try {
        const updated = await stockInService.updateStockIn(id, payload)
        setStockIns(stockIns.map((s) => (s.id === id ? updated : s)))
        toast.success('Cập nhật phiếu nhập thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        setError(message)
        toast.error(message)
        throw error
      }
    },
    [setError, setStockIns, stockIns],
  )

  const deleteStockIn = useCallback(
    async (id: string) => {
      try {
        await stockInService.deleteStockIn(id)
        setStockIns(stockIns.filter((s) => s.id !== id))
        toast.success('Xóa phiếu nhập thành công')
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        setError(message)
        toast.error(message)
      }
    },
    [setError, setStockIns, stockIns],
  )

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
    await confirmAndRun({
      message: 'Bạn có chắc muốn xóa phiếu nhập này?',
      action: () => deleteStockIn(id),
    })
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
