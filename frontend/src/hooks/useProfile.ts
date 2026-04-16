import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useEmployeeStore } from "@/stores/employee.store"
import { employeeService } from "@/services/hr.service"
import { getErrorMessage } from "@/stores/store.helpers"

export const useProfile = () => {
  const { myProfile, isLoadingProfile, setMyProfile, setLoadingProfile } = useEmployeeStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
  })

  const fetchMyProfile = useCallback(async () => {
    setLoadingProfile(true)
    try {
      const data = await employeeService.getMyProfile()
      setMyProfile(data)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể tải thông tin hồ sơ!"))
    } finally {
      setLoadingProfile(false)
    }
  }, [setLoadingProfile, setMyProfile])

  const updateMyProfile = useCallback(
    async (data: {
      fullName?: string
      phone?: string
      address?: string
      avatar?: string
      dateOfBirth?: string
    }) => {
      setLoadingProfile(true)
      try {
        await employeeService.updateMyProfile(data)
        toast.success("Cập nhật hồ sơ thành công!")
        await fetchMyProfile()
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Lỗi khi cập nhật hồ sơ!"))
        throw error
      } finally {
        setLoadingProfile(false)
      }
    },
    [fetchMyProfile, setLoadingProfile],
  )

  useEffect(() => {
    void fetchMyProfile()
  }, [fetchMyProfile])

  const handleEdit = () => {
    const profile = myProfile?.user.profile
    setFormData({
      fullName: profile?.fullName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      avatar: profile?.avatar || "",
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    })
    setIsEditing(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    await updateMyProfile({
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return {
    // Data
    myProfile,
    isLoadingProfile,

    // State
    isEditing,
    formData,

    // Handlers
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
  }
}