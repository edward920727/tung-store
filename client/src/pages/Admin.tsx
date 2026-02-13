import { useState, useEffect } from 'react';
import ImageCropper from '../components/ImageCropper';
import { firestoreService, Product, Order, Coupon, MembershipLevel, User, HomePageConfig, uploadImage } from '../services/firestore';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';

const Admin = () => {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'membership' | 'users' | 'homepage'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [membershipLevels, setMembershipLevels] = useState<MembershipLevel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 首頁配置相關狀態
  const [homePageConfig, setHomePageConfig] = useState<HomePageConfig | null>(null);
  const [homeConfigFormData, setHomeConfigFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundImage: '',
    heroButtonText: '',
    heroButtonLink: '/products',
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    gradientFrom: '#EC4899',
    gradientTo: '#8B5CF6',
    layout: 'default' as 'default' | 'compact' | 'wide',
    showFeatures: true,
    showGallery: true,
    featuredProductIds: [] as string[],
    sectionOrder: ['hero', 'features', 'gallery'] as string[],
    features: [
      { title: '豐富商品', description: '瀏覽我們精心挑選的童裝，涵蓋各種款式、尺碼和風格', icon: '🛍️', imageUrl: '', gradientFrom: '#EC4899', gradientTo: '#8B5CF6' },
      { title: '便捷購物', description: '簡單易用的購物車系統，輕鬆管理您想要購買的商品', icon: '🛒', imageUrl: '', gradientFrom: '#3B82F6', gradientTo: '#06B6D4' },
      { title: '安全可靠', description: '安全的支付系統和訂單管理，讓您購物無憂', icon: '🔒', imageUrl: '', gradientFrom: '#10B981', gradientTo: '#059669' },
    ] as Array<{ title: string; description: string; icon: string; imageUrl: string; gradientFrom: string; gradientTo: string }>,
  });
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
    } else if (activeTab === 'homepage') {
      fetchHomePageConfig();
      fetchProducts(); // 需要商品列表來選擇精選商品
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

  const fetchHomePageConfig = async () => {
    setLoading(true);
    try {
      const config = await firestoreService.getHomePageConfig();
      if (config) {
        setHomePageConfig(config);
        setHomeConfigFormData({
          heroTitle: config.heroTitle || '',
          heroSubtitle: config.heroSubtitle || '',
          heroBackgroundImage: config.heroBackgroundImage || '',
          heroButtonText: config.heroButtonText || '瀏覽商品',
          heroButtonLink: config.heroButtonLink || '/products',
          primaryColor: config.primaryColor || '#EC4899',
          secondaryColor: config.secondaryColor || '#8B5CF6',
          gradientFrom: config.gradientFrom || '#EC4899',
          gradientTo: config.gradientTo || '#8B5CF6',
          layout: config.layout || 'default',
          showFeatures: config.showFeatures !== undefined ? config.showFeatures : true,
          showGallery: config.showGallery !== undefined ? config.showGallery : true,
          featuredProductIds: config.featuredProductIds || [],
          sectionOrder: config.sectionOrder || ['hero', 'features', 'gallery'],
          features: config.features || homeConfigFormData.features,
        });
      }
    } catch (error) {
      console.error('獲取首頁配置失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomePageConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const configData: Partial<HomePageConfig> = {
        heroTitle: homeConfigFormData.heroTitle,
        heroSubtitle: homeConfigFormData.heroSubtitle,
        heroBackgroundImage: homeConfigFormData.heroBackgroundImage,
        heroButtonText: homeConfigFormData.heroButtonText,
        heroButtonLink: homeConfigFormData.heroButtonLink,
        primaryColor: homeConfigFormData.primaryColor,
        secondaryColor: homeConfigFormData.secondaryColor,
        gradientFrom: homeConfigFormData.gradientFrom,
        gradientTo: homeConfigFormData.gradientTo,
        layout: homeConfigFormData.layout,
        showFeatures: homeConfigFormData.showFeatures,
        showGallery: homeConfigFormData.showGallery,
        featuredProductIds: homeConfigFormData.featuredProductIds,
        sectionOrder: homeConfigFormData.sectionOrder,
        features: homeConfigFormData.features,
      };

      if (homePageConfig) {
        await firestoreService.updateHomePageConfig(configData);
      } else {
        await firestoreService.createHomePageConfig(configData as Omit<HomePageConfig, 'id' | 'created_at' | 'updated_at'>);
      }
      
      alert('首頁配置已保存！');
      fetchHomePageConfig();
    } catch (error: any) {
      console.error('保存首頁配置失敗:', error);
      alert(error.message || '保存失敗');
    }
  };

  // 拖拽處理函數
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 區塊順序拖拽
  const handleSectionOrderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = homeConfigFormData.sectionOrder.indexOf(active.id as string);
      const newIndex = homeConfigFormData.sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(homeConfigFormData.sectionOrder, oldIndex, newIndex);
      setHomeConfigFormData({ ...homeConfigFormData, sectionOrder: newOrder });
      // 自動保存
      handleAutoSave({ sectionOrder: newOrder });
    }
  };

  // 精選商品順序拖拽
  const handleFeaturedProductsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = homeConfigFormData.featuredProductIds.indexOf(active.id as string);
      const newIndex = homeConfigFormData.featuredProductIds.indexOf(over.id as string);
      const newOrder = arrayMove(homeConfigFormData.featuredProductIds, oldIndex, newIndex);
      setHomeConfigFormData({ ...homeConfigFormData, featuredProductIds: newOrder });
      // 自動保存
      handleAutoSave({ featuredProductIds: newOrder });
    }
  };

  // 自動保存（拖拽後）
  const handleAutoSave = async (updates: Partial<HomePageConfig>) => {
    try {
      if (homePageConfig) {
        await firestoreService.updateHomePageConfig(updates);
      }
    } catch (error) {
      console.error('自動保存失敗:', error);
    }
  };

  // 圖片拖拽上傳處理
  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>, type: 'hero' | 'feature') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const path = `homepage/${type}/${Date.now()}_${file.name}`;
          const url = await uploadImage(file, path);
          if (type === 'hero') {
            setHomeConfigFormData({ ...homeConfigFormData, heroBackgroundImage: url });
          }
          alert('圖片上傳成功！');
        } catch (error: any) {
          alert('圖片上傳失敗: ' + (error.message || '未知錯誤'));
        }
      } else {
        alert('請上傳圖片文件');
      }
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'feature') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          const path = `homepage/${type}/${Date.now()}_${file.name}`;
          const url = await uploadImage(file, path);
          if (type === 'hero') {
            setHomeConfigFormData({ ...homeConfigFormData, heroBackgroundImage: url });
          }
          alert('圖片上傳成功！');
        } catch (error: any) {
          alert('圖片上傳失敗: ' + (error.message || '未知錯誤'));
        }
      } else {
        alert('請上傳圖片文件');
      }
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

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // 防止刪除當前登入的用戶
    if (firebaseUser && userId === firebaseUser.uid) {
      alert('不能刪除當前登入的用戶！');
      return;
    }

    if (!window.confirm(`確定要刪除會員 ${userEmail} 嗎？\n\n注意：\n1. 這只會刪除 Firestore 中的用戶數據\n2. 如需完全刪除，請在 Firebase Console 中同時刪除 Authentication 用戶\n3. 相關的購物車和訂單數據不會自動刪除\n\n此操作無法撤銷！`)) {
      return;
    }

    try {
      await firestoreService.deleteUser(userId);
      alert('會員已刪除');
      fetchUsers();
    } catch (error: any) {
      console.error('刪除會員失敗:', error);
      alert(error.message || '刪除失敗');
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
          <button
            onClick={() => setActiveTab('homepage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'homepage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            首頁設計
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NT${order.total_amount.toFixed(2)}</td>
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
                      折扣值 * {couponFormData.discount_type === 'percentage' ? '(%)' : '(NT$)'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">最高折扣金額 (NT$)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">最低消費金額 (NT$)</label>
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
                            : `NT$${coupon.discount_value}`}
                          {coupon.max_discount && coupon.discount_type === 'percentage' && (
                            <span className="text-xs text-gray-500"> (最高NT${coupon.max_discount})</span>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編輯
                        </button>
                        {firebaseUser && user.id !== firebaseUser.uid && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            刪除
                          </button>
                        )}
                        {firebaseUser && user.id === firebaseUser.uid && (
                          <span className="text-gray-400 text-xs">（當前用戶）</span>
                        )}
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

      {activeTab === 'homepage' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">首頁設計</h2>
            <p className="text-sm text-gray-600 mt-1">自定義首頁的布局、顏色和精選商品</p>
          </div>

          {loading ? (
            <div className="text-center py-12">加載中...</div>
          ) : (
            <form onSubmit={handleHomePageConfigSubmit} className="space-y-6">
              {/* Hero 區域設置 */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Hero 區域設置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主標題 *</label>
                    <input
                      type="text"
                      value={homeConfigFormData.heroTitle}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroTitle: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="歡迎來到小童服飾"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">副標題 *</label>
                    <input
                      type="text"
                      value={homeConfigFormData.heroSubtitle}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroSubtitle: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="發現優質童裝，享受便捷購物體驗"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">按鈕文字 *</label>
                    <input
                      type="text"
                      value={homeConfigFormData.heroButtonText}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroButtonText: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="瀏覽商品"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">按鈕連結 *</label>
                    <input
                      type="text"
                      value={homeConfigFormData.heroButtonLink}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroButtonLink: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="/products"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">背景圖片</label>
                    {/* 拖拽上傳區域 */}
                    <div
                      onDrop={(e) => handleImageDrop(e, 'hero')}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('hero-image-upload')?.click()}
                    >
                      <input
                        id="hero-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileSelect(e, 'hero')}
                      />
                      {homeConfigFormData.heroBackgroundImage ? (
                        <div>
                          <img
                            src={homeConfigFormData.heroBackgroundImage}
                            alt="預覽"
                            className="w-full h-48 object-cover rounded-md mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <p className="text-sm text-gray-600">點擊或拖拽圖片到此處更換</p>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">拖拽圖片到此處或點擊上傳</p>
                          <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF 格式</p>
                        </div>
                      )}
                    </div>
                    {/* 也可以手動輸入 URL */}
                    <input
                      type="url"
                      value={homeConfigFormData.heroBackgroundImage}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroBackgroundImage: e.target.value })}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      placeholder="或直接輸入圖片 URL"
                    />
                  </div>
                </div>
              </div>

              {/* 顏色主題設置 */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">顏色主題</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={homeConfigFormData.primaryColor}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, primaryColor: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={homeConfigFormData.primaryColor}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">輔助色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={homeConfigFormData.secondaryColor}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, secondaryColor: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={homeConfigFormData.secondaryColor}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">漸變起始色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={homeConfigFormData.gradientFrom}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, gradientFrom: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={homeConfigFormData.gradientFrom}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, gradientFrom: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">漸變結束色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={homeConfigFormData.gradientTo}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, gradientTo: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={homeConfigFormData.gradientTo}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, gradientTo: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 布局設置 */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">布局設置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">布局類型</label>
                    <select
                      value={homeConfigFormData.layout}
                      onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, layout: e.target.value as 'default' | 'compact' | 'wide' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="default">默認</option>
                      <option value="compact">緊湊</option>
                      <option value="wide">寬鬆</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={homeConfigFormData.showFeatures}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, showFeatures: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示特色區塊</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={homeConfigFormData.showGallery}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, showGallery: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示精選商品畫廊</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 區塊順序設置 */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">區塊順序</h3>
                <p className="text-sm text-gray-600 mb-4">拖拽調整首頁區塊的顯示順序</p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSectionOrderDragEnd}
                >
                  <SortableContext
                    items={homeConfigFormData.sectionOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {homeConfigFormData.sectionOrder.map((sectionId) => {
                        const sectionNames: Record<string, string> = {
                          hero: 'Hero 區域',
                          features: '特色區塊',
                          gallery: '精選商品',
                        };
                        return (
                          <SortableItem key={sectionId} id={sectionId}>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                                <span className="font-medium text-gray-900">{sectionNames[sectionId] || sectionId}</span>
                              </div>
                              <span className="text-xs text-gray-500">拖拽調整順序</span>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* 精選商品設置 */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">精選商品</h3>
                <p className="text-sm text-gray-600 mb-4">選擇要在首頁展示的商品（最多 8 個），可拖拽調整順序</p>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暫無商品，請先添加商品</p>
                ) : (
                  <>
                    {/* 已選擇的商品（可拖拽排序） */}
                    {homeConfigFormData.featuredProductIds.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">已選擇的商品（拖拽調整順序）</h4>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleFeaturedProductsDragEnd}
                        >
                          <SortableContext
                            items={homeConfigFormData.featuredProductIds}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {homeConfigFormData.featuredProductIds.map((productId) => {
                                const product = products.find(p => p.id === productId);
                                if (!product) return null;
                                return (
                                  <SortableItem key={productId} id={productId}>
                                    <div className="flex items-center p-3 bg-pink-50 border-2 border-pink-300 rounded-lg">
                                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                      <img
                                        src={product.image_url || 'https://via.placeholder.com/50x50'}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded mr-3"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">NT${product.price}</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHomeConfigFormData({
                                            ...homeConfigFormData,
                                            featuredProductIds: homeConfigFormData.featuredProductIds.filter(id => id !== productId),
                                          });
                                        }}
                                        className="ml-2 text-red-600 hover:text-red-800"
                                      >
                                        移除
                                      </button>
                                    </div>
                                  </SortableItem>
                                );
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}

                    {/* 可選擇的商品列表 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">選擇商品</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {products
                          .filter(p => !homeConfigFormData.featuredProductIds.includes(p.id))
                          .map((product) => (
                            <label
                              key={product.id}
                              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (homeConfigFormData.featuredProductIds.length < 8) {
                                      setHomeConfigFormData({
                                        ...homeConfigFormData,
                                        featuredProductIds: [...homeConfigFormData.featuredProductIds, product.id],
                                      });
                                    } else {
                                      alert('最多只能選擇 8 個精選商品');
                                    }
                                  }
                                }}
                                className="mr-3"
                              />
                              <img
                                src={product.image_url || 'https://via.placeholder.com/50x50'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">NT${product.price}</p>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>

                    {homeConfigFormData.featuredProductIds.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          已選擇 {homeConfigFormData.featuredProductIds.length} 個商品（可拖拽調整順序）
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 提交按鈕 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md shadow-lg"
                >
                  保存設置
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
