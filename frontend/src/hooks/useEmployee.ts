import { useEmployeeStore } from "@/stores/employee.store";
import type { CreateLeaveRequestDto } from "@/types/hr.type";
import type { UpdateMyProfileDto } from "@/types/employee.type";

export const useEmployee = () => {
    const {
        myProfile,
        mySalaries,
        myLeaveRequests,
        isLoadingProfile,
        isLoadingSalary,
        isLoadingLeave,
        fetchMyProfile,
        updateMyProfile,
        fetchMySalaries,
        fetchMyLeaveRequests,
        createLeaveRequest,
        deleteLeaveRequest,
    } = useEmployeeStore();

    const handleFetchMyProfile = async () => {
        await fetchMyProfile();
    };

    const handleUpdateMyProfile = async (data: UpdateMyProfileDto) => {
        await updateMyProfile(data);
    };

    const handleFetchMySalaries = async (params?: { month?: number; year?: number }) => {
        await fetchMySalaries(params);
    };

    const handleFetchMyLeaveRequests = async () => {
        await fetchMyLeaveRequests();
    };

    const handleCreateLeaveRequest = async (data: CreateLeaveRequestDto) => {
        await createLeaveRequest(data);
    };

    const handleDeleteLeaveRequest = async (id: string) => {
        await deleteLeaveRequest(id);
    };

    return {
        myProfile,
        mySalaries,
        myLeaveRequests,
        isLoadingProfile,
        isLoadingSalary,
        isLoadingLeave,
        handleFetchMyProfile,
        handleUpdateMyProfile,
        handleFetchMySalaries,
        handleFetchMyLeaveRequests,
        handleCreateLeaveRequest,
        handleDeleteLeaveRequest,
    };
};
