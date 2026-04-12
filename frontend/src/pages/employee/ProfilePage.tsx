import { useProfileManagement } from "@/hooks/useProfileManagement"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Briefcase, User, CreditCard } from "lucide-react"

export default function ProfilePage() {
  const {
    myProfile,
    isLoadingProfile,
    isEditing,
    formData,
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
  } = useProfileManagement()

  if (isLoadingProfile) {
    return (
      <div className="flex h-100 items-center justify-center text-slate-500 font-medium">
        <div className="animate-pulse">Đang tải hồ sơ nhân viên...</div>
      </div>
    )
  }

  const profile = myProfile?.user.profile

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Thông tin chi tiết và quyền hạn của bạn trong hệ thống</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all">
            Chỉnh sửa thông tin
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Quick View */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-xl mb-4 transition-transform group-hover:scale-105">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    profile?.fullName?.charAt(0) || "U"
                  )}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800">{profile?.fullName}</h2>
              <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3">
                {myProfile?.user.role || "Nhân viên"}
              </Badge>

              <div className="w-full mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 px-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{myProfile?.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 px-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span>{myProfile?.position || "Chưa cập nhật"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-24 h-24" />
            </div>
            <CardContent className="pt-6">
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Mức lương cơ bản</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{myProfile?.baseSalary?.toLocaleString()}</span>
                <span className="text-sm font-medium opacity-80">VNĐ</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoBlock
                  label="Họ và tên"
                  isEditing={isEditing}
                  input={<Input name="fullName" value={formData.fullName} onChange={handleChange} />}
                  value={profile?.fullName || "Chưa cập nhật"} />
                <InfoBlock
                  label="Ngày sinh"
                  isEditing={isEditing}
                  input={<Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="focus:ring-blue-500" />}
                  value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                />
                <InfoBlock
                  label="Số điện thoại"
                  isEditing={isEditing}
                  input={<Input name="phone" value={formData.phone} onChange={handleChange} placeholder="090..." />}
                  value={profile?.phone || "Chưa cập nhật"}
                />
                <InfoBlock
                  label="Địa chỉ"
                  isEditing={isEditing}
                  input={<Input name="address" value={formData.address} onChange={handleChange} />}
                  value={profile?.address || "Chưa cập nhật"}
                />
              </div>

              {isEditing && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-slate-500">Link ảnh đại diện (URL)</Label>
                  <Input name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://..." />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Thông tin công việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <InfoBlock label="Mã nhân sự" value={myProfile?.code} bold />
                <InfoBlock label="Phòng ban" value={myProfile?.department} />
                <InfoBlock label="Chức vụ" value={myProfile?.position} />
                <InfoBlock label="Ngày gia nhập" value={myProfile?.joinDate ? new Date(myProfile.joinDate).toLocaleDateString('vi-VN') : "—"} />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

// Component phụ để render block thông tin gọn hơn
function InfoBlock({ label, value, isEditing, input, bold }: { label: string; value?: string; isEditing?: boolean; input?: React.ReactNode; bold?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</Label>
      {isEditing && input ? (
        input
      ) : (
        <p className={`text-slate-800 ${bold ? "font-bold text-blue-600" : "font-medium"}`}>
          {value || "—"}
        </p>
      )}
    </div>
  )
}
