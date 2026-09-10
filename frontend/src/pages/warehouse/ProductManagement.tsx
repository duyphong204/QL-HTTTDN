import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Layers,
  TrendingUp,
  EyeOff,
} from "lucide-react";
import { getCloudinaryThumbnailUrl } from "@/utils/cloudinary";
import { ProductFormModal } from "@/components/forms/ProductFormModal";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { PaginationControls } from "@/components/common/PaginationControls";
import { TableLoadingRow } from "@/components/common/Loading";

import { useProductStore } from "@/stores/product.store";
import { useEntityModal } from "@/hooks/useEntityModal";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/product.types";

function ProductThumbnail({
  imageUrl,
  name,
}: {
  imageUrl?: string;
  name: string;
}) {
  const [errorUrl, setErrorUrl] = useState<string | null>(null);

  const hasError = errorUrl === imageUrl;

  if (!imageUrl || hasError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner">
        <Package size={18} className="text-gray-400" strokeWidth={2} />
      </div>
    );
  }

  const src = getCloudinaryThumbnailUrl(imageUrl, 80, 80);

  return (
    <img
      src={src}
      alt={name}
      className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 shadow-sm"
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== imageUrl) {
          e.currentTarget.src = imageUrl;
          return;
        }
        setErrorUrl(imageUrl);
      }}
    />
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  loading?: boolean;
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  valueColor = "text-gray-900",
  loading,
}: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4 transition-all hover:shadow-md hover:border-blue-100/50">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-gray-100 rounded-md animate-pulse mt-1" />
        ) : (
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
        )}
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const {
    products,
    isLoading,
    meta,
    stats,
    filters,
    categories,
    suppliers,
    setFilters,
    fetchProducts,
    fetchDependencies,
    fetchStats,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const {
    modalOpen,
    editingEntity,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEntityModal<Product>();
  const { confirmAndRun } = useConfirmAction();

  const { searchTerm, setSearchTerm, updateFilters, goToPage } =
    usePaginatedList({
      filters,
      setFilters,
      fetchData: fetchProducts,
      debounceMs: 400,
    });

  useEffect(() => {
    fetchProducts();
    fetchDependencies();
    fetchStats();
  }, [fetchProducts, fetchDependencies, fetchStats]);

  const handleFormSubmit = useCallback(async (
    data: CreateProductDto | UpdateProductDto,
  ) => {
    if (editingEntity) {
      await updateProduct(editingEntity.id, data as UpdateProductDto);
    } else {
      await createProduct(data as CreateProductDto);
    }
    fetchStats();
    closeModal();
  }, [editingEntity, updateProduct, createProduct, fetchStats, closeModal]);

  const handleDelete = useCallback(async (id: string, productName: string) => {
    void confirmAndRun({
      message: `Bạn có chắc muốn xoá sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
      action: async () => {
        await deleteProduct(id);
        fetchStats();
      },
    });
  }, [confirmAndRun, deleteProduct, fetchStats]);

  const statsLoading = stats === null;

  const renderTableBody = () => {
    if (isLoading) return <TableLoadingRow colSpan={7} text="Đang tải dữ liệu..." />;
    
    if (products.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-16 text-center text-gray-500 bg-gray-50/30">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📦</span>
              <p className="font-medium text-gray-600">Không tìm thấy sản phẩm nào.</p>
              <p className="text-sm">Hãy thử thêm sản phẩm mới hoặc thay đổi bộ lọc tìm kiếm.</p>
            </div>
          </td>
        </tr>
      );
    }

    return products.map((product) => (
      <tr
        key={product.id}
        className="group border-b border-gray-50 last:border-0 transition-colors hover:bg-blue-50/40"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <ProductThumbnail
              imageUrl={product.imageUrl}
              name={product.name}
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 line-clamp-2" title={product.name}>
                {product.name}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600 font-medium">
          {product.category?.name || "—"}
        </td>
        <td className="px-6 py-4 text-gray-600">
          {product.supplier?.name || "—"}
        </td>
        <td className="px-6 py-4 text-right">
          <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">
            {product.price.toLocaleString("vi-VN")}đ
          </span>
        </td>
        <td className="px-6 py-4 text-right text-gray-500">
          {product.costPrice.toLocaleString("vi-VN")}đ
        </td>
        <td className="px-6 py-4 text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
              product.stockQuantity <= (product.minStock ?? 10)
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {product.stockQuantity}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => openEditModal(product)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95"
              title="Sửa sản phẩm"
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDelete(product.id, product.name)}
              className="rounded-lg p-2 text-gray-500 bg-white shadow-sm border border-gray-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95"
              title="Xóa sản phẩm"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Package size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quản lý sản phẩm
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Thêm, sửa, xóa thông tin hàng hóa trong hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/30 active:translate-y-0 active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> 
            Thêm sản phẩm
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng sản phẩm"
            value={stats?.total ?? 0}
            icon={<Package size={22} className="text-blue-600" />}
            iconBg="bg-blue-50 border border-blue-100"
            valueColor="text-blue-700"
            loading={statsLoading}
          />
          <StatCard
            label="Tổng tồn kho"
            value={(stats?.totalStock ?? 0).toLocaleString("vi-VN")}
            icon={<Layers size={22} className="text-emerald-600" />}
            iconBg="bg-emerald-50 border border-emerald-100"
            valueColor="text-emerald-700"
            loading={statsLoading}
          />
          <StatCard
            label="Sản phẩm bán chạy"
            value={stats?.topSelling ?? 0}
            icon={<TrendingUp size={22} className="text-amber-500" />}
            iconBg="bg-amber-50 border border-amber-100"
            valueColor="text-amber-600"
            loading={statsLoading}
          />
          <StatCard
            label="Hết hàng"
            value={stats?.outOfStock ?? 0}
            icon={<EyeOff size={22} className="text-red-500" />}
            iconBg="bg-red-50 border border-red-100"
            valueColor={
              (stats?.outOfStock ?? 0) > 0 ? "text-red-600" : "text-gray-500"
            }
            loading={statsLoading}
          />
        </div>

        {/* Table Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 bg-white">
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Tìm theo tên sản phẩm..."
            >
              {/* Lọc danh mục */}
              <select
                value={filters.categoryId ?? ""}
                onChange={(e) => updateFilters({ categoryId: e.target.value })}
                className="h-10 min-w-[140px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Lọc nhà cung cấp */}
              <select
                value={filters.supplierId ?? ""}
                onChange={(e) => updateFilters({ supplierId: e.target.value })}
                className="h-10 min-w-[140px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="">Tất cả NCC</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Lọc tồn kho */}
              <select
                value={filters.inStock === undefined ? "" : String(filters.inStock)}
                onChange={(e) => {
                  const v = e.target.value;
                  updateFilters({ inStock: v === "" ? undefined : v === "true" });
                }}
                className="h-10 min-w-[120px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="">Tất cả tồn kho</option>
                <option value="true">Còn hàng</option>
                <option value="false">Hết hàng</option>
              </select>

              {/* Sắp xếp */}
              <select
                value={`${filters.sortBy ?? "name"}:${filters.sortOrder ?? "asc"}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(":") as [string, "asc" | "desc"];
                  updateFilters({ sortBy, sortOrder });
                }}
                className="h-10 min-w-[140px] px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow font-medium text-gray-700 cursor-pointer"
              >
                <option value="name:asc">Tên A → Z</option>
                <option value="name:desc">Tên Z → A</option>
                <option value="price:asc">Giá bán tăng dần</option>
                <option value="price:desc">Giá bán giảm dần</option>
                <option value="costPrice:asc">Giá nhập tăng dần</option>
                <option value="costPrice:desc">Giá nhập giảm dần</option>
                <option value="stockQuantity:desc">Tồn kho nhiều nhất</option>
                <option value="stockQuantity:asc">Tồn kho ít nhất</option>
              </select>
            </DataTableToolbar>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Sản phẩm</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Danh mục</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs">Nhà cung cấp</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Giá bán</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Giá nhập</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-center">Tồn kho</th>
                  <th className="px-6 py-4 uppercase tracking-wider text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50 bg-white">
                {renderTableBody()}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-white p-4">
            <PaginationControls
              meta={meta}
              currentPage={filters.page}
              isLoading={isLoading}
              onPageChange={goToPage}
            />
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingProduct={editingEntity}
        categories={categories}
        suppliers={suppliers}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
