import { useState, useEffect, useCallback } from 'react';
import { firestoreService, Product } from '../services/firestore';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ProductCard } from '../components/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import { SEO } from '../components/SEO';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 防抖搜索詞，減少不必要的 API 調用
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm]);

  // 從 URL 參數讀取搜索和分類
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await firestoreService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('獲取分類失敗:', error);
      setCategories([]);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      
      const prods = await firestoreService.getProducts(filters);
      setProducts(prods);
    } catch (error) {
      console.error('獲取商品失敗:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearchTerm]);

  return (
    <>
      <SEO
        title="商品列表 - 時尚女裝精品店"
        description="探索我們精心挑選的時尚女裝，涵蓋各種風格和場合。優質面料，精緻工藝，展現獨特個人風格。"
        keywords="女裝,時尚,服裝,購物,商品列表"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">商品列表</h1>
          <p className="text-gray-600">探索我們精心挑選的時尚女裝</p>
        </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋商品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">所有分類</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader type="product-list" count={8} />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-500">沒有找到商品</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default Products;
