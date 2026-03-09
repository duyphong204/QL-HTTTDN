import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/shop/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useWarehouseStore } from "@/store/Warehouse.store";
import type { Product, Category } from "@/types";
import { useSalesStore } from "@/store/Sales.store";

export default function ProductsPage() {
  const products = useWarehouseStore(s => s.products)
  const categories = useWarehouseStore(s => s.categories)
  const productsLoading = useWarehouseStore(s => s.productsLoading)
  const actions = useWarehouseStore(s => s.actions)
  const addToCart = useSalesStore((s) => s.actions.addToCart);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [sort, setSort] = useState("name-asc");
  const parseSort = (value: string) => {
  const [sortBy, order] = value.split("-");
  return {
    sortBy,
    order: order as "asc" | "desc",
  };
};

  useEffect(() => {
    actions.fetchCategories();
  }, [actions]);

useEffect(() => {
  const { sortBy, order } = parseSort(sort);

  actions.setProductFilters({
    search,
    sortBy,
    order,
    page: 1,
    limit: 12,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
  });

  actions.fetchProducts();

  setSearchParams({
    q: search,
    categoryId: selectedCategory,
    sort,
  });
}, [search, selectedCategory, sort]);

  const handleSearch = (v: string) => setSearch(v);
  const handleCategoryChange = (v: string) => setSelectedCategory(v);

const handleAddToCart = (product: Product) => {
  addToCart({
    productId: product.id,
    quantity: 1,
    product
  });
};

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Tất cả sản phẩm</h1>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((cat: Category) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Theo tên</SelectItem>
              <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {productsLoading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : products.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p: Product) => (
              <ProductCard
                key={p.id}
                {...p}
                onAddToCart={() => handleAddToCart(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm phù hợp
            </p>
          </div>
        )}
      </main>

    </div>
  );
}