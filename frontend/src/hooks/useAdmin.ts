import { useAdminStore } from "@/stores/admin.store";

export const useAdmin = () => {
    const {
        report,
        isLoading,
        error,
        fetchDashboardReport,
    } = useAdminStore();

    const handleFetchDashboardReport = async (params?: { year?: number; month?: number }) => {
        await fetchDashboardReport(params);
    };

    return {
        report,
        isLoading,
        error,
        handleFetchDashboardReport,
    };
};
