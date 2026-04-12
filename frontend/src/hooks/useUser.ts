import { useUserStore } from "@/stores/user.store";
import type { CreateUserDto, UpdateUserDto } from "@/types/user.type";
import type { UserFilters } from "@/stores/user.store";

export const useUser = () => {
    const {
        users,
        meta,
        isLoading,
        error,
        filters,
        setFilters,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
    } = useUserStore();

    const handleFetchUsers = async () => {
        await fetchUsers();
    };

    const handleAddUser = async (data: CreateUserDto) => {
        await addUser(data);
    };

    const handleUpdateUser = async (id: string, data: UpdateUserDto) => {
        await updateUser(id, data);
    };

    const handleDeleteUser = async (id: string) => {
        await deleteUser(id);
    };

    const handleSetFilters = (newFilters: Partial<UserFilters>) => {
        setFilters(newFilters);
    };

    return {
        users,
        meta,
        isLoading,
        error,
        filters,
        handleFetchUsers,
        handleAddUser,
        handleUpdateUser,
        handleDeleteUser,
        handleSetFilters,
    };
};
