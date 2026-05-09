import { useEffect, useState } from "react";
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
  const [hasError, setHasError] = useState(false);
  const transformedUrl = getCloudinaryThumbnailUrl(imageUrl, 80, 80);
  const [src, setSrc] = useState<string>(transformedUrl);

  useEffect(() => {
    setHasError(false);
    setSrc(getCloudinaryThumbnailUrl(imageUrl, 80, 80));
  }, [imageUrl]);

  if (!imageUrl || hasError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Package size={18} className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200"
      loading="lazy"
      onError={() => {
        if (src !== imageUrl) {
          setSrc(imageUrl);
          return;
        }
        setHasError(true);
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
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className={`text-xl font-bold mt-0.5 ${valueColor}`}>{value}</p>
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
  }, []);

  const handleFormSubmit = async (
    data: CreateProductDto | UpdateProductDto,
  ) => {
    if (editingEntity) {
      await updateProduct(editingEntity.id, data as UpdateProductDto);
    } else {
      await createProduct(data as CreateProductDto);
    }
    fetchStats();
    closeModal();
  };

  const handleDelete = async (id: string, productName: string) => {
    await confirmAndRun({
      message: `Bạn có chắc muốn xoá sản phẩm "${productName}"?`,
      action: async () => {
        await deleteProduct(id);
        fetchStats();
      },
    });
  };

  const statsLoading = stats === null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý sản phẩm
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Thêm, sửa, xóa thông tin sản phẩm trong kho
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng sản phẩm"
            value={stats?.total ?? 0}
            icon={<Package size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
            loading={statsLoading}
          />
          <StatCard
            label="Tổng tồn kho"
            value={(stats?.totalStock ?? 0).toLocaleString("vi-VN")}
            icon={<Layers size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            valueColor="text-emerald-700"
            loading={statsLoading}
          />
          <StatCard
            label="Sản phẩm bán chạy"
            value={stats?.topSelling ?? 0}
            icon={<TrendingUp size={20} className="text-orange-500" />}
            iconBg="bg-orange-50"
            valueColor="text-orange-600"
            loading={statsLoading}
          />
          <StatCard
            label="Hết hàng"
            value={stats?.outOfStock ?? 0}
            icon={<EyeOff size={20} className="text-gray-400" />}
            iconBg="bg-gray-100"
            valueColor={
              (stats?.outOfStock ?? 0) > 0 ? "text-red-500" : "text-gray-500"
            }
            loading={statsLoading}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên sản phẩm..."
          >
            {/* Lọc danh mục */}
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) => updateFilters({ categoryId: e.target.value })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Danh mục: Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Lọc nhà cung cấp */}
            <select
              value={filters.supplierId ?? ""}
              onChange={(e) => updateFilters({ supplierId: e.target.value })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">NCC: Tất cả</option>
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
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tồn kho: Tất cả</option>
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
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Nhà cung cấp</th>
                  <th className="px-6 py-4 text-right">Giá bán</th>
                  <th className="px-6 py-4 text-right">Giá nhập</th>
                  <th className="px-6 py-4 text-center">Tồn kho</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableLoadingRow colSpan={7} text="Đang tải dữ liệu..." />
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail
                            imageUrl={product.imageUrl}
                            name={product.name}
                          />
                          <span className="font-medium text-gray-800">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.supplier?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-800 font-medium">
                        {product.price.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {product.costPrice.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.stockQuantity <= (product.minStock ?? 10)
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
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
            currentPage={filters.page}
            isLoading={isLoading}
            onPageChange={goToPage}
          />
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
