import { useState, useEffect } from 'react';
import ImageCropper from '../components/ImageCropper';
import { firestoreService, Product, Order, Coupon, MembershipLevel, User } from '../services/firestore';
import { Timestamp } from 'firebase/firestore';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'membership' | 'users'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [membershipLevels, setMembershipLevels] = useState<MembershipLevel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showUserEditForm, setShowUserEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingMembership, setEditingMembership] = useState<MembershipLevel | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userEditFormData, setUserEditFormData] = useState({
    membership_level_id: '',
    points: '',
    role: 'user' as 'user' | 'admin'
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: ''
  });
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    is_active: 1
  });
  const [membershipFormData, setMembershipFormData] = useState({
    name: '',
    description: '',
    discount_percentage: '',
    min_points: '',
    color: '#6B7280',
    icon: '⭐'
  });

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'membership') {
      fetchMembershipLevels();
    } else if (activeTab === 'users') {
      fetchUsers();
      fetchMembershipLevels(); // 也需要會員等級列表用於編輯
    }
  }, [activeTab]);

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await firestoreService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('獲取訂單失敗:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const couponList = await firestoreService.getCoupons();
      setCoupons(couponList);
    } catch (error) {
      console.error('獲取優惠券失敗:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipLevels = async () => {
    setLoading(true);
    try {
      const levels = await firestoreService.getMembershipLevels();
      setMembershipLevels(levels);
    } catch (error) {
      console.error('獲取會員等級失敗:', error);
      setMembershipLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await firestoreService.getAllUsers();
      // 為每個用戶獲取會員等級信息
      const usersWithMembership = await Promise.all(
        userList.map(async (user) => {
          const membership = await firestoreService.getMembershipLevel(user.membership_level_id);
          return {
            ...user,
            membership_name: membership?.name,
            color: membership?.color,
            icon: membership?.icon,
          };
        })
      );
      setUsers(usersWithMembership);
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageCrop = (croppedImageUrl: string) => {
    setProductFormData({ ...productFormData, image_url: croppedImageUrl });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        stock: parseInt(productFormData.stock),
        image_url: productFormData.image_url,
        category: productFormData.category,
      };

      if (editingProduct) {
        await firestoreService.updateProduct(editingProduct.id, productData);
      } else {
        await firestoreService.createProduct(productData);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ name: '', description: '', price: '', stock: '', image_url: '', category: '' });
      fetchProducts();
    } catch (error) {
      console.error('保存商品失敗:', error);
      alert('保存失敗，請檢查輸入');
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const couponData: Omit<Coupon, 'id' | 'created_at'> = {
        code: couponFormData.code,
        description: couponFormData.description,
        discount_type: couponFormData.discount_type,
        discount_value: parseFloat(couponFormData.discount_value),
        min_purchase: couponFormData.min_purchase ? parseFloat(couponFormData.min_purchase) : undefined,
        max_discount: couponFormData.max_discount ? parseFloat(couponFormData.max_discount) : undefined,
        valid_from: Timestamp.fromDate(new Date(couponFormData.valid_from)),
        valid_until: Timestamp.fromDate(new Date(couponFormData.valid_until)),
        usage_limit: couponFormData.usage_limit ? parseInt(couponFormData.usage_limit) : undefined,
        used_count: editingCoupon?.used_count || 0,
        is_active: couponFormData.is_active === 1,
      };

      if (editingCoupon) {
        await firestoreService.updateCoupon(editingCoupon.id, couponData);
      } else {
        await firestoreService.createCoupon(couponData);
      }
      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '',
        max_discount: '',
        valid_from: '',
        valid_until: '',
        usage_limit: '',
        is_active: 1
      });
      fetchCoupons();
    } catch (error: any) {
      console.error('保存優惠券失敗:', error);
      alert(error.message || '保存失敗，請檢查輸入');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url,
      category: product.category
    });
    setShowProductForm(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const formatDate = (timestamp: Timestamp | Date | string) => {
      let date: Date;
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setCouponFormData({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_purchase: coupon.min_purchase?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      valid_from: formatDate(coupon.valid_from),
      valid_until: formatDate(coupon.valid_until),
      usage_limit: coupon.usage_limit?.toString() || '',
      is_active: coupon.is_active ? 1 : 0
    });
    setShowCouponForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('確定要刪除這個商品嗎？')) {
      try {
        await firestoreService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('刪除商品失敗:', error);
      }
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('確定要刪除這個優惠券嗎？')) {
      try {
        await firestoreService.deleteCoupon(id);
        fetchCoupons();
      } catch (error) {
        console.error('刪除優惠券失敗:', error);
      }
    }
  };

  const handleMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const levelData: Omit<MembershipLevel, 'id' | 'created_at'> = {
        name: membershipFormData.name,
        description: membershipFormData.description,
        discount_percentage: parseFloat(membershipFormData.discount_percentage),
        min_points: parseInt(membershipFormData.min_points),
        color: membershipFormData.color,
        icon: membershipFormData.icon,
      };

      if (editingMembership) {
        await firestoreService.updateMembershipLevel(editingMembership.id, levelData);
      } else {
        await firestoreService.createMembershipLevel(levelData);
      }
      setShowMembershipForm(false);
      setEditingMembership(null);
      setMembershipFormData({
        name: '',
        description: '',
        discount_percentage: '',
        min_points: '',
        color: '#6B7280',
        icon: '⭐'
      });
      fetchMembershipLevels();
    } catch (error: any) {
      console.error('保存會員等級失敗:', error);
      alert(error.message || '保存失敗，請檢查輸入');
    }
  };

  const handleEditMembership = (level: MembershipLevel) => {
    setEditingMembership(level);
    setMembershipFormData({
      name: level.name,
      description: level.description,
      discount_percentage: level.discount_percentage.toString(),
      min_points: level.min_points.toString(),
      color: level.color,
      icon: level.icon
    });
    setShowMembershipForm(true);
  };

  const handleDeleteMembership = async (id: string) => {
    if (window.confirm('確定要刪除這個會員等級嗎？')) {
      try {
        await firestoreService.deleteMembershipLevel(id);
        fetchMembershipLevels();
      } catch (error: any) {
        alert(error.message || '刪除失敗');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await firestoreService.updateOrderStatus(orderId, status as Order['status']);
      fetchOrders();
    } catch (error) {
      console.error('更新訂單狀態失敗:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserEditFormData({
      membership_level_id: user.membership_level_id,
      points: user.points.toString(),
      role: user.role
    });
    setShowUserEditForm(true);
  };

  const handleUserEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // 更新角色
      await firestoreService.updateUser(editingUser.id, { role: userEditFormData.role });

      // 更新會員等級
      await firestoreService.updateUserMembershipLevel(editingUser.id, userEditFormData.membership_level_id);

      // 更新積分（這會自動更新會員等級）
      await firestoreService.updateUserPoints(editingUser.id, parseInt(userEditFormData.points));

      setShowUserEditForm(false);
      setEditingUser(null);
      setUserEditFormData({ membership_level_id: '', points: '', role: 'user' });
      fetchUsers();
      alert('用戶信息已更新');
    } catch (error: any) {
      console.error('更新用戶信息失敗:', error);
      alert(error.message || '更新失敗，請檢查輸入');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">管理後台</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            商品管理
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            訂單管理
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'coupons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            優惠券管理
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'membership'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            會員等級管理
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            會員管理
          </button>
        </nav>
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">商品列表</h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductFormData({ name: '', description: '', price: '', stock: '', image_url: '', category: '' });
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">商品圖片</label>
                    <ImageCropper onCropComplete={handleImageCrop} aspect={1} />
                    {productFormData.image_url && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">預覽：</p>
                        <img
                          src={productFormData.image_url}
                          alt="預覽"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setProductFormData({ ...productFormData, image_url: '' })}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          清除圖片
                        </button>
                      </div>
                    )}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">或直接輸入圖片URL</label>
                      <input
                        type="url"
                        value={productFormData.image_url}
                        onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{product.price}</td>
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
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">訂單列表</h2>
          {loading ? (
            <div className="text-center py-12">加載中...</div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用戶ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">創建時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_id.slice(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{order.total_amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.created_at && (order.created_at instanceof Timestamp 
                          ? order.created_at.toDate().toLocaleString('zh-CN')
                          : new Date(order.created_at).toLocaleString('zh-CN'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="pending">待支付</option>
                          <option value="paid">已支付</option>
                          <option value="shipped">已發貨</option>
                          <option value="delivered">已送達</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'coupons' && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">優惠券列表</h2>
            <button
              onClick={() => {
                setEditingCoupon(null);
                setCouponFormData({
                  code: '',
                  description: '',
                  discount_type: 'percentage',
                  discount_value: '',
                  min_purchase: '',
                  max_discount: '',
                  valid_from: '',
                  valid_until: '',
                  usage_limit: '',
                  is_active: 1
                });
                setShowCouponForm(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-md shadow-lg"
            >
              添加優惠券
            </button>
          </div>

          {showCouponForm && (
            <div className="mb-6 bg-white shadow-xl rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCoupon ? '編輯優惠券' : '添加優惠券'}
              </h3>
              <form onSubmit={handleCouponSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">優惠券代碼 *</label>
                    <input
                      type="text"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: SUMMER2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">折扣類型 *</label>
                    <select
                      value={couponFormData.discount_type}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="percentage">百分比折扣</option>
                      <option value="fixed">固定金額</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      折扣值 * {couponFormData.discount_type === 'percentage' ? '(%)' : '(¥)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={couponFormData.discount_value}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discount_value: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  {couponFormData.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">最高折扣金額 (¥)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={couponFormData.max_discount}
                        onChange={(e) => setCouponFormData({ ...couponFormData, max_discount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最低消費金額 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={couponFormData.min_purchase}
                      onChange={(e) => setCouponFormData({ ...couponFormData, min_purchase: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">使用次數限制</label>
                    <input
                      type="number"
                      value={couponFormData.usage_limit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usage_limit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">有效開始時間 *</label>
                    <input
                      type="datetime-local"
                      value={couponFormData.valid_from}
                      onChange={(e) => setCouponFormData({ ...couponFormData, valid_from: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">有效結束時間 *</label>
                    <input
                      type="datetime-local"
                      value={couponFormData.valid_until}
                      onChange={(e) => setCouponFormData({ ...couponFormData, valid_until: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={couponFormData.description}
                      onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={couponFormData.is_active === 1}
                        onChange={(e) => setCouponFormData({ ...couponFormData, is_active: e.target.checked ? 1 : 0 })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">啟用優惠券</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCouponForm(false);
                      setEditingCoupon(null);
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">代碼</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">折扣</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用情況</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => {
                    const validUntil = coupon.valid_until instanceof Timestamp 
                      ? coupon.valid_until.toDate() 
                      : new Date(coupon.valid_until);
                    const isExpired = validUntil < new Date();
                    const isActive = coupon.is_active && !isExpired;
                    return (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{coupon.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{coupon.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%` 
                            : `¥${coupon.discount_value}`}
                          {coupon.max_discount && coupon.discount_type === 'percentage' && (
                            <span className="text-xs text-gray-500"> (最高¥{coupon.max_discount})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{coupon.valid_from instanceof Timestamp 
                            ? coupon.valid_from.toDate().toLocaleDateString('zh-CN')
                            : new Date(coupon.valid_from).toLocaleDateString('zh-CN')}</div>
                          <div className="text-xs text-gray-500">至 {coupon.valid_until instanceof Timestamp
                            ? coupon.valid_until.toDate().toLocaleDateString('zh-CN')
                            : new Date(coupon.valid_until).toLocaleDateString('zh-CN')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {coupon.used_count} / {coupon.usage_limit || '∞'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isActive ? '有效' : '無效'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'membership' && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">會員等級列表</h2>
            <button
              onClick={() => {
                setEditingMembership(null);
                setMembershipFormData({
                  name: '',
                  description: '',
                  discount_percentage: '',
                  min_points: '',
                  color: '#6B7280',
                  icon: '⭐'
                });
                setShowMembershipForm(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-md shadow-lg"
            >
              添加會員等級
            </button>
          </div>

          {showMembershipForm && (
            <div className="mb-6 bg-white shadow-xl rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingMembership ? '編輯會員等級' : '添加會員等級'}
              </h3>
              <form onSubmit={handleMembershipSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">等級名稱 *</label>
                    <input
                      type="text"
                      value={membershipFormData.name}
                      onChange={(e) => setMembershipFormData({ ...membershipFormData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: 金卡會員"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最低積分 *</label>
                    <input
                      type="number"
                      value={membershipFormData.min_points}
                      onChange={(e) => setMembershipFormData({ ...membershipFormData, min_points: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: 2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">折扣百分比 (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={membershipFormData.discount_percentage}
                      onChange={(e) => setMembershipFormData({ ...membershipFormData, discount_percentage: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">圖標</label>
                    <input
                      type="text"
                      value={membershipFormData.icon}
                      onChange={(e) => setMembershipFormData({ ...membershipFormData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: 👑"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">顏色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={membershipFormData.color}
                        onChange={(e) => setMembershipFormData({ ...membershipFormData, color: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={membershipFormData.color}
                        onChange={(e) => setMembershipFormData({ ...membershipFormData, color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                        placeholder="#6B7280"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea
                      value={membershipFormData.description}
                      onChange={(e) => setMembershipFormData({ ...membershipFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      rows={2}
                      placeholder="例如: 消費滿2000元可升級"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMembershipForm(false);
                      setEditingMembership(null);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipLevels.map((level) => (
                <div
                  key={level.id}
                  className="bg-white shadow-lg rounded-lg p-6 border-2"
                  style={{ borderColor: level.color }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{level.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: level.color }}>
                          {level.name}
                        </h3>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMembership(level)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteMembership(level.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">折扣:</span>
                      <span className="font-semibold" style={{ color: level.color }}>
                        {level.discount_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最低積分:</span>
                      <span className="font-semibold">{level.min_points}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">會員列表</h2>
          </div>

          {showUserEditForm && editingUser && (
            <div className="mb-6 bg-white shadow-xl rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">編輯會員信息</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>用戶名:</strong> {editingUser.username}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>郵箱:</strong> {editingUser.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>角色:</strong> {editingUser.role === 'admin' ? '管理員' : '普通用戶'}
                </p>
              </div>
              <form onSubmit={handleUserEditSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">角色 *</label>
                    <select
                      value={userEditFormData.role}
                      onChange={(e) => setUserEditFormData({ ...userEditFormData, role: e.target.value as 'user' | 'admin' })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="user">普通用戶</option>
                      <option value="admin">管理員</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">會員等級 *</label>
                    <select
                      value={userEditFormData.membership_level_id}
                      onChange={(e) => setUserEditFormData({ ...userEditFormData, membership_level_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      {membershipLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.icon} {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">積分 *</label>
                    <input
                      type="number"
                      value={userEditFormData.points}
                      onChange={(e) => setUserEditFormData({ ...userEditFormData, points: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="例如: 1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">修改積分會自動更新會員等級</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserEditForm(false);
                      setEditingUser(null);
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用戶名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">郵箱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">會員等級</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">積分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">總消費</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">註冊時間</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? '管理員' : '普通用戶'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span>{user.icon || '⭐'}</span>
                          <span style={{ color: user.color || '#6B7280' }}>
                            {user.membership_name || '普通會員'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.points || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(user.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at && (user.created_at instanceof Timestamp
                          ? user.created_at.toDate().toLocaleDateString('zh-TW')
                          : new Date(user.created_at).toLocaleDateString('zh-TW'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編輯
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">暫無會員</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
