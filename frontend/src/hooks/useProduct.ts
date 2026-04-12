import { useProductStore } from "@/stores/product.store";

/** Hook mỏng bọc Zustand sản phẩm — đồng bộ với pattern useCategory / useEmployee. */
export const useProduct = () => {
    const store = useProductStore();
    return {
        products: store.products,
        meta: store.meta,
        filters: store.filters,
        report: store.report,
        categories: store.categories,
        suppliers: store.suppliers,
        isLoading: store.isLoading,
        isLoadingReport: store.isLoadingReport,
        fetchProducts: store.fetchProducts,
        fetchReport: store.fetchReport,
        setFilters: store.setFilters,
        createProduct: store.createProduct,
        updateProduct: store.updateProduct,
        deleteProduct: store.deleteProduct,
        fetchCategories: store.fetchCategories,
        fetchSuppliers: store.fetchSuppliers,
    };
};
