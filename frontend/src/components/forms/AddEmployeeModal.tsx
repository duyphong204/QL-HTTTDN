import { useState } from "react";
import { X } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
}: AddEmployeeModalProps) {
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "baseSalary" ? Number(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Họ tên là bắt buộc";
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.joinDate) newErrors.joinDate = "Ngày vào làm là bắt buộc";
    if (!formData.position) newErrors.position = "Chức vụ là bắt buộc";
    if (!formData.department) newErrors.department = "Phòng ban là bắt buộc";
    if (formData.baseSalary <= 0)
      newErrors.baseSalary = "Lương cơ bản phải lớn hơn 0";
    if (!formData.address) newErrors.address = "Địa chỉ là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-xl font-bold text-gray-900">
              Thêm Nhân sự mới
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Nhập đầy đủ thông tin nhân viên
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nội dung Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 space-y-5 overflow-y-auto max-h-[80vh]"
        >
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
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
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
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
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
              {errors.joinDate && (
                <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>
              )}
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
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
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
                <option value="" disabled>
                  Chọn phòng ban
                </option>
                <option value="Nhân sự">Nhân sự</option>
                <option value="Kho">Kho</option>
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Kỹ thuật">Kỹ thuật</option>
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
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
              {errors.baseSalary && (
                <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>
              )}
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
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-4 bg-[#0a0f1c] hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? "Đang thêm..." : "Thêm Nhân sự"}
          </button>
        </form>
      </div>
    </div>
  );
}
