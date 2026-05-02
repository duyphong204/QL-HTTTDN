import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useClientTable } from "@/hooks/useClientTable";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useStockOutStore } from "@/stores/stockOut.store";
import { useWarehouseReferenceStore } from "@/stores/warehouseReference.store";
import { stockOutService } from "@/services/sales.service";
import { productService } from "@/services/warehouse.service";
import { getErrorMessage } from "@/stores/store.helpers";
import {
  StockOutStatus,
  StockOutType,
  type CreateStockOutDto,
  type StockOut,
  type StockOutItemForm,
  type StockOutQuery,
  type UpdateStockOutDto,
} from "@/types/stockOut.types";

const emptyItem = (): StockOutItemForm => ({
  productId: "",
  quantity: 1,
  price: 0,
  _uid: Math.random().toString(36).slice(2),
});

export const useExportSlipPage = () => {
  const stockOuts = useStockOutStore((state) => state.stockOuts);
  const productOptions = useWarehouseReferenceStore((state) => state.products);
  const isLoading = useStockOutStore((state) => state.isLoading);
  const isLoadingProducts = useWarehouseReferenceStore(
    (state) => state.isLoadingProducts,
  );
  const isSubmitting = useStockOutStore((state) => state.isSubmitting);
  const setStockOuts = useStockOutStore((state) => state.setStockOuts);
  const setProductOptions = useWarehouseReferenceStore(
    (state) => state.setProducts,
  );
  const setLoading = useStockOutStore((state) => state.setLoading);
  const setLoadingProducts = useWarehouseReferenceStore(
    (state) => state.setLoadingProducts,
  );
  const setSubmitting = useStockOutStore((state) => state.setSubmitting);
  const setError = useStockOutStore((state) => state.setError);
  const { confirmAndRun } = useConfirmAction();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(
    null,
  );
  const [type, setType] = useState<keyof typeof StockOutType>("SALE");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [items, setItems] = useState<StockOutItemForm[]>([emptyItem()]);

  const query = useMemo<StockOutQuery>(
    () => ({
      ...(filterStatus
        ? { status: filterStatus as keyof typeof StockOutStatus }
        : {}),
      ...(filterType ? { type: filterType as keyof typeof StockOutType } : {}),
    }),
    [filterStatus, filterType],
  );

  const searchFn = useCallback((stockOut: StockOut, keyword: string) => {
    const code = stockOut.id.slice(0, 8).toLowerCase();
    const status = stockOut.status.toLowerCase();
    const stockOutType = stockOut.type.toLowerCase();
    return (
      code.includes(keyword) ||
      status.includes(keyword) ||
      stockOutType.includes(keyword)
    );
  }, []);

  const table = useClientTable<StockOut>({
    data: stockOuts,
    pageSize: 10,
    searchFn,
  });

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError(null);
    try {
      const response = await productService.getProducts({
        page: 1,
        limit: 200,
        sortBy: "name",
        sortOrder: "asc",
      });
      setProductOptions(response.data);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      setLoadingProducts(false);
    }
  }, [setError, setLoadingProducts, setProductOptions]);

  const fetchStockOuts = useCallback(
    async (params: StockOutQuery) => {
      setLoading(true);
      setError(null);
      try {
        const data = await stockOutService.getStockOuts(params);
        setStockOuts(data);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setStockOuts],
  );

  const createStockOut = useCallback(
    async (payload: CreateStockOutDto) => {
      setSubmitting(true);
      setError(null);
      try {
        const newStockOut = await stockOutService.createStockOut(payload);
        setStockOuts([newStockOut, ...stockOuts]);
        toast.success("Tạo phiếu xuất thành công");
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [setError, setStockOuts, setSubmitting, stockOuts],
  );

  const updateStockOut = useCallback(
    async (id: string, payload: UpdateStockOutDto) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await stockOutService.updateStockOut(id, payload);
        setStockOuts(
          stockOuts.map((stockOut) =>
            stockOut.id === id ? updated : stockOut,
          ),
        );
        toast.success("Cập nhật phiếu xuất thành công");
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setStockOuts, stockOuts],
  );

  const deleteStockOut = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await stockOutService.deleteStockOut(id);
        setStockOuts(stockOuts.filter((stockOut) => stockOut.id !== id));
        toast.success("Xóa phiếu xuất thành công");
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setStockOuts, stockOuts],
  );

  const getStockOutById = useCallback(async (id: string) => {
    try {
      return await stockOutService.getStockOutById(id);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    void fetchStockOuts(query);
  }, [fetchStockOuts, query]);

  const resetForm = () => {
    setEditingId(null);
    setType("SALE");
    setItems([emptyItem()]);
  };

  const openCreateModal = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditModal = (stockOut: StockOut) => {
    setEditingId(stockOut.id);
    setType(stockOut.type);
    setItems(
      stockOut.details.length > 0
        ? stockOut.details.map((detail) => ({
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
            _uid: Math.random().toString(36).slice(2),
          }))
        : [emptyItem()],
    );
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    resetForm();
  };

  const openDetailModal = async (id: string) => {
    const detail = await getStockOutById(id);
    setSelectedStockOut(detail);
    setDetailOpen(true);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setSelectedStockOut(null);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index),
    );
  };

  const updateItem = (
    index: number,
    field: "productId" | "quantity" | "price",
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field !== "productId") return { ...item, [field]: value };

        const selected = productOptions.find((product) => product.id === value);
        return {
          ...item,
          productId: String(value),
          price: selected?.price ?? item.price,
        };
      }),
    );
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      type,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    if (editingId) {
      await updateStockOut(editingId, payload);
    } else {
      await createStockOut(payload);
    }

    closeFormModal();
  };

  const removeStockOut = async (id: string) => {
    await confirmAndRun({
      message: "Bạn có chắc muốn xóa phiếu xuất này?",
      action: () => deleteStockOut(id),
    });
  };

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
  };
};
