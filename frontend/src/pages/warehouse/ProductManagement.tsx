import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package, RefreshCw } from 'lucide-react';
import { useProductStore } from '@/store/product.store';
import { getCloudinaryThumbnailUrl } from '@/lib/cloudinary';
import { ProductFormModal } from './components/ProductFormModal';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { DataTableToolbar } from '@/components/common/DataTableToolbar';
import { PaginationControls } from '@/components/common/PaginationControls';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/warehouse.type';

function ProductThumbnail({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
        <Package size={18} className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={getCloudinaryThumbnailUrl(imageUrl, 80, 80)}
      alt={name}
      className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export default function ProductManagement() {
  const {
    products,
    isLoading,
    meta,
    filters,
    categories,
    suppliers,
    fetchProducts,
    fetchCategories,
    fetchSuppliers,
    setFilters,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { searchTerm, setSearchTerm, updateFilters, goToPage } = usePaginatedList({
    filters,
    setFilters,
    fetchData: fetchProducts,
    debounceMs: 400,
  });

  useEffect(() => {
    void Promise.all([fetchCategories(), fetchSuppliers()]);
  }, [fetchCategories, fetchSuppliers]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xoá sản phẩm "${name}"?`)) return;
    await deleteProduct(id);
  };

  const handleSubmit = async (data: CreateProductDto | UpdateProductDto) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data as UpdateProductDto);
    } else {
      await createProduct(data as CreateProductDto);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa thông tin sản phẩm trong kho</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 overflow-hidden">
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm theo tên sản phẩm..."
          >
            <select
              value={filters.categoryId ?? ''}
              onChange={(e) => updateFilters({ categoryId: e.target.value })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Danh mục: Tất cả</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={filters.supplierId ?? ''}
              onChange={(e) => updateFilters({ supplierId: e.target.value })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">NCC: Tất cả</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>

            <select
              value={filters.sortBy ?? 'name'}
              onChange={(e) => updateFilters({ sortBy: e.target.value as 'name' | 'price' | 'costPrice' | 'stockQuantity' })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="name">Sắp xếp: Tên</option>
              <option value="price">Sắp xếp: Giá bán</option>
              <option value="costPrice">Sắp xếp: Giá nhập</option>
              <option value="stockQuantity">Sắp xếp: Tồn kho</option>
            </select>

            <select
              value={filters.sortOrder ?? 'asc'}
              onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="h-11 px-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="asc">Tăng dần</option>
              <option value="desc">Giảm dần</option>
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
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      <RefreshCw size={24} className="animate-spin mx-auto text-blue-500" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Không có sản phẩm nào.</td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail imageUrl={product.imageUrl} name={product.name} />
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{product.supplier?.name || '—'}</td>
                    <td className="px-6 py-4 text-right text-gray-800 font-medium">{product.price.toLocaleString('vi-VN')}đ</td>
                    <td className="px-6 py-4 text-right text-gray-600">{product.costPrice.toLocaleString('vi-VN')}đ</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.stockQuantity <= (product.minStock ?? 10)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
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
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
        onClose={() => setModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
