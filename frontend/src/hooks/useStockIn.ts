import { useStockInStore } from "@/stores/stockIn.store";
import type { CreateStockInDto } from "@/types/warehouse.type";

export const useStockIn = () => {
    const {
        stockIns,
        selectedStockIn,
        products,
        suppliers,
        isLoading,
        isLoadingDetail,
        error,
        fetchStockIns,
        fetchStockInById,
        createStockIn,
        updateStockIn,
        deleteStockIn,
        fetchProducts,
        fetchSuppliers,
    } = useStockInStore();

    const handleFetchStockIns = async (params?: { productId?: string; startDate?: string; endDate?: string }) => {
        await fetchStockIns(params);
    };

    const handleFetchStockInById = async (id: string) => {
        await fetchStockInById(id);
    };

    const handleCreateStockIn = async (data: CreateStockInDto) => {
        await createStockIn(data);
    };

    const handleUpdateStockIn = async (id: string, data: Partial<CreateStockInDto>) => {
        await updateStockIn(id, data);
    };

    const handleDeleteStockIn = async (id: string) => {
        await deleteStockIn(id);
    };

    const handleFetchProducts = async () => {
        await fetchProducts();
    };

    const handleFetchSuppliers = async () => {
        await fetchSuppliers();
    };

    return {
        stockIns,
        selectedStockIn,
        products,
        suppliers,
        isLoading,
        isLoadingDetail,
        error,
        handleFetchStockIns,
        handleFetchStockInById,
        handleCreateStockIn,
        handleUpdateStockIn,
        handleDeleteStockIn,
        handleFetchProducts,
        handleFetchSuppliers,
    };
};
