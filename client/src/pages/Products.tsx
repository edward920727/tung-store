import { useState, useEffect, useCallback, useMemo } from 'react';
import { firestoreService, Product } from '../services/firestore';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ProductCard } from '../components/ProductCard';
import { FeaturedImageCard } from '../components/FeaturedImageCard';
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

  // 組織商品列表：分離滿版大圖和普通商品，並計算不規則排版
  const organizedProducts = useMemo(() => {
    const featured: Product[] = [];
    const regular: Product[] = [];
    
    products.forEach((product) => {
      if (product.is_featured) {
        featured.push(product);
      } else {
        regular.push(product);
      }
    });

    // 混合排列：每 6-8 個普通商品後插入一個滿版大圖
    const mixed: Array<{ product: Product; isFeatured: boolean }> = [];
    let regularIndex = 0;
    let featuredIndex = 0;
    let counter = 0;

    while (regularIndex < regular.length || featuredIndex < featured.length) {
      // 每 7 個普通商品後，插入一個滿版大圖（如果還有）
      if (counter > 0 && counter % 7 === 0 && featuredIndex < featured.length) {
        mixed.push({ product: featured[featuredIndex], isFeatured: true });
        featuredIndex++;
      } else if (regularIndex < regular.length) {
        mixed.push({ product: regular[regularIndex], isFeatured: false });
        regularIndex++;
      } else if (featuredIndex < featured.length) {
        // 如果普通商品用完了，把剩餘的滿版大圖都加上
        mixed.push({ product: featured[featuredIndex], isFeatured: true });
        featuredIndex++;
      } else {
        break;
      }
      counter++;
    }

    return mixed;
  }, [products]);

  return (
    <>
      <SEO
        title="商品列表 - 時尚女裝精品店"
        description="探索我們精心挑選的時尚女裝，涵蓋各種風格和場合。優質面料，精緻工藝，展現獨特個人風格。"
        keywords="女裝,時尚,服裝,購物,商品列表"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-700 mb-2">商品列表</h1>
          <p className="text-gray-500 font-light">探索我們精心挑選的時尚女裝</p>
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
          <div className="text-lg text-gray-500 font-light">沒有找到商品</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-auto">
          {organizedProducts.map((item) => {
            if (item.isFeatured) {
              // 滿版大圖：跨越多列
              return (
                <div
                  key={item.product.id}
                  className="col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5"
                >
                  <FeaturedImageCard product={item.product} />
                </div>
              );
            } else {
              // 普通商品卡片
              return <ProductCard key={item.product.id} product={item.product} />;
            }
          })}
        </div>
      )}
      </div>
    </>
  );
};

export default Products;
