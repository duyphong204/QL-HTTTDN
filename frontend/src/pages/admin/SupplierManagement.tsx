import { useEffect, useState } from "react";
import { useSupplierStore } from "@/store/supplier.store";
import type { Supplier } from "@/types/warehouse.type";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CreateSupplierSchema,
  type CreateSupplierValues,
} from "@/schemas/supplier.schema";

const SupplierManagement = () => {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const isLoading = useSupplierStore((state) => state.isLoading);
  const actions = useSupplierStore((state) => state.actions);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierValues>({
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
  }, [actions]);

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

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);

    reset({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });

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

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold">Quản lý Nhà cung cấp</h2>

        <Button onClick={handleAddSupplier}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm NCC
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

        <Input
          placeholder="Tìm kiếm nhà cung cấp..."
          className="pl-8"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* TABLE */}
      <div className="rounded-xl border shadow-sm overflow-x-auto">
        <Table>

          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead>Tên NCC</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Địa chỉ</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Không có nhà cung cấp
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier, index) => (
                <TableRow
                  key={supplier.id}
                  className="hover:bg-gray-50 transition"
                >
                  <TableCell className="font-medium">
                    {index + 1}
                  </TableCell>

                  <TableCell className="font-medium">
                    {supplier.name}
                  </TableCell>

                  <TableCell>
                    {supplier.phone}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {supplier.email}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {supplier.address}
                  </TableCell>

                  <TableCell className="text-right space-x-2">

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier
                ? "Sửa nhà cung cấp"
                : "Thêm nhà cung cấp"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <Label>Tên NCC</Label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input {...register("email")} />
            </div>

            <div>
              <Label>Điện thoại</Label>
              <Input {...register("phone")} />
            </div>

            <div>
              <Label>Địa chỉ</Label>
              <Input {...register("address")} />
            </div>

            <DialogFooter>
              <Button type="submit">
                {editingSupplier ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SupplierManagement;