import { useCategoryStore } from "@/stores/category.store";

export const useCategory = () => {
    const {
        categories,
        isLoading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategoryStore();

    const handleFetchCategories = async () => {
        await fetchCategories();
    };

    const handleCreateCategory = async (name: string) => {
        await createCategory(name);
    };

    const handleUpdateCategory = async (id: string, name: string) => {
        await updateCategory(id, name);
    };

    const handleDeleteCategory = async (id: string) => {
        await deleteCategory(id);
    };

    return {
        categories,
        isLoading,
        error,
        handleFetchCategories,
        handleCreateCategory,
        handleUpdateCategory,
        handleDeleteCategory,
    };
};
