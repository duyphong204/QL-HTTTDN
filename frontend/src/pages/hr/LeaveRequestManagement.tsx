import { useEffect } from "react";
import { useLeaveRequestStore } from "@/store/leaveRequest.store";
import dayjs from "dayjs";

export default function LeaveRequestManagement() {
    const leaveRequests       = useLeaveRequestStore((s) => s.leaveRequests);
    const loading             = useLeaveRequestStore((s) => s.loading);
    const fetchLeaveRequests  = useLeaveRequestStore((s) => s.fetchLeaveRequests);
    const approveLeaveRequest = useLeaveRequestStore((s) => s.approveLeaveRequest);

    useEffect(() => {
        void fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        const msg = status === "APPROVED" ? "Xác nhận DUYỆT đơn này?" : "Xác nhận TỪ CHỐI đơn này?";
        if (!confirm(msg)) return;
        await approveLeaveRequest(id, status);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm border border-green-200">Đã Duyệt</span>;
            case 'REJECTED': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm border border-red-200">Từ Chối</span>;
            default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-sm border border-yellow-200">Chờ Duyệt</span>;
        }
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'SICK': 'Nghỉ Ốm',
            'ANNUAL': 'Nghỉ Phép Tuần/Năm',
            'MATERNITY': 'Nghỉ Thai Sản',
            'RESIGNATION': 'Xin Nghỉ Việc',
        };
        return types[type] || type;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Duyệt Đơn Nghỉ Phép / Nghỉ Việc</h1>
                <button onClick={() => void fetchLeaveRequests()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition">
                    Làm mới dữ liệu
                </button>
            </div>

            {loading ? (
                <div className="text-center p-10 text-gray-500">Đang tải dữ liệu...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-4 font-medium text-gray-600">Nhân viên</th>
                                    <th className="p-4 font-medium text-gray-600">Loại đơn</th>
                                    <th className="p-4 font-medium text-gray-600">Thời gian nghỉ</th>
                                    <th className="p-4 font-medium text-gray-600">Lý do</th>
                                    <th className="p-4 font-medium text-gray-600">Trạng thái</th>
                                    <th className="p-4 font-medium text-gray-600 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map((req) => (
                                    <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium">
                                            {req.employee?.user?.profile?.fullName || req.employee?.code || 'N/A'}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-700">
                                            {getTypeLabel(req.type)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {dayjs(req.startDate).format('DD/MM/YYYY')} - {dayjs(req.endDate).format('DD/MM/YYYY')}
                                        </td>
                                        <td className="p-4 truncate max-w-xs" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {req.status === 'PENDING' ? (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => void handleUpdateStatus(req.id, 'APPROVED')}
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm shadow-sm"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => void handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm shadow-sm"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {leaveRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            Không có đơn xin phép nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
