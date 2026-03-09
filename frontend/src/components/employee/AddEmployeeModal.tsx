import { useState } from "react";
import { X } from "lucide-react";

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: any) => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        joinDate: "",
        position: "",
        department: "",
        baseSalary: 0,
        status: "ACTIVE",
        address: "",
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClass =
        "w-full h-10 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Lớp nền mờ */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Box chính của Form */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                {/* Header Modal */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Thêm Nhân sự mới</h2>
                        <p className="text-sm text-gray-500 mt-1">Nhập đầy đủ thông tin nhân viên</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nội dung Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Họ tên */}
                        <div>
                            <label className={labelClass}>Họ tên</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Nguyễn Văn A"
                                className={inputClass}
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelClass}>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="email@example.com"
                                className={inputClass}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className={labelClass}>Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="0912345678"
                                className={inputClass}
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Ngày vào làm */}
                        <div>
                            <label className={labelClass}>Ngày vào làm</label>
                            <input
                                type="date"
                                name="joinDate"
                                className={inputClass}
                                value={formData.joinDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Chức vụ */}
                        <div>
                            <label className={labelClass}>Chức vụ</label>
                            <input
                                type="text"
                                name="position"
                                placeholder="Nhân viên"
                                className={inputClass}
                                value={formData.position}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Phòng ban */}
                        <div>
                            <label className={labelClass}>Phòng ban</label>
                            <select
                                name="department"
                                className={inputClass}
                                value={formData.department}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Chọn phòng ban</option>
                                <option value="Nhân sự">Nhân sự</option>
                                <option value="Kho">Kho</option>
                                <option value="Kinh doanh">Kinh doanh</option>
                                <option value="Kỹ thuật">Kỹ thuật</option>
                            </select>
                        </div>

                        {/* Lương */}
                        <div>
                            <label className={labelClass}>Lương (VND)</label>
                            <input
                                type="number"
                                name="baseSalary"
                                placeholder="0"
                                className={inputClass}
                                value={formData.baseSalary}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className={labelClass}>Trạng thái</label>
                            <select
                                name="status"
                                className={inputClass}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="ACTIVE">Đang làm việc</option>
                                <option value="INACTIVE">Đã nghỉ việc</option>
                            </select>
                        </div>
                    </div>

                    {/* Địa chỉ - Full width */}
                    <div>
                        <label className={labelClass}>Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="123 Đường ABC, Quận 1, TP.HCM"
                            className={inputClass}
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full h-11 mt-4 bg-[#0a0f1c] hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center"
                    >
                        Thêm Nhân sự
                    </button>
                </form>
            </div>
        </div>
    );
}
