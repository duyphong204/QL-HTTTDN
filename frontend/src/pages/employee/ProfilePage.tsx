import { useEffect } from "react";
import { useEmployeeStore } from "@/stores/employee.store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/common/Loading";
import { Label } from "@/components/ui/label";
import { Mail, Briefcase, User, CreditCard, Camera } from "lucide-react";

export default function ProfilePage() {
  const {
    myProfile,
    isLoadingProfile,
    isEditing,
    formData,
    fetchMyProfile,
    updateMyProfile,
    handleEdit,
    handleCancel,
    setFormData,
  } = useEmployeeStore();

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  if (isLoadingProfile && !myProfile) {
    return <PageLoading text="Đang tải hồ sơ nhân viên..." />;
  }

  const profile = myProfile?.user.profile;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateMyProfile({
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <User size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Hồ sơ cá nhân
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Thông tin chi tiết và quyền hạn của bạn trong hệ thống
              </p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Chỉnh sửa thông tin
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isLoadingProfile}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-95"
              >
                {isLoadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick View */}
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-4 transition-transform group-hover:scale-105 border-4 border-white">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      profile?.fullName?.charAt(0) || "U"
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg border border-gray-100 text-blue-600">
                      <Camera size={18} />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-black text-gray-900 mt-2">
                  {profile?.fullName}
                </h2>
                <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider border border-blue-100 shadow-sm">
                  {myProfile?.user.role || "Nhân viên"}
                </span>

                <div className="w-full mt-8 space-y-4 px-4 bg-gray-50/50 py-4 rounded-2xl border border-gray-100/50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-blue-500 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate font-medium">{myProfile?.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-blue-500 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{myProfile?.position || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative rounded-2xl">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-10">
                <CreditCard className="w-32 h-32" />
              </div>
              <CardContent className="pt-6 relative z-10">
                <p className="text-blue-100 text-[11px] font-bold uppercase tracking-wider opacity-90">
                  Mức lương cơ bản
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight">
                    {myProfile?.baseSalary?.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold opacity-80 uppercase">VNĐ</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl">
              <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/30 rounded-t-2xl">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800 uppercase tracking-wider">
                  <User className="w-5 h-5 text-blue-600" /> Thông tin cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoBlock
                    label="Họ và tên"
                    isEditing={isEditing}
                    input={
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    }
                    value={profile?.fullName || "Chưa cập nhật"}
                  />
                  <InfoBlock
                    label="Ngày sinh"
                    isEditing={isEditing}
                    input={
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    }
                    value={
                      profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString(
                            "vi-VN",
                          )
                        : "Chưa cập nhật"
                    }
                  />
                  <InfoBlock
                    label="Số điện thoại"
                    isEditing={isEditing}
                    input={
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="090..."
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    }
                    value={profile?.phone || "Chưa cập nhật"}
                  />
                  <InfoBlock
                    label="Địa chỉ"
                    isEditing={isEditing}
                    input={
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      />
                    }
                    value={profile?.address || "Chưa cập nhật"}
                  />
                </div>

                {isEditing && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Link ảnh đại diện (URL)
                    </Label>
                    <input
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl">
              <CardHeader className="border-b border-gray-50 pb-4 bg-gray-50/30 rounded-t-2xl">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800 uppercase tracking-wider">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Thông tin công việc
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <InfoBlock label="Mã nhân sự" value={myProfile?.code} bold isCode />
                  <InfoBlock label="Phòng ban" value={myProfile?.department} />
                  <InfoBlock label="Chức vụ" value={myProfile?.position} />
                  <InfoBlock
                    label="Ngày gia nhập"
                    value={
                      myProfile?.joinDate
                        ? new Date(myProfile.joinDate).toLocaleDateString("vi-VN")
                        : "—"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  isEditing,
  input,
  bold,
  isCode,
}: {
  label: string;
  value?: string;
  isEditing?: boolean;
  input?: React.ReactNode;
  bold?: boolean;
  isCode?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
        {label}
      </Label>
      {isEditing && input ? (
        input
      ) : (
        <div className={`h-11 flex items-center px-4 bg-gray-50 border border-transparent rounded-xl ${isCode ? "font-mono" : ""}`}>
          <p
            className={`text-gray-900 ${bold ? "font-bold text-blue-700" : "font-medium"} truncate`}
          >
            {value || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
