import { useState, useEffect } from 'react';
import ImageCropper from '../components/ImageCropper';
import { firestoreService, Product, uploadImage, downloadAndUploadImage } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

// 範例商品數據（包含懸停圖片，使用 Unsplash 無版權圖片）
const EXAMPLE_PRODUCTS = [
  {
    name: '優雅氣質長袖連衣裙',
    description: '經典優雅的長袖連衣裙，採用優質面料，適合各種正式場合。修身剪裁，展現女性優雅氣質。精緻細節設計，讓您在任何場合都散發自信魅力。',
    price: 1280,
    stock: 50,
    category: '連衣裙',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'] // 細節圖
  },
  {
    name: '簡約百搭白襯衫',
    description: '經典白襯衫，簡約百搭，適合職場和日常穿搭。優質棉質面料，舒適透氣。精緻剪裁，展現專業與優雅。',
    price: 680,
    stock: 80,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'] // 背面圖
  },
  {
    name: '舒適休閒短袖T恤',
    description: '柔軟舒適的休閒T恤，多種顏色可選。適合日常休閒穿搭，輕鬆自在。優質面料，親膚舒適。',
    price: 380,
    stock: 100,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'] // 側面圖
  },
  {
    name: '時尚高腰闊腿褲',
    description: '時尚高腰設計，闊腿剪裁，修飾腿型。優質面料，舒適透氣，適合多種場合。展現優雅氣質與時尚品味。',
    price: 980,
    stock: 60,
    category: '褲裝',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'] // 細節圖
  },
  {
    name: '溫柔針織開衫外套',
    description: '柔軟針織面料，溫柔優雅。適合春秋季節，可搭配各種內搭，展現溫柔氣質。舒適保暖，時尚百搭。',
    price: 890,
    stock: 45,
    category: '外套',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'] // 背面圖
  },
  {
    name: 'A字半身裙',
    description: '經典A字版型，修飾腰臀線條。多種顏色可選，適合搭配各種上衣，展現優雅氣質。優質面料，舒適貼身。',
    price: 750,
    stock: 70,
    category: '裙裝',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'] // 細節圖
  },
  {
    name: '修身彈力牛仔褲',
    description: '經典牛仔褲，修身剪裁，彈力面料。百搭單品，適合各種場合和風格。優質牛仔面料，耐穿舒適。',
    price: 880,
    stock: 90,
    category: '褲裝',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'] // 側面圖
  },
  {
    name: '經典風衣外套',
    description: '經典風衣設計，防風防雨。優質面料，精緻工藝，適合春秋季節，展現優雅氣質。多種顏色可選。',
    price: 1580,
    stock: 35,
    category: '外套',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'] // 背面圖
  },
  {
    name: '優雅無袖連衣裙',
    description: '清爽無袖設計，適合夏季穿著。優雅剪裁，展現女性魅力。優質面料，舒適透氣，適合各種場合。',
    price: 980,
    stock: 55,
    category: '連衣裙',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'] // 細節圖
  },
  {
    name: '時尚條紋T恤',
    description: '經典條紋設計，時尚百搭。優質面料，舒適親膚。適合日常休閒穿搭，展現青春活力。',
    price: 420,
    stock: 85,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'] // 側面圖
  }
];

