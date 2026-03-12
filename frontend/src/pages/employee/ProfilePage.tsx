import { useEffect, useState } from "react"
import { useEmployeeStore } from "@/store/employee.store"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const { myProfile, fetchMyProfile, updateMyProfile, isLoadingProfile } =
    useEmployeeStore()

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  })

  // load profile
  useEffect(() => {
    fetchMyProfile()
  }, [fetchMyProfile])

  const handleEdit = () => {
    const profile = myProfile?.user.profile

    setFormData({
      fullName: profile?.fullName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      dateOfBirth: profile?.dateOfBirth
        ? profile.dateOfBirth.slice(0, 10)
        : "",
    })

    setIsEditing(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : undefined,
    }

    await updateMyProfile(payload)

    setIsEditing(false)
  }

  if (isLoadingProfile) {
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải thông tin...
      </div>
    )
  }

  const profile = myProfile?.user.profile

  return (
    <div className="max-w-5xl mx-auto p-8">

      <Card>

        {/* Header */}

        <CardHeader className="flex flex-row items-center justify-between">

          <div>
            <CardTitle className="text-2xl">
              Hồ sơ của tôi
            </CardTitle>

            <p className="text-sm text-gray-500">
              Quản lý thông tin cá nhân
            </p>
          </div>

          {!isEditing && (
            <Button onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          )}

        </CardHeader>

        <CardContent className="space-y-8">

          {/* Avatar */}

          <div className="flex items-center gap-5">

            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
              {profile?.fullName?.charAt(0) || "U"}
            </div>

            <div>

              <h2 className="text-lg font-semibold">
                {profile?.fullName}
              </h2>

              <p className="text-gray-500">
                {myProfile?.user.email}
              </p>

              <p className="text-sm text-gray-400">
                Mã nhân viên: {myProfile?.code}
              </p>

            </div>

          </div>

          {/* Personal Info */}

          <div className="grid grid-cols-2 gap-6">

            <div>

              <Label>Họ tên</Label>

              {isEditing ? (
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">{profile?.fullName}</p>
              )}

            </div>

            <div>

              <Label>Số điện thoại</Label>

              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">
                  {profile?.phone || "Chưa cập nhật"}
                </p>
              )}

            </div>

            <div>

              <Label>Địa chỉ</Label>

              {isEditing ? (
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">
                  {profile?.address || "Chưa cập nhật"}
                </p>
              )}

            </div>

            <div>

              <Label>Ngày sinh</Label>

              {isEditing ? (
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">
                  {profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "Chưa cập nhật"}
                </p>
              )}

            </div>

          </div>

          {/* Work Info */}

          <div className="grid grid-cols-3 gap-6 border-t pt-6">

            <div>

              <Label>Phòng ban</Label>

              <p className="mt-1">
                {myProfile?.department || "Chưa cập nhật"}
              </p>

            </div>

            <div>

              <Label>Chức vụ</Label>

              <p className="mt-1">
                {myProfile?.position || "Chưa cập nhật"}
              </p>

            </div>

            <div>

              <Label>Ngày vào làm</Label>

              <p className="mt-1">
                {myProfile?.joinDate
                  ? new Date(myProfile.joinDate).toLocaleDateString()
                  : ""}
              </p>

            </div>

          </div>

          {/* Salary */}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">

            <p className="text-sm text-green-600">
              Lương cơ bản
            </p>

            <p className="text-2xl font-bold text-green-700">
              {myProfile?.baseSalary?.toLocaleString()} VNĐ
            </p>

          </div>

          {/* Buttons */}

          {isEditing && (

            <div className="flex justify-end gap-3">

              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </Button>

              <Button onClick={handleSave}>
                Lưu thay đổi
              </Button>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  )
}