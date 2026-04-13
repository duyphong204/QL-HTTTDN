import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useClientTable } from '@/hooks/useClientTable'
import { useStockOutStore } from '@/stores/stockOut.store'
import {
  StockOutStatus,
  StockOutType,
  type StockOut,
  type StockOutItem,
  type StockOutQuery,
} from '@/types/sales.type'

const emptyItem = (): StockOutItem => ({ productId: '', quantity: 1, price: 0 })

export const useExportSlipPage = () => {
  const stockOuts = useStockOutStore((state) => state.stockOuts)
  const productOptions = useStockOutStore((state) => state.productOptions)
  const isLoading = useStockOutStore((state) => state.isLoading)
  const isLoadingProducts = useStockOutStore((state) => state.isLoadingProducts)
  const isSubmitting = useStockOutStore((state) => state.isSubmitting)
  const fetchStockOuts = useStockOutStore((state) => state.fetchStockOuts)
  const fetchProducts = useStockOutStore((state) => state.fetchProducts)
  const createStockOut = useStockOutStore((state) => state.createStockOut)
  const updateStockOut = useStockOutStore((state) => state.updateStockOut)
  const deleteStockOut = useStockOutStore((state) => state.deleteStockOut)
  const getStockOutById = useStockOutStore((state) => state.getStockOutById)

  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null)
  const [type, setType] = useState<keyof typeof StockOutType>('SALE')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [items, setItems] = useState<StockOutItem[]>([emptyItem()])

  const query = useMemo<StockOutQuery>(
    () => ({
      ...(filterStatus ? { status: filterStatus as keyof typeof StockOutStatus } : {}),
      ...(filterType ? { type: filterType as keyof typeof StockOutType } : {}),
    }),
    [filterStatus, filterType],
  )

  const table = useClientTable<StockOut>({
    data: stockOuts,
    pageSize: 10,
    searchFn: (stockOut, keyword) => {
      const code = stockOut.id.slice(0, 8).toLowerCase()
      const status = stockOut.status.toLowerCase()
      const stockOutType = stockOut.type.toLowerCase()
      return code.includes(keyword) || status.includes(keyword) || stockOutType.includes(keyword)
    },
  })

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    void fetchStockOuts(query)
  }, [fetchStockOuts, query])

  const resetForm = () => {
    setEditingId(null)
    setType('SALE')
    setItems([emptyItem()])
  }

  const openCreateModal = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditModal = (stockOut: StockOut) => {
    setEditingId(stockOut.id)
    setType(stockOut.type)
    setItems(
      stockOut.details.length > 0
        ? stockOut.details.map((detail) => ({
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
          }))
        : [emptyItem()],
    )
    setFormOpen(true)
  }

  const closeFormModal = () => {
    setFormOpen(false)
    resetForm()
  }

  const openDetailModal = async (id: string) => {
    const detail = await getStockOutById(id)
    setSelectedStockOut(detail)
    setDetailOpen(true)
  }

  const closeDetailModal = () => {
    setDetailOpen(false)
    setSelectedStockOut(null)
  }

  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const updateItem = (
    index: number,
    field: 'productId' | 'quantity' | 'price',
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item
        if (field !== 'productId') return { ...item, [field]: value }

        const selected = productOptions.find((product) => product.id === value)
        return {
          ...item,
          productId: String(value),
          price: selected?.price ?? item.price,
        }
      }),
    )
  }

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const submitForm = async (event: FormEvent) => {
    event.preventDefault()

    const payload = {
      type,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    }

    if (editingId) {
      await updateStockOut(editingId, payload)
    } else {
      await createStockOut(payload)
    }

    closeFormModal()
  }

  const removeStockOut = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu xuất này?')) return
    await deleteStockOut(id)
  }

  return {
    stockOuts,
    productOptions,
    isLoading,
    isLoadingProducts,
    isSubmitting,
    formOpen,
    detailOpen,
    editingId,
    selectedStockOut,
    type,
    filterStatus,
    filterType,
    items,
    totalAmount,
    table,
    setType,
    setFilterStatus,
    setFilterType,
    openCreateModal,
    openEditModal,
    closeFormModal,
    openDetailModal,
    closeDetailModal,
    addItem,
    removeItem,
    updateItem,
    submitForm,
    removeStockOut,
  }
}