const AdminProducts = () => {
  const { firebaseUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportButton, setShowImportButton] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    image_urls: [] as string[],
    external_image_url: '',
    external_hover_image_url: '',
    category: ''
  });
  const [uploadingExternalImage, setUploadingExternalImage] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const prods = await firestoreService.getProducts();
      setProducts(prods);
    } catch (error) {
      console.error('獲取商品失敗:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 將 base64 圖片上傳到 Firebase Storage
  const uploadBase64Image = async (base64String: string, type: 'main' | 'hover'): Promise<string> => {
    if (!firebaseUser) {
      throw new Error('請先登入管理員帳號');
    }

    try {
      const base64Data = base64String.split(',')[1] || base64String;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}_${randomStr}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      const path = `products/${type === 'main' ? 'main' : 'hover'}/${fileName}`;
      const url = await uploadImage(file, path);
      return url;
    } catch (error: any) {
      console.error('上傳 base64 圖片失敗:', error);
      throw new Error('上傳圖片失敗: ' + (error.message || '未知錯誤'));
    }
  };

  const handleImageCrop = async (croppedImageUrl: string) => {
    if (croppedImageUrl.startsWith('data:')) {
      try {
        setLoading(true);
        const uploadedUrl = await uploadBase64Image(croppedImageUrl, 'main');
        setProductFormData({ ...productFormData, image_url: uploadedUrl });
      } catch (error: any) {
        console.error('上傳圖片失敗:', error);
        alert('上傳圖片失敗: ' + (error.message || '未知錯誤') + '\n\n請檢查：\n1. 是否已登入管理員帳號\n2. Firebase Storage 配置是否正確\n3. 網絡連接是否正常');
        setProductFormData({ ...productFormData, image_url: croppedImageUrl });
      } finally {
        setLoading(false);
      }
    } else {
      setProductFormData({ ...productFormData, image_url: croppedImageUrl });
    }
  };

  const handleHoverImageCrop = async (croppedImageUrl: string) => {
    if (croppedImageUrl.startsWith('data:')) {
      try {
        setLoading(true);
        const uploadedUrl = await uploadBase64Image(croppedImageUrl, 'hover');
        setProductFormData({ 
          ...productFormData, 
          image_urls: [...productFormData.image_urls, uploadedUrl] 
        });
      } catch (error: any) {
        console.error('上傳懸停圖片失敗:', error);
        alert('上傳懸停圖片失敗: ' + (error.message || '未知錯誤') + '\n\n請檢查：\n1. 是否已登入管理員帳號\n2. Firebase Storage 配置是否正確\n3. 網絡連接是否正常');
        setProductFormData({ 
          ...productFormData, 
          image_urls: [...productFormData.image_urls, croppedImageUrl] 
        });
      } finally {
        setLoading(false);
      }
    } else {
      setProductFormData({ 
        ...productFormData, 
        image_urls: [...productFormData.image_urls, croppedImageUrl] 
      });
    }
  };

  const handleExternalImageUpload = async () => {
    if (!productFormData.external_image_url.trim()) {
      alert('請輸入外部圖片 URL');
      return;
    }

    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      return;
    }

    setUploadingExternalImage(true);
    try {
      const uploadedUrl = await downloadAndUploadImage(productFormData.external_image_url);
      setProductFormData({
        ...productFormData,
        image_url: uploadedUrl,
        external_image_url: '',
      });
      alert('外部圖片已成功下載並上傳到 Firebase Storage！');
    } catch (error: any) {
      console.error('上傳外部圖片失敗:', error);
      alert('上傳失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setUploadingExternalImage(false);
    }
  };

  const handleExternalHoverImageUpload = async () => {
    if (!productFormData.external_hover_image_url.trim()) {
      alert('請輸入外部圖片 URL');
      return;
    }

    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      return;
    }

    setUploadingExternalImage(true);
    try {
      const uploadedUrl = await downloadAndUploadImage(productFormData.external_hover_image_url);
      setProductFormData({
        ...productFormData,
        image_urls: [...productFormData.image_urls, uploadedUrl],
        external_hover_image_url: '',
      });
      alert('外部懸停圖片已成功下載並上傳到 Firebase Storage！');
    } catch (error: any) {
      console.error('上傳外部圖片失敗:', error);
      alert('上傳失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setUploadingExternalImage(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productFormData.name.trim()) {
      alert('請填寫商品名稱');
      return;
    }
    if (!productFormData.price || parseFloat(productFormData.price) <= 0) {
      alert('請填寫有效的價格（必須大於 0）');
      return;
    }
    if (productFormData.stock === '' || parseInt(productFormData.stock) < 0) {
      alert('請填寫有效的庫存數量（必須大於等於 0）');
      return;
    }
    if (!productFormData.image_url) {
      alert('請上傳商品主圖');
      return;
    }

    if (productFormData.image_url.startsWith('data:')) {
      const shouldContinue = window.confirm(
        '⚠️ 警告：主圖尚未上傳到 Firebase Storage（仍為 base64 格式）。\n\n' +
        '這可能導致保存失敗（Firestore 字段大小限制約 1MB）。\n\n' +
        '是否要繼續保存？建議先重新上傳圖片。'
      );
      if (!shouldContinue) {
        return;
      }
    }

    const hasBase64HoverImages = productFormData.image_urls.some(url => url.startsWith('data:'));
    if (hasBase64HoverImages) {
      const shouldContinue = window.confirm(
        '⚠️ 警告：部分懸停圖片尚未上傳到 Firebase Storage（仍為 base64 格式）。\n\n' +
        '這可能導致保存失敗。\n\n' +
        '是否要繼續保存？建議先重新上傳圖片。'
      );
      if (!shouldContinue) {
        return;
      }
    }

    try {
      setLoading(true);
      const productData = {
        name: productFormData.name.trim(),
        description: productFormData.description.trim(),
        price: parseFloat(productFormData.price),
        stock: parseInt(productFormData.stock),
        image_url: productFormData.image_url,
        image_urls: productFormData.image_urls,
        category: productFormData.category.trim(),
      };

      if (editingProduct) {
        await firestoreService.updateProduct(editingProduct.id, productData);
      } else {
        await firestoreService.createProduct(productData);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ 
        name: '', 
        description: '', 
        price: '', 
        stock: '', 
        image_url: '', 
        image_urls: [],
        external_image_url: '', 
        external_hover_image_url: '',
        category: '' 
      });
      fetchProducts();
    } catch (error: any) {
      console.error('保存商品失敗:', error);
      alert('保存失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const handleImportExampleProducts = async () => {
    if (!confirm(`確定要導入 ${EXAMPLE_PRODUCTS.length} 個範例商品嗎？這將在您的商品列表中添加這些商品。`)) {
      return;
    }

    setImporting(true);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      for (const product of EXAMPLE_PRODUCTS) {
        try {
          await firestoreService.createProduct(product);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${product.name}: ${error.message || '未知錯誤'}`);
          console.error(`導入商品失敗 [${product.name}]:`, error);
        }
      }

      if (results.failed === 0) {
        alert(`✅ 成功導入 ${results.success} 個範例商品！`);
      } else {
        alert(
          `導入完成：\n✅ 成功: ${results.success} 個\n❌ 失敗: ${results.failed} 個\n\n失敗詳情：\n${results.errors.join('\n')}`
        );
      }

      fetchProducts();
    } catch (error) {
      console.error('批量導入失敗:', error);
      alert('批量導入過程中發生錯誤，請查看控制台');
    } finally {
      setImporting(false);
      setShowImportButton(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url,
      image_urls: product.image_urls || [],
      external_image_url: '',
      external_hover_image_url: '',
      category: product.category
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('確定要刪除這個商品嗎？')) {
      try {
        await firestoreService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('刪除商品失敗:', error);
        alert('刪除失敗，請重試');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">產品管理</h1>
        <p className="text-gray-600">管理所有產品信息</p>
      </div>

      <div>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 
              className="text-xl font-semibold cursor-pointer select-none"
              onDoubleClick={() => setShowImportButton(!showImportButton)}
              title="雙擊此標題顯示/隱藏導入按鈕"
            >
              商品列表
            </h2>
            {showImportButton && (
              <button
                onClick={handleImportExampleProducts}
                disabled={importing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                title="導入10個女裝範例商品"
              >
                {importing ? '導入中...' : '📥 導入範例資料'}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductFormData({ 
                name: '', 
                description: '', 
                price: '', 
                stock: '', 
                image_url: '', 
                image_urls: [],
                external_image_url: '', 
                external_hover_image_url: '',
                category: '' 
              });
              setShowProductForm(true);
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-md shadow-lg"
          >
            添加商品
          </button>
        </div>

        {showProductForm && (
          <div className="mb-6 bg-white shadow-xl rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? '編輯商品' : '添加商品'}
            </h3>
            <form onSubmit={handleProductSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商品名稱</label>
                  <input
                    type="text"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">價格</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">庫存</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                  <input
                    type="text"
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                  <textarea
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    rows={3}
                  />
                </div>
                {/* 主圖（展示圖片） */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-pink-600">★</span> 展示圖片（主圖）
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <ImageCropper onCropComplete={handleImageCrop} aspect={1} id="main-image-cropper" />
                      {loading && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">⏳ 正在上傳圖片到 Firebase Storage...</p>
                        </div>
                      )}
                      {productFormData.image_url && !loading && (
                        <div className="mt-4 p-4 bg-pink-50 border-2 border-pink-300 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-pink-600 font-bold text-lg">📷</span>
                            <p className="text-sm font-semibold text-pink-800">
                              展示圖片預覽（主圖）
                            </p>
                            {productFormData.image_url.startsWith('data:') ? (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Base64</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">已上傳</span>
                            )}
                          </div>
                          <p className="text-xs text-pink-600 mb-3">此圖片將作為商品的主要展示圖片</p>
                          <div className="flex items-start gap-3">
                            <img
                              src={productFormData.image_url}
                              alt="展示圖片預覽"
                              className="w-32 h-32 object-cover rounded-lg border-2 border-pink-400 shadow-sm"
                              onError={(e) => {
                                console.error('展示圖片加載失敗:', productFormData.image_url);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-2">僅為預覽，需點擊「確認保存」才會保存</p>
                              <button
                                type="button"
                                onClick={() => setProductFormData({ ...productFormData, image_url: '' })}
                                className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                              >
                                清除展示圖片
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          外部圖片 URL（自動下載並上傳）
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={productFormData.external_image_url}
                            onChange={(e) => setProductFormData({ ...productFormData, external_image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm"
                            disabled={uploadingExternalImage}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleExternalImageUpload();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleExternalImageUpload}
                            disabled={uploadingExternalImage || !productFormData.external_image_url.trim()}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors whitespace-nowrap text-sm"
                          >
                            {uploadingExternalImage ? '上傳中...' : '上傳'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          或直接輸入圖片 URL
                        </label>
                        <input
                          type="url"
                          value={productFormData.image_url}
                          onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 懸停圖片（滑鼠滑過去展示的圖片） */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-purple-600">★</span> 懸停圖片（滑鼠滑過去時顯示，可選）
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <ImageCropper onCropComplete={handleHoverImageCrop} aspect={1} id="hover-image-cropper" />
                      <p className="text-xs text-gray-500 mt-2">上傳的圖片將添加到懸停圖片列表</p>
                      {loading && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">⏳ 正在上傳懸停圖片...</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          外部圖片 URL（自動下載並上傳）
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={productFormData.external_hover_image_url}
                            onChange={(e) => setProductFormData({ ...productFormData, external_hover_image_url: e.target.value })}
                            placeholder="https://example.com/hover-image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 text-sm"
                            disabled={uploadingExternalImage}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleExternalHoverImageUpload();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleExternalHoverImageUpload}
                            disabled={uploadingExternalImage || !productFormData.external_hover_image_url.trim()}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors whitespace-nowrap text-sm"
                          >
                            {uploadingExternalImage ? '上傳中...' : '上傳'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 懸停圖片預覽（統一顯示） */}
                  {productFormData.image_urls.length > 0 && !loading && (
                    <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-purple-600 font-bold text-lg">🖼️</span>
                        <p className="text-sm font-semibold text-purple-800">
                          懸停圖片預覽（共 {productFormData.image_urls.length} 張）
                        </p>
                      </div>
                      <p className="text-xs text-purple-600 mb-3">
                        第一張將在滑鼠滑過商品時顯示，僅為預覽，需點擊「確認保存」才會保存
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {productFormData.image_urls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="relative">
                              <img
                                src={url}
                                alt={`懸停圖 ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-purple-400 shadow-sm"
                                onError={(e) => {
                                  console.error(`懸停圖片 ${index + 1} 加載失敗`);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newUrls = productFormData.image_urls.filter((_, i) => i !== index);
                                  setProductFormData({ ...productFormData, image_urls: newUrls });
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                title="刪除此懸停圖片"
                              >
                                ×
                              </button>
                              {index === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-xs text-center py-0.5 rounded-b-lg font-medium">
                                  主要懸停圖
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-1">第 {index + 1} 張</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>⚠️ 重要提示：</strong>所有信息（包括圖片）都只是預覽，只有點擊下方的「確認保存」按鈕才會真正保存到數據庫。
                </p>
                <p className="text-xs text-yellow-700">
                  請確認所有信息填寫完整後再點擊保存按鈕。
                </p>
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg font-medium"
                >
                  ✓ 確認保存
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('確定要取消嗎？未保存的更改將丟失。')) {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductFormData({ 
                        name: '', 
                        description: '', 
                        price: '', 
                        stock: '', 
                        image_url: '', 
                        image_urls: [],
                        external_image_url: '', 
                        external_hover_image_url: '',
                        category: '' 
                      });
                    }
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">加載中...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">圖片</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">價格</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">庫存</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分類</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/50x50'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NT${product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
