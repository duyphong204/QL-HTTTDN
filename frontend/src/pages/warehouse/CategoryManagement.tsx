import { Plus, Pencil, Trash2, Tag, Layers } from "lucide-react";
import { AppModal } from "@/components/common/AppModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { TableLoadingRow } from "@/components/common/Loading";
import { PaginationControls } from "@/components/common/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryPage } from "@/hooks/useCategoryPage";

export default function CategoryManagement() {
    const {
        isLoading,
        modalOpen,
        editingCategory,
        name,
        searchTerm,
        page,
        pagedData,
        meta,
        setSearchTerm,
        setPage,
        openCreateModal,
        openEditModal,
        closeModal,
        handleNameChange,
        handleFormSubmit,
        handleDelete,
    } = useCategoryPage();

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header - Khớp 100% với ProductManagement */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh mục sản phẩm</h1>
                            <p className="text-sm text-gray-500 mt-1">Quản lý các nhóm ngành hàng trong hệ thống</p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm h-11"
                    >
                        <Plus size={18} /> Thêm danh mục
                    </Button>
                </div>

                {/* Table Container - Khớp 100% với ProductManagement */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">

                    <DataTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={setSearchTerm}
                        searchPlaceholder="Tìm theo tên danh mục..."
                    />

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Thông tin danh mục</th>
                                    <th className="px-6 py-4 text-center">Số lượng sản phẩm</th>
                                    <th className="px-6 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <TableLoadingRow colSpan={3} text="Đang tải dữ liệu..." />
                                ) : pagedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                                            Không tìm thấy danh mục nào.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedData.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Tag size={18} className="text-gray-400" />
                                                    </div>
                                                    <span className="font-medium text-gray-800">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                                                    {(cat as any)._count?.products || 0} sản phẩm
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(cat)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id, cat.name)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <PaginationControls
                        meta={meta}
                        currentPage={page}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Form Modal */}
            <AppModal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingCategory ? "Cập nhật danh mục" : "Thêm mới danh mục"}
                subtitle="Vui lòng nhập tên danh mục duy nhất để phân loại sản phẩm"
            >
                <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Tên danh mục *</label>
                        <Input
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="VD: Gia dụng, Điện tử..."
                            className="h-11 focus:ring-blue-500/20"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 px-8 hover:bg-blue-700 h-11 text-white"
                            disabled={isLoading}
                        >
                            {editingCategory ? "Cập nhật" : "Lưu dữ liệu"}
                        </Button>
                    </div>
                </form>
            </AppModal>
        </div>
    );
}
