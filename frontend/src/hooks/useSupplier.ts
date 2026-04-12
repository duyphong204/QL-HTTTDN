import { useSupplierStore } from "@/stores/supplier.store";
import type { CreateSupplierDto, UpdateSupplierDto } from "@/types/warehouse.type";
import type { SupplierFilters } from "@/stores/supplier.store";

export const useSupplier = () => {
    const {
        suppliers,
        meta,
        filters,
        isLoading,
        error,
        setFilters,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
    } = useSupplierStore();

    const handleFetchSuppliers = async () => {
        await fetchSuppliers();
    };

    const handleCreateSupplier = async (data: CreateSupplierDto) => {
        await createSupplier(data);
    };

    const handleUpdateSupplier = async (id: string, data: UpdateSupplierDto) => {
        await updateSupplier(id, data);
    };

    const handleDeleteSupplier = async (id: string) => {
        await deleteSupplier(id);
    };

    const handleSetFilters = (newFilters: Partial<SupplierFilters>) => {
        setFilters(newFilters);
    };

    return {
        suppliers,
        meta,
        filters,
        isLoading,
        error,
        handleFetchSuppliers,
        handleCreateSupplier,
        handleUpdateSupplier,
        handleDeleteSupplier,
        handleSetFilters,
    };
};
