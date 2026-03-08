import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { employeeApi } from "@/api/hr.api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Pencil, Save, X } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        employeeApi.getMyProfile().then(data => {
            setProfile(data);
            reset(data?.user?.profile);
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

    if (loading) return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hồ Sơ Cá Nhân</h1>
                    <p className="text-sm text-gray-500">Thông tin của bạn trong hệ thống</p>
                </div>
                {!editing && (
                    <Button onClick={() => setEditing(true)} className="gap-2">
                        <Pencil className="h-4 w-4" /> Sửa thông tin
                    </Button>
                )}
            </div>

            {/* Thông tin nhân viên */}
            <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/40">
                            {profile?.user?.profile?.fullName?.charAt(0) || <User className="h-8 w-8" />}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{profile?.user?.profile?.fullName || "Chưa cập nhật"}</h2>
                            <p className="text-blue-100 text-sm">{profile?.user?.email}</p>
                            <Badge className="mt-1 bg-white/20 text-white border-white/30">{profile?.position || "Nhân viên"}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Mã nhân viên</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{profile?.code}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Phòng ban</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{profile?.department || "Chưa phân công"}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Lương cơ bản</span>
                            <span className="font-semibold text-green-700 mt-1 block">{profile?.baseSalary?.toLocaleString("vi-VN")} VNĐ</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Ngày vào làm</span>
                            <span className="font-semibold text-gray-800 mt-1 block">{profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString("vi-VN") : "N/A"}</span>
                        </div>
                    </div>

                    {/* Form chỉnh sửa */}
                    {editing && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
                            <h3 className="font-semibold text-gray-700">Chỉnh sửa thông tin cá nhân</h3>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                                <Input {...register("fullName")} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                                <Input {...register("phone")} type="tel" className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                                <Input {...register("address")} className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                                <Input {...register("dateOfBirth")} type="date" className="mt-1" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4" /> Lưu thay đổi
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditing(false)} className="gap-2">
                                    <X className="h-4 w-4" /> Huỷ
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
