import { useEffect, useState } from "react"
import { useEmployeeStore } from "@/stores/employee.store"

export const useProfile = () => {
  const { myProfile, fetchMyProfile, updateMyProfile, isLoadingProfile } = useEmployeeStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
  })

  useEffect(() => {
    fetchMyProfile()
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