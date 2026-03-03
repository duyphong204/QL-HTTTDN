import { useEffect, useState } from "react";
import { useSupplierStore } from "@/store/supplier.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSupplierSchema, type CreateSupplierValues } from "@/schemas/supplier.schema";

const SupplierManagement = () => {
    // const { suppliers, isLoading, actions } = useSupplierStore();
    const suppliers = useSupplierStore((state) => state.suppliers);
    const isLoading = useSupplierStore((state) => state.isLoading);
    const actions = useSupplierStore((state) => state.actions);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(CreateSupplierSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    });

    useEffect(() => {
        actions.fetchSuppliers();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        actions.setFilters({ search: e.target.value });
    };

    const handleAddSupplier = () => {
        setEditingSupplier(null);
        reset({
            name: "",
            email: "",
            phone: "",
            address: "",
        });
        setIsModalOpen(true);
    };

    const handleEditSupplier = (supplier: any) => {
        setEditingSupplier(supplier);
        setValue("name", supplier.name);
        setValue("email", supplier.email);
        setValue("phone", supplier.phone);
        setValue("address", supplier.address);
        setIsModalOpen(true);
    };

    const handleDeleteSupplier = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
            await actions.deleteSupplier(id);
        }
    };

    const onSubmit = async (data: CreateSupplierValues) => {
        try {
            if (editingSupplier) {
                await actions.updateSupplier(editingSupplier.id, data);
            } else {
                await actions.addSupplier(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản lý Nhà cung cấp</h2>
                    <p className="text-muted-foreground mt-1">
                        Quản lý thông tin nhà cung cấp
                    </p>
                </div>
                <Button onClick={handleAddSupplier} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Thêm NCC
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm nhà cung cấp..."
                            className="pl-8 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-bold text-gray-700">Tên NCC</TableHead>
                                {/* <TableHead className="font-bold text-gray-700">Người liên hệ</TableHead> */}
                                <TableHead className="font-bold text-gray-700">Điện thoại</TableHead>
                                <TableHead className="font-bold text-gray-700">Email</TableHead>
                                <TableHead className="font-bold text-gray-700">Địa chỉ</TableHead>
                                <TableHead className="text-right font-bold text-gray-700">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : suppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Không tìm thấy nhà cung cấp nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier) => (
                                    <TableRow key={supplier.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>{supplier.contactPerson}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.email}</TableCell>
                                        <TableCell>{supplier.address}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)} className="h-8 w-8 text-gray-600 hover:text-blue-600">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier.id)} className="h-8 w-8 text-gray-600 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Sửa thông tin Nhà cung cấp" : "Thêm Nhà cung cấp mới"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên NCC</Label>
                                <Input id="name" {...register("name")} disabled={!!editingSupplier} />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message as string}</span>}
                            </div>

                            {/* <div className="space-y-2">
                                <Label htmlFor="contactPerson">Người liên hệ</Label>
                                <Input id="contactPerson" {...register("contactPerson")} />
                                {errors.contactPerson && <span className="text-red-500 text-sm">{errors.contactPerson.message as string}</span>}
                            </div> */}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email")} />
                                {errors.email && <span className="text-red-500 text-sm">{errors.email.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input id="phone" {...register("phone")} />
                                {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message as string}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input id="address" {...register("address")} />
                            {errors.address && <span className="text-red-500 text-sm">{errors.address.message as string}</span>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                {editingSupplier ? "Lưu thay đổi" : "Tạo mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SupplierManagement;
