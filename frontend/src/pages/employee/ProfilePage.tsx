import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { employeeApi } from "@/api/hr.api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Pencil, Save, X, Phone, MapPin, Calendar, Mail, Building, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        employeeApi.getMyProfile().then(data => {
            setProfile(data);
            const profileData = { ...data?.user?.profile };
            if (profileData?.dateOfBirth) {
                profileData.dateOfBirth = profileData.dateOfBirth.split('T')[0];
            }
            reset(profileData);
            setLoading(false);
        }).catch(() => {
            toast.error("Không thể tải thông tin hồ sơ!");
            setLoading(false);
        });
    }, [reset]);

    const onSubmit = async (data: any) => {
        try {
            await employeeApi.updateMyProfile(data);
            toast.success("Cập nhật hồ sơ thành công!");
            setEditing(false);
            const updated = await employeeApi.getMyProfile();
            setProfile(updated);
        } catch {
            toast.error("Lỗi khi cập nhật hồ sơ!");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6 container mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hồ Sơ Cá Nhân</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý không gian làm việc và thông tin cá nhân của bạn</p>
                </div>
                {!editing && (
                    <Button onClick={() => setEditing(true)} className="gap-2 shadow-sm w-full sm:w-auto">
                        <Pencil className="h-4 w-4" /> Chỉnh sửa hồ sơ
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info Card */}
                <Card className="lg:col-span-1 shadow-sm border-gray-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground p-6 mb-2">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-inner backdrop-blur-sm">
                                {profile?.user?.profile?.fullName?.charAt(0) || <User className="h-10 w-10" />}
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold line-clamp-1">{profile?.user?.profile?.fullName || "Chưa cập nhật"}</h2>
                                <p className="text-primary-foreground/80 text-sm font-medium flex items-center justify-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {profile?.user?.email}
                                </p>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none shadow-sm transition-colors">
                                {profile?.position || "Nhân viên"}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                <Building className="h-4 w-4 text-primary" /> Thông tin công việc
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Mã nhân viên</span>
                                    <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{profile?.code}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Phòng ban</span>
                                    <span className="font-medium text-gray-900">{profile?.department || "---"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Chức vụ</span>
                                    <span className="font-medium text-gray-900">{profile?.position || "---"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Ngày vào làm</span>
                                    <span className="font-medium text-gray-900">
                                        {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString("vi-VN") : "---"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium">Mức lương cơ bản</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                                {profile?.baseSalary?.toLocaleString("vi-VN")} <span className="text-sm font-normal text-gray-500">VNĐ</span>
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Detailed Info Form */}
                <Card className="lg:col-span-2 shadow-sm border-gray-100">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {editing ? "Cập nhật thông tin chi tiết" : "Thông tin chi tiết"}
                        </h2>
                    </CardHeader>

                    <CardContent className="p-6">
                        {editing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input id="fullName" {...register("fullName")} className="pl-10" placeholder="Nhập họ và tên..." />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input id="phone" {...register("phone")} type="tel" className="pl-10" placeholder="Nhập số điện thoại..." />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Địa chỉ hiện tại</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input id="address" {...register("address")} className="pl-10" placeholder="Nhập địa chỉ đầy đủ..." />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <Input id="dateOfBirth" {...register("dateOfBirth")} type="date" className="pl-10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button type="submit" className="gap-2 flex-1 md:flex-none">
                                        <Save className="h-4 w-4" /> Lưu thay đổi
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => {
                                        setEditing(false);
                                        const profileData = { ...profile?.user?.profile };
                                        if (profileData?.dateOfBirth) {
                                            profileData.dateOfBirth = profileData.dateOfBirth.split('T')[0];
                                        }
                                        reset(profileData);
                                    }} className="gap-2 flex-1 md:flex-none">
                                        <X className="h-4 w-4" /> Huỷ bỏ
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <User className="h-4 w-4" /> Họ và tên
                                    </div>
                                    <p className="font-medium text-gray-900 border-b border-gray-100 pb-2">
                                        {profile?.user?.profile?.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Phone className="h-4 w-4" /> Số điện thoại
                                    </div>
                                    <p className="font-medium text-gray-900 border-b border-gray-100 pb-2">
                                        {profile?.user?.profile?.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Calendar className="h-4 w-4" /> Ngày sinh
                                    </div>
                                    <p className="font-medium text-gray-900 border-b border-gray-100 pb-2">
                                        {profile?.user?.profile?.dateOfBirth ?
                                            new Date(profile.user.profile.dateOfBirth).toLocaleDateString("vi-VN") :
                                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                                        }
                                    </p>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <MapPin className="h-4 w-4" /> Địa chỉ hiện tại
                                    </div>
                                    <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {profile?.user?.profile?.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
