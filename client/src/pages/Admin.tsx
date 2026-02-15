import { useState, useEffect } from 'react';
import ImageCropper from '../components/ImageCropper';
import { firestoreService, Product, Order, Coupon, MembershipLevel, User, HomePageConfig, CustomBlock, uploadImage, downloadAndUploadImage } from '../services/firestore';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableItem } from '../components/SortableItem';
import { CollapsibleSection } from '../components/CollapsibleSection';

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

const Admin = () => {
  const { firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons' | 'membership' | 'users' | 'homepage'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [membershipLevels, setMembershipLevels] = useState<MembershipLevel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportButton, setShowImportButton] = useState(false);
  const [activeHomepageSection, setActiveHomepageSection] = useState<string>('hero');
  const [openHomepageSection, setOpenHomepageSection] = useState<string | null>('hero');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  // 首頁配置相關狀態
  const [homePageConfig, setHomePageConfig] = useState<HomePageConfig | null>(null);
  const [homeConfigFormData, setHomeConfigFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundImage: '',
    heroButtonText: '',
    heroButtonLink: '/products',
    heroCarouselEnabled: false,
    heroCarouselImages: [] as string[],
    heroCarouselSpeed: 3000,
    heroCarouselAutoPlay: true,
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
      { title: '時尚精選', description: '瀏覽我們精心挑選的女裝，涵蓋各種款式、尺碼和風格', icon: '👗', imageUrl: '', gradientFrom: '#EC4899', gradientTo: '#8B5CF6' },
      { title: '便捷購物', description: '簡單易用的購物車系統，輕鬆管理您想要購買的商品', icon: '🛒', imageUrl: '', gradientFrom: '#3B82F6', gradientTo: '#06B6D4' },
      { title: '安全可靠', description: '安全的支付系統和訂單管理，讓您購物無憂', icon: '🔒', imageUrl: '', gradientFrom: '#10B981', gradientTo: '#059669' },
    ] as Array<{ title: string; description: string; icon: string; imageUrl: string; gradientFrom: string; gradientTo: string }>,
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(null);
  const [featureFormData, setFeatureFormData] = useState({
    title: '',
    description: '',
    icon: '👗',
    imageUrl: '',
    gradientFrom: '#EC4899',
    gradientTo: '#8B5CF6',
  });
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showUserEditForm, setShowUserEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingMembership, setEditingMembership] = useState<MembershipLevel | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCustomBlockForm, setShowCustomBlockForm] = useState(false);
  const [editingCustomBlock, setEditingCustomBlock] = useState<CustomBlock | null>(null);
  const [customBlockFormData, setCustomBlockFormData] = useState({
    type: 'text' as 'text' | 'image' | 'product-grid' | 'banner' | 'html',
    title: '',
    content: '',
    imageUrl: '',
    productIds: [] as string[],
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    padding: '20px',
    margin: '0px',
    isVisible: true,
  });
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
    image_urls: [] as string[], // 懸停圖片列表
    external_image_url: '', // 外部圖片 URL 輸入框
    external_hover_image_url: '', // 外部懸停圖片 URL 輸入框
    category: ''
  });
  const [uploadingExternalImage, setUploadingExternalImage] = useState(false);
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
          heroCarouselEnabled: config.heroCarouselEnabled !== undefined ? config.heroCarouselEnabled : false,
          heroCarouselImages: config.heroCarouselImages || [],
          heroCarouselSpeed: config.heroCarouselSpeed || 3000,
          heroCarouselAutoPlay: config.heroCarouselAutoPlay !== undefined ? config.heroCarouselAutoPlay : true,
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
        heroCarouselEnabled: homeConfigFormData.heroCarouselEnabled,
        heroCarouselImages: homeConfigFormData.heroCarouselImages,
        heroCarouselSpeed: homeConfigFormData.heroCarouselSpeed,
        heroCarouselAutoPlay: homeConfigFormData.heroCarouselAutoPlay,
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
        customBlocks: homePageConfig?.customBlocks || [],
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
    }
  };

  // 特色區塊順序拖拽
  const handleFeaturesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeIndex = parseInt((active.id as string).replace('feature-', ''));
      const overIndex = parseInt((over.id as string).replace('feature-', ''));
      const newFeatures = arrayMove(homeConfigFormData.features, activeIndex, overIndex);
      setHomeConfigFormData({ ...homeConfigFormData, features: newFeatures });
    }
  };

  // 自訂區塊順序拖拽
  const handleCustomBlocksDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && homePageConfig?.customBlocks) {
      const blocks = [...homePageConfig.customBlocks];
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
      // 更新 order
      const updatedBlocks = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
      // 只更新本地狀態，不自動保存
      if (homePageConfig) {
        setHomePageConfig({ ...homePageConfig, customBlocks: updatedBlocks });
      }
      alert('區塊順序已更新，請點擊「保存」按鈕保存配置');
    }
  };


  // 更新預覽視窗的顏色
  const updatePreviewColors = (primary: string, secondary: string, gradientFrom: string, gradientTo: string) => {
    const iframe = document.getElementById('homepage-preview') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        // 通過 postMessage 傳遞顏色信息
        iframe.contentWindow.postMessage({
          type: 'updateColors',
          colors: {
            primary: primary,
            secondary: secondary,
            gradientFrom: gradientFrom,
            gradientTo: gradientTo,
          }
        }, '*');
      } catch (error) {
        console.error('更新預覽顏色失敗:', error);
      }
    }
  };

  // 圖片拖拽上傳處理
  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>, type: 'hero' | 'feature') => {
    e.preventDefault();
    
    // 檢查是否已登入
    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          setLoading(true);
          // 清理文件名，移除特殊字符
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `homepage/${type}/${Date.now()}_${sanitizedFileName}`;
          const url = await uploadImage(file, path);
          if (type === 'hero') {
            setHomeConfigFormData({ ...homeConfigFormData, heroBackgroundImage: url });
          }
          alert('圖片已上傳，請點擊「保存」按鈕保存配置');
        } catch (error: any) {
          console.error('圖片上傳失敗:', error);
          alert('圖片上傳失敗: ' + (error.message || '未知錯誤，請檢查 Firebase Storage 配置'));
        } finally {
          setLoading(false);
        }
      } else {
        alert('請上傳圖片文件（JPG、PNG、GIF 格式）');
      }
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'feature') => {
    // 檢查是否已登入
    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      e.target.value = '';
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        try {
          setLoading(true);
          // 清理文件名，移除特殊字符
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `homepage/${type}/${Date.now()}_${sanitizedFileName}`;
          const url = await uploadImage(file, path);
          if (type === 'hero') {
            setHomeConfigFormData({ ...homeConfigFormData, heroBackgroundImage: url });
          }
          alert('圖片已上傳，請點擊「保存」按鈕保存配置');
        } catch (error: any) {
          console.error('圖片上傳失敗:', error);
          alert('圖片上傳失敗: ' + (error.message || '未知錯誤，請檢查 Firebase Storage 配置'));
        } finally {
          setLoading(false);
        }
      } else {
        alert('請上傳圖片文件（JPG、PNG、GIF 格式）');
      }
    }
    // 重置 input，允許重複上傳同一文件
    e.target.value = '';
  };

  // 輪播圖片拖拽上傳處理
  const handleCarouselImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // 檢查是否已登入
    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      const remainingSlots = 10 - homeConfigFormData.heroCarouselImages.length;
      const filesToUpload = files.slice(0, remainingSlots);
      
      if (files.length > remainingSlots) {
        alert(`最多只能添加 10 張圖片，將上傳前 ${remainingSlots} 張`);
      }

      try {
        setLoading(true);
        const uploadPromises = filesToUpload.map(async (file) => {
          // 清理文件名
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `homepage/carousel/${Date.now()}_${Math.random().toString(36).substring(7)}_${sanitizedFileName}`;
          return await uploadImage(file, path);
        });
        
        const urls = await Promise.all(uploadPromises);
        const newImages = [...homeConfigFormData.heroCarouselImages, ...urls];
        setHomeConfigFormData({ ...homeConfigFormData, heroCarouselImages: newImages });
        alert(`成功上傳 ${urls.length} 張圖片！請點擊「保存」按鈕保存配置`);
      } catch (error: any) {
        console.error('圖片上傳失敗:', error);
        alert('圖片上傳失敗: ' + (error.message || '未知錯誤，請檢查 Firebase Storage 配置'));
      } finally {
        setLoading(false);
      }
    }
  };

  // 輪播圖片文件選擇處理
  const handleCarouselImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 檢查是否已登入
    if (!firebaseUser) {
      alert('請先登入管理員帳號');
      e.target.value = '';
      return;
    }

    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      const remainingSlots = 10 - homeConfigFormData.heroCarouselImages.length;
      const filesToUpload = files.slice(0, remainingSlots);
      
      if (files.length > remainingSlots) {
        alert(`最多只能添加 10 張圖片，將上傳前 ${remainingSlots} 張`);
      }

      try {
        setLoading(true);
        const uploadPromises = filesToUpload.map(async (file) => {
          // 清理文件名
          const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `homepage/carousel/${Date.now()}_${Math.random().toString(36).substring(7)}_${sanitizedFileName}`;
          return await uploadImage(file, path);
        });
        
        const urls = await Promise.all(uploadPromises);
        const newImages = [...homeConfigFormData.heroCarouselImages, ...urls];
        setHomeConfigFormData({ ...homeConfigFormData, heroCarouselImages: newImages });
        alert(`成功上傳 ${urls.length} 張圖片！請點擊「保存」按鈕保存配置`);
      } catch (error: any) {
        console.error('圖片上傳失敗:', error);
        alert('圖片上傳失敗: ' + (error.message || '未知錯誤，請檢查 Firebase Storage 配置'));
      } finally {
        setLoading(false);
      }
    }
    // 重置 input
    e.target.value = '';
  };

  // 輪播圖片順序拖拽
  const handleCarouselImagesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = homeConfigFormData.heroCarouselImages.indexOf(active.id as string);
      const newIndex = homeConfigFormData.heroCarouselImages.indexOf(over.id as string);
      const newOrder = arrayMove(homeConfigFormData.heroCarouselImages, oldIndex, newIndex);
      setHomeConfigFormData({ ...homeConfigFormData, heroCarouselImages: newOrder });
    }
  };

  // 將 base64 圖片上傳到 Firebase Storage
  const uploadBase64Image = async (base64String: string, type: 'main' | 'hover'): Promise<string> => {
    if (!firebaseUser) {
      throw new Error('請先登入管理員帳號');
    }

    try {
      // 將 base64 字符串轉換為 Blob
      const base64Data = base64String.split(',')[1] || base64String;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // 將 Blob 轉換為 File
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}_${randomStr}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      // 生成路徑
      const path = `products/${type === 'main' ? 'main' : 'hover'}/${fileName}`;
      
      // 上傳到 Firebase Storage
      const url = await uploadImage(file, path);
      return url;
    } catch (error: any) {
      console.error('上傳 base64 圖片失敗:', error);
      throw new Error('上傳圖片失敗: ' + (error.message || '未知錯誤'));
    }
  };

  const handleImageCrop = async (croppedImageUrl: string) => {
    // 如果是 base64 字符串（以 data: 開頭），需要上傳到 Storage
    if (croppedImageUrl.startsWith('data:')) {
      try {
        setLoading(true);
        console.log('開始上傳主圖...');
        const uploadedUrl = await uploadBase64Image(croppedImageUrl, 'main');
        console.log('主圖上傳成功，URL:', uploadedUrl);
        setProductFormData({ ...productFormData, image_url: uploadedUrl });
        // 不顯示 alert，避免打斷用戶操作
        // 使用 console.log 和視覺反饋（預覽圖片會自動顯示）
      } catch (error: any) {
        console.error('上傳圖片失敗:', error);
        alert('上傳圖片失敗: ' + (error.message || '未知錯誤') + '\n\n請檢查：\n1. 是否已登入管理員帳號\n2. Firebase Storage 配置是否正確\n3. 網絡連接是否正常');
        // 即使上傳失敗，也保存 base64 作為臨時預覽（但會提示用戶）
        setProductFormData({ ...productFormData, image_url: croppedImageUrl });
      } finally {
        setLoading(false);
      }
    } else {
      // 如果已經是 URL，直接使用
      console.log('使用現有 URL:', croppedImageUrl);
      setProductFormData({ ...productFormData, image_url: croppedImageUrl });
    }
  };

  const handleHoverImageCrop = async (croppedImageUrl: string) => {
    // 如果是 base64 字符串（以 data: 開頭），需要上傳到 Storage
    if (croppedImageUrl.startsWith('data:')) {
      try {
        setLoading(true);
        console.log('開始上傳懸停圖...');
        const uploadedUrl = await uploadBase64Image(croppedImageUrl, 'hover');
        console.log('懸停圖上傳成功，URL:', uploadedUrl);
        setProductFormData({ 
          ...productFormData, 
          image_urls: [...productFormData.image_urls, uploadedUrl] 
        });
        // 不顯示 alert，避免打斷用戶操作
      } catch (error: any) {
        console.error('上傳懸停圖片失敗:', error);
        alert('上傳懸停圖片失敗: ' + (error.message || '未知錯誤') + '\n\n請檢查：\n1. 是否已登入管理員帳號\n2. Firebase Storage 配置是否正確\n3. 網絡連接是否正常');
        // 即使上傳失敗，也保存 base64 作為臨時預覽（但會提示用戶）
        setProductFormData({ 
          ...productFormData, 
          image_urls: [...productFormData.image_urls, croppedImageUrl] 
        });
      } finally {
        setLoading(false);
      }
    } else {
      // 如果已經是 URL，直接使用
      console.log('使用現有懸停圖 URL:', croppedImageUrl);
      setProductFormData({ 
        ...productFormData, 
        image_urls: [...productFormData.image_urls, croppedImageUrl] 
      });
    }
  };

  // 處理外部圖片 URL 上傳（主圖）
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
        external_image_url: '', // 清空外部 URL 輸入框
      });
      alert('外部圖片已成功下載並上傳到 Firebase Storage！');
    } catch (error: any) {
      console.error('上傳外部圖片失敗:', error);
      alert('上傳失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setUploadingExternalImage(false);
    }
  };

  // 處理外部懸停圖片 URL 上傳
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
        external_hover_image_url: '', // 清空外部 URL 輸入框
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
    
    // 驗證必填字段
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

    // 檢查圖片是否還是 base64（未上傳成功）
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

    // 檢查懸停圖片是否還有 base64
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
        image_urls: productFormData.image_urls, // 懸停圖片列表
        category: productFormData.category.trim(),
      };

      if (editingProduct) {
        await firestoreService.updateProduct(editingProduct.id, productData);
        alert('✅ 商品已更新！');
      } else {
        await firestoreService.createProduct(productData);
        alert('✅ 商品已添加！');
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
      let errorMessage = '保存失敗，請檢查輸入';
      
      if (error.message?.includes('longer than') || error.message?.includes('1048487')) {
        errorMessage = '❌ 保存失敗：圖片文件過大。\n\n' +
          '請確保圖片已上傳到 Firebase Storage（不是 base64 格式）。\n\n' +
          '解決方法：\n' +
          '1. 重新裁切並上傳圖片\n' +
          '2. 或使用外部圖片 URL 功能上傳';
      } else if (error.message) {
        errorMessage = '保存失敗：' + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 批量導入範例商品
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

      // 顯示結果
      if (results.failed === 0) {
        alert(`✅ 成功導入 ${results.success} 個範例商品！`);
      } else {
        alert(
          `導入完成：\n✅ 成功: ${results.success} 個\n❌ 失敗: ${results.failed} 個\n\n失敗詳情：\n${results.errors.join('\n')}`
        );
      }

      // 刷新商品列表
      fetchProducts();
    } catch (error) {
      console.error('批量導入失敗:', error);
      alert('批量導入過程中發生錯誤，請查看控制台');
    } finally {
      setImporting(false);
      setShowImportButton(false);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 構建優惠券數據，過濾掉 undefined 值（Firestore 不支持 undefined）
      const couponData: any = {
        code: couponFormData.code,
        description: couponFormData.description,
        discount_type: couponFormData.discount_type,
        discount_value: parseFloat(couponFormData.discount_value),
        valid_from: Timestamp.fromDate(new Date(couponFormData.valid_from)),
        valid_until: Timestamp.fromDate(new Date(couponFormData.valid_until)),
        used_count: editingCoupon?.used_count || 0,
        is_active: couponFormData.is_active === 1,
      };

      // 只在有值時添加可選字段
      if (couponFormData.min_purchase && couponFormData.min_purchase.trim()) {
        couponData.min_purchase = parseFloat(couponFormData.min_purchase);
      }
      if (couponFormData.max_discount && couponFormData.max_discount.trim()) {
        couponData.max_discount = parseFloat(couponFormData.max_discount);
      }
      if (couponFormData.usage_limit && couponFormData.usage_limit.trim()) {
        couponData.usage_limit = parseInt(couponFormData.usage_limit);
      }

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
      alert('訂單狀態已更新！');
      fetchOrders(); // 重新獲取訂單列表
    } catch (error) {
      console.error('更新訂單狀態失敗:', error);
      alert('更新訂單狀態失敗，請重試');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '待付款',
      paid: '已付款',
      shipped: '已出貨',
      delivered: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    const errorMsg = document.createElement('p');
                                    errorMsg.className = 'text-xs text-red-600 mt-2';
                                    errorMsg.textContent = '❌ 圖片無法顯示，請重新上傳';
                                    parent.appendChild(errorMsg);
                                  }
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
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        NT${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.created_at && (order.created_at instanceof Timestamp 
                          ? order.created_at.toDate().toLocaleString('zh-TW')
                          : new Date(order.created_at).toLocaleString('zh-TW'))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                            onChange={(e) => {
                              if (confirm(`確定要將訂單 #${order.id.slice(0, 8)} 的狀態更改為「${getStatusText(e.target.value)}」嗎？`)) {
                                handleUpdateOrderStatus(order.id, e.target.value);
                              } else {
                                // 如果取消，恢復原值
                                e.target.value = order.status;
                              }
                            }}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                          >
                            <option value="pending">待付款</option>
                            <option value="paid">已付款</option>
                            <option value="shipped">已出貨</option>
                            <option value="delivered">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                          {order.items && order.items.length > 0 && (
                            <button
                              onClick={() => {
                                const itemsList = order.items.map((item) => 
                                  `  ${item.name || '商品'} x ${item.quantity} = NT$${(item.price * item.quantity).toFixed(2)}`
                                ).join('\n');
                                alert(`訂單詳情：\n\n${itemsList}\n\n總計：NT$${order.total_amount.toFixed(2)}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                              title="查看訂單詳情"
                            >
                              詳情
                            </button>
                          )}
                        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左邊：功能編輯區 */}
          <div className="lg:col-span-1">
            {/* 側邊導覽列 */}
            <div className="w-full mb-4">
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">功能導覽</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'hero', label: 'Hero 區域', icon: '🎯' },
                    { id: 'colors', label: '顏色主題', icon: '🎨' },
                    { id: 'layout', label: '布局設置', icon: '📐' },
                    { id: 'features', label: '特色區塊', icon: '⭐' },
                    { id: 'sections', label: '區塊順序', icon: '📋' },
                    { id: 'products', label: '精選商品', icon: '🛍️' },
                    { id: 'custom', label: '自訂區塊', icon: '🧩' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveHomepageSection(item.id);
                        setOpenHomepageSection(item.id);
                        // 滾動到對應區塊
                        setTimeout(() => {
                          const element = document.getElementById(`section-${item.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeHomepageSection === item.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* 主要內容區域 */}
            <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">加載中...</div>
            ) : (
              <form onSubmit={handleHomePageConfigSubmit} className="space-y-6">
                {/* ========== Hero 區域設置（包含輪播） ========== */}
                <CollapsibleSection
                  id="section-hero"
                  title="Hero 區域設置"
                  description="設置首頁 Hero 區域的標題、背景圖和輪播功能"
                  icon="🎯"
                  isOpen={openHomepageSection === 'hero'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'hero' ? null : 'hero')}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">主標題 *</label>
                      <input
                        type="text"
                        value={homeConfigFormData.heroTitle}
                        onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroTitle: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                        placeholder="時尚女裝精品店"
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
                        placeholder="發現最新時尚潮流，展現獨特個人風格"
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

                  {/* Hero 輪播設置 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold">Hero 輪播功能</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={homeConfigFormData.heroCarouselEnabled}
                          onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroCarouselEnabled: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">啟用輪播</span>
                      </label>
                    </div>

                    {homeConfigFormData.heroCarouselEnabled && (
                      <div className="space-y-4">
                        {/* 輪播速度設置 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              輪播速度（毫秒）
                            </label>
                            <input
                              type="number"
                              min="1000"
                              max="10000"
                              step="500"
                              value={homeConfigFormData.heroCarouselSpeed}
                              onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroCarouselSpeed: parseInt(e.target.value) || 3000 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                              placeholder="3000"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              建議值：2000-5000 毫秒（2-5秒）
                            </p>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={homeConfigFormData.heroCarouselAutoPlay}
                                onChange={(e) => setHomeConfigFormData({ ...homeConfigFormData, heroCarouselAutoPlay: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">自動播放</span>
                            </label>
                          </div>
                        </div>

                        {/* 輪播圖片管理 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            輪播圖片（最多 10 張，可拖拽排序）
                          </label>
                          <p className="text-xs text-gray-500 mb-3">
                            已添加 {homeConfigFormData.heroCarouselImages.length} / 10 張圖片
                          </p>

                          {/* 已添加的圖片列表 */}
                          {homeConfigFormData.heroCarouselImages.length > 0 && (
                            <div className="mb-4">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleCarouselImagesDragEnd}
                              >
                                <SortableContext
                                  items={homeConfigFormData.heroCarouselImages}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {homeConfigFormData.heroCarouselImages.map((imageUrl, index) => (
                                      <SortableItem key={imageUrl} id={imageUrl}>
                                        <div className="relative group">
                                          <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-gray-200">
                                            <img
                                              src={imageUrl}
                                              alt={`輪播圖 ${index + 1}`}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  if (window.confirm('確定要刪除這張輪播圖片嗎？')) {
                                                    try {
                                                      const newImages = homeConfigFormData.heroCarouselImages.filter(url => url !== imageUrl);
                                                      setHomeConfigFormData({ ...homeConfigFormData, heroCarouselImages: newImages });
                                                      alert('已刪除輪播圖片，請點擊「保存」按鈕保存配置');
                                                    } catch (error) {
                                                      console.error('刪除失敗:', error);
                                                      alert('刪除失敗，請重試');
                                                    }
                                                  }
                                                }}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                                              >
                                                刪除
                                              </button>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1 text-center">第 {index + 1} 張</p>
                                        </div>
                                      </SortableItem>
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            </div>
                          )}

                          {/* 上傳輪播圖片 */}
                          <div
                            onDrop={handleCarouselImageDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-500 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('carousel-image-upload')?.click()}
                          >
                            <input
                              id="carousel-image-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleCarouselImageFileSelect}
                            />
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">拖拽圖片到此處或點擊上傳</p>
                            <p className="text-xs text-gray-500 mt-1">支持批量上傳，最多 10 張</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* ========== 顏色主題 ========== */}
                <CollapsibleSection
                  id="section-colors"
                  title="顏色主題"
                  description="設置網站的主色調和漸變顏色"
                  icon="🎨"
                  isOpen={openHomepageSection === 'colors'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'colors' ? null : 'colors')}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">主色（按鈕顏色）</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={homeConfigFormData.primaryColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, primaryColor: newColor });
                              // 同步更新預覽
                              updatePreviewColors(newColor, homeConfigFormData.secondaryColor, homeConfigFormData.gradientFrom, homeConfigFormData.gradientTo);
                            }}
                            className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <input
                            type="text"
                            value={homeConfigFormData.primaryColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, primaryColor: newColor });
                              updatePreviewColors(newColor, homeConfigFormData.secondaryColor, homeConfigFormData.gradientFrom, homeConfigFormData.gradientTo);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm font-mono"
                            placeholder="#EC4899"
                          />
                        </div>
                        <div className="mt-2 h-8 rounded-md" style={{ backgroundColor: homeConfigFormData.primaryColor }}></div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">輔助色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={homeConfigFormData.secondaryColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, secondaryColor: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, newColor, homeConfigFormData.gradientFrom, homeConfigFormData.gradientTo);
                            }}
                            className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <input
                            type="text"
                            value={homeConfigFormData.secondaryColor}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, secondaryColor: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, newColor, homeConfigFormData.gradientFrom, homeConfigFormData.gradientTo);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm font-mono"
                            placeholder="#8B5CF6"
                          />
                        </div>
                        <div className="mt-2 h-8 rounded-md" style={{ backgroundColor: homeConfigFormData.secondaryColor }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">漸變起始色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={homeConfigFormData.gradientFrom}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, gradientFrom: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, homeConfigFormData.secondaryColor, newColor, homeConfigFormData.gradientTo);
                            }}
                            className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <input
                            type="text"
                            value={homeConfigFormData.gradientFrom}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, gradientFrom: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, homeConfigFormData.secondaryColor, newColor, homeConfigFormData.gradientTo);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm font-mono"
                            placeholder="#EC4899"
                          />
                        </div>
                        <div className="mt-2 h-8 rounded-md" style={{ backgroundColor: homeConfigFormData.gradientFrom }}></div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">漸變結束色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={homeConfigFormData.gradientTo}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, gradientTo: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, homeConfigFormData.secondaryColor, homeConfigFormData.gradientFrom, newColor);
                            }}
                            className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          />
                          <input
                            type="text"
                            value={homeConfigFormData.gradientTo}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setHomeConfigFormData({ ...homeConfigFormData, gradientTo: newColor });
                              updatePreviewColors(homeConfigFormData.primaryColor, homeConfigFormData.secondaryColor, homeConfigFormData.gradientFrom, newColor);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 text-sm font-mono"
                            placeholder="#8B5CF6"
                          />
                        </div>
                        <div className="mt-2 h-8 rounded-md" style={{ backgroundColor: homeConfigFormData.gradientTo }}></div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">漸變預覽：</div>
                      <div 
                        className="h-12 rounded-lg shadow-sm"
                        style={{ 
                          background: `linear-gradient(to right, ${homeConfigFormData.gradientFrom}, ${homeConfigFormData.gradientTo})` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* ========== 布局設置 ========== */}
                <CollapsibleSection
                  id="section-layout"
                  title="布局設置"
                  description="設置首頁布局類型和顯示選項"
                  icon="📐"
                  isOpen={openHomepageSection === 'layout'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'layout' ? null : 'layout')}
                >
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
                </CollapsibleSection>

                {/* ========== 特色區塊管理 ========== */}
                <CollapsibleSection
                  id="section-features"
                  title="特色區塊管理"
                  description="自定義首頁特色區塊的內容、圖標和樣式"
                  icon="⭐"
                  isOpen={openHomepageSection === 'features'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'features' ? null : 'features')}
                >
                  <div>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => {
                          setEditingFeatureIndex(null);
                          setFeatureFormData({
                            title: '',
                            description: '',
                            icon: '👗',
                            imageUrl: '',
                            gradientFrom: '#EC4899',
                            gradientTo: '#8B5CF6',
                          });
                          setShowFeatureForm(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium rounded-md shadow-sm"
                      >
                        + 新增特色區塊
                      </button>
                    </div>

                {/* 特色區塊列表 */}
                {homeConfigFormData.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">特色區塊列表（拖拽調整順序）</h4>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleFeaturesDragEnd}
                    >
                      <SortableContext
                        items={homeConfigFormData.features.map((_, index) => `feature-${index}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {homeConfigFormData.features.map((feature, index) => {
                            const FeatureItem = () => {
                              const {
                                attributes,
                                listeners,
                                setNodeRef,
                                transform,
                                transition,
                                isDragging,
                              } = useSortable({ id: `feature-${index}` });

                              const style = {
                                transform: CSS.Transform.toString(transform),
                                transition,
                                opacity: isDragging ? 0.5 : 1,
                              };

                              return (
                                <div
                                  ref={setNodeRef}
                                  style={style}
                                  {...attributes}
                                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors"
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div
                                      {...listeners}
                                      className="w-5 h-5 cursor-move flex-shrink-0"
                                      title="拖拽調整順序"
                                    >
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <div 
                                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md"
                                      style={{
                                        background: `linear-gradient(to right, ${feature.gradientFrom}, ${feature.gradientTo})`,
                                      }}
                                    >
                                      {feature.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-gray-900 truncate">{feature.title}</h5>
                                      <p className="text-sm text-gray-600 truncate">{feature.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingFeatureIndex(index);
                                        setFeatureFormData({
                                          title: feature.title,
                                          description: feature.description,
                                          icon: feature.icon,
                                          imageUrl: feature.imageUrl,
                                          gradientFrom: feature.gradientFrom,
                                          gradientTo: feature.gradientTo,
                                        });
                                        setShowFeatureForm(true);
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                      title="編輯特色區塊"
                                    >
                                      編輯
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm(`確定要刪除「${feature.title}」嗎？`)) {
                                          try {
                                            const newFeatures = homeConfigFormData.features.filter((_, i) => i !== index);
                                            setHomeConfigFormData({ ...homeConfigFormData, features: newFeatures });
                                            alert('已刪除特色區塊，請點擊「保存」按鈕保存配置');
                                          } catch (error) {
                                            console.error('刪除失敗:', error);
                                            alert('刪除失敗，請重試');
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm"
                                      title="刪除特色區塊"
                                    >
                                      刪除
                                    </button>
                                  </div>
                                </div>
                              );
                            };
                            return <FeatureItem key={index} />;
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}

                {/* 特色區塊編輯表單 */}
                {showFeatureForm && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg border-2 border-pink-300">
                    <h4 className="text-md font-semibold mb-4">
                      {editingFeatureIndex !== null ? '編輯特色區塊' : '新增特色區塊'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
                        <input
                          type="text"
                          value={featureFormData.title}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="例如：時尚精選"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">圖標 *</label>
                        <input
                          type="text"
                          value={featureFormData.icon}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, icon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="例如：👗"
                          maxLength={2}
                        />
                        <p className="text-xs text-gray-500 mt-1">輸入一個 emoji 圖標</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">描述 *</label>
                        <textarea
                          value={featureFormData.description}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="例如：精選最新流行女裝，涵蓋各種風格、尺碼和場合"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">背景圖片 URL</label>
                        <input
                          type="url"
                          value={featureFormData.imageUrl}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        <p className="text-xs text-gray-500 mt-1">可選，留空則使用漸變背景</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">漸變起始色</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={featureFormData.gradientFrom}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, gradientFrom: e.target.value })}
                            className="h-10 w-20 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={featureFormData.gradientFrom}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, gradientFrom: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                            placeholder="#EC4899"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">漸變結束色</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={featureFormData.gradientTo}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, gradientTo: e.target.value })}
                            className="h-10 w-20 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={featureFormData.gradientTo}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, gradientTo: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                            placeholder="#8B5CF6"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={async () => {
                          if (!featureFormData.title || !featureFormData.description || !featureFormData.icon) {
                            alert('請填寫所有必填欄位');
                            return;
                          }

                          const newFeatures = [...homeConfigFormData.features];
                          if (editingFeatureIndex !== null) {
                            newFeatures[editingFeatureIndex] = { ...featureFormData };
                          } else {
                            newFeatures.push({ ...featureFormData });
                          }

                          setHomeConfigFormData({ ...homeConfigFormData, features: newFeatures });
                          setShowFeatureForm(false);
                          setEditingFeatureIndex(null);
                          alert(editingFeatureIndex !== null ? '特色區塊已更新，請點擊「保存」按鈕保存配置' : '特色區塊已添加，請點擊「保存」按鈕保存配置');
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium rounded-md shadow-sm"
                      >
                        {editingFeatureIndex !== null ? '更新' : '添加'}
                      </button>
                      <button
                        onClick={() => {
                          setShowFeatureForm(false);
                          setEditingFeatureIndex(null);
                          setFeatureFormData({
                            title: '',
                            description: '',
                            icon: '👗',
                            imageUrl: '',
                            gradientFrom: '#EC4899',
                            gradientTo: '#8B5CF6',
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
                  </div>
                </CollapsibleSection>

                {/* ========== 區塊順序 ========== */}
                <CollapsibleSection
                  id="section-sections"
                  title="區塊順序"
                  description="拖拽調整首頁區塊的顯示順序"
                  icon="📋"
                  isOpen={openHomepageSection === 'sections'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'sections' ? null : 'sections')}
                >
                  <div>
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
                        // 檢查是否為自訂區塊
                        const customBlock = homePageConfig?.customBlocks?.find(b => b.id === sectionId);
                        const displayName = customBlock
                          ? `${customBlock.title || '自訂區塊'} (${customBlock.type})`
                          : sectionNames[sectionId] || sectionId;
                        return (
                          <SortableItem key={sectionId} id={sectionId}>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                                <span className="font-medium text-gray-900">{displayName}</span>
                                {customBlock && !customBlock.isVisible && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">隱藏</span>
                                )}
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
                </CollapsibleSection>

                {/* ========== 精選商品 ========== */}
                <CollapsibleSection
                  id="section-products"
                  title="精選商品"
                  description="選擇要在首頁展示的商品（最多 8 個），可拖拽調整順序"
                  icon="🛍️"
                  isOpen={openHomepageSection === 'products'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'products' ? null : 'products')}
                >
                  <div>
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
                                
                                // 使用 useSortable hook 來獲取拖拽功能
                                const FeaturedProductItem = () => {
                                  const {
                                    attributes,
                                    listeners,
                                    setNodeRef,
                                    transform,
                                    transition,
                                    isDragging,
                                  } = useSortable({ id: productId });

                                  const style = {
                                    transform: CSS.Transform.toString(transform),
                                    transition,
                                    opacity: isDragging ? 0.5 : 1,
                                  };

                                return (
                                    <div
                                      ref={setNodeRef}
                                      style={style}
                                      {...attributes}
                                      className="flex items-center p-3 bg-pink-50 border-2 border-pink-300 rounded-lg hover:bg-pink-100 transition-colors"
                                    >
                                      <div
                                        {...listeners}
                                        className="w-5 h-5 mr-3 cursor-move flex-shrink-0"
                                        title="拖拽調整順序"
                                      >
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                      </div>
                                      <img
                                        src={product.image_url || 'https://via.placeholder.com/50x50'}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded mr-3 flex-shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500">NT${product.price}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (window.confirm(`確定要移除「${product.name}」嗎？`)) {
                                            try {
                                              const newIds = homeConfigFormData.featuredProductIds.filter(id => id !== productId);
                                              setHomeConfigFormData({
                                                ...homeConfigFormData,
                                                featuredProductIds: newIds,
                                              });
                                              alert('已移除精選商品，請點擊「保存」按鈕保存配置');
                                            } catch (error) {
                                              console.error('移除失敗:', error);
                                              alert('移除失敗，請重試');
                                            }
                                          }
                                        }}
                                        className="ml-2 px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm hover:shadow-md flex-shrink-0"
                                        title="移除精選商品"
                                      >
                                        刪除
                                      </button>
                                    </div>
                                );
                                };

                                return <FeaturedProductItem key={productId} />;
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
                </CollapsibleSection>

                {/* ========== 自訂區塊管理 ========== */}
                <CollapsibleSection
                  id="section-custom"
                  title="自訂區塊管理"
                  description="新增和管理自訂首頁區塊"
                  icon="🧩"
                  isOpen={openHomepageSection === 'custom'}
                  onToggle={() => setOpenHomepageSection(openHomepageSection === 'custom' ? null : 'custom')}
                >
                  <div>
                    <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomBlock(null);
                      setCustomBlockFormData({
                        type: 'text',
                        title: '',
                        content: '',
                        imageUrl: '',
                        productIds: [],
                        backgroundColor: '#FFFFFF',
                        textColor: '#000000',
                        padding: '20px',
                        margin: '0px',
                        isVisible: true,
                      });
                      setShowCustomBlockForm(true);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-md shadow-md"
                  >
                    + 新增區塊
                  </button>
                </div>

                {/* 自訂區塊列表 */}
                {homePageConfig?.customBlocks && homePageConfig.customBlocks.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleCustomBlocksDragEnd}
                    >
                      <SortableContext
                        items={homePageConfig.customBlocks.map(b => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {homePageConfig.customBlocks
                          .sort((a, b) => a.order - b.order)
                          .map((block) => {
                            // 使用 useSortable hook 來獲取拖拽功能
                            const CustomBlockItem = () => {
                              const {
                                attributes,
                                listeners,
                                setNodeRef,
                                transform,
                                transition,
                                isDragging,
                              } = useSortable({ id: block.id });

                              const style = {
                                transform: CSS.Transform.toString(transform),
                                transition,
                                opacity: isDragging ? 0.5 : 1,
                              };

                              return (
                                <div
                                  ref={setNodeRef}
                                  style={style}
                                  {...attributes}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-pink-300 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div
                                      {...listeners}
                                      className="w-5 h-5 cursor-move flex-shrink-0"
                                      title="拖拽調整順序"
                                    >
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                          {block.title || `區塊 (${block.type})`}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
                                          {block.type}
                                        </span>
                                        {!block.isVisible && (
                                          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">隱藏</span>
                                        )}
                                      </div>
                                      {block.content && (
                                        <p className="text-sm text-gray-500 mt-1 truncate">{block.content.substring(0, 50)}...</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingCustomBlock(block);
                                        setCustomBlockFormData({
                                          type: block.type,
                                          title: block.title || '',
                                          content: block.content || '',
                                          imageUrl: block.imageUrl || '',
                                          productIds: block.productIds || [],
                                          backgroundColor: block.backgroundColor || '#FFFFFF',
                                          textColor: block.textColor || '#000000',
                                          padding: block.padding || '20px',
                                          margin: block.margin || '0px',
                                          isVisible: block.isVisible,
                                        });
                                        setShowCustomBlockForm(true);
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                      title="編輯區塊"
                                    >
                                      編輯
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm(`確定要刪除「${block.title || `區塊 (${block.type})`}」嗎？`)) {
                                          try {
                                            const updatedBlocks = (homePageConfig?.customBlocks || []).filter(b => b.id !== block.id);
                                            const updatedSectionOrder = homeConfigFormData.sectionOrder.filter(id => id !== block.id);
                                            // 同步更新本地狀態
                                            setHomeConfigFormData({
                                              ...homeConfigFormData,
                                              sectionOrder: updatedSectionOrder,
                                            });
                                            // 只更新本地狀態，不自動保存
                                            if (homePageConfig) {
                                              setHomePageConfig({ ...homePageConfig, customBlocks: updatedBlocks });
                                            }
                                            alert('已刪除自訂區塊，請點擊「保存」按鈕保存配置');
                                          } catch (error) {
                                            console.error('刪除失敗:', error);
                                            alert('刪除失敗，請重試');
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm hover:shadow-md"
                                      title="刪除區塊"
                                    >
                                      刪除
                                    </button>
                                  </div>
                                </div>
                              );
                            };

                            return <CustomBlockItem key={block.id} />;
                          })}
                      </SortableContext>
                    </DndContext>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>暫無自訂區塊，點擊「新增區塊」開始創建</p>
                  </div>
                )}

                {/* 自訂區塊表單 */}
                {showCustomBlockForm && (
                <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-pink-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingCustomBlock ? '編輯區塊' : '新增區塊'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomBlockForm(false);
                        setEditingCustomBlock(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">區塊類型 *</label>
                      <select
                        value={customBlockFormData.type}
                        onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="text">文字區塊</option>
                        <option value="image">圖片區塊</option>
                        <option value="product-grid">商品網格</option>
                        <option value="banner">橫幅廣告</option>
                        <option value="html">HTML 區塊</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                      <input
                        type="text"
                        value={customBlockFormData.title}
                        onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                        placeholder="區塊標題（選填）"
                      />
                    </div>

                    {(customBlockFormData.type === 'text' || customBlockFormData.type === 'html') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {customBlockFormData.type === 'html' ? 'HTML 內容' : '文字內容'} *
                        </label>
                        <textarea
                          value={customBlockFormData.content}
                          onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, content: e.target.value })}
                          rows={customBlockFormData.type === 'html' ? 8 : 4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder={customBlockFormData.type === 'html' ? '輸入 HTML 代碼' : '輸入文字內容'}
                          required={customBlockFormData.type === 'text'}
                        />
                      </div>
                    )}

                    {(customBlockFormData.type === 'image' || customBlockFormData.type === 'banner') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">圖片 URL *</label>
                        <input
                          type="url"
                          value={customBlockFormData.imageUrl}
                          onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                        {customBlockFormData.imageUrl && (
                          <img
                            src={customBlockFormData.imageUrl}
                            alt="預覽"
                            className="mt-2 w-full h-48 object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    )}

                    {customBlockFormData.type === 'product-grid' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">選擇商品 *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                          {products.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={customBlockFormData.productIds.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCustomBlockFormData({
                                      ...customBlockFormData,
                                      productIds: [...customBlockFormData.productIds, product.id],
                                    });
                                  } else {
                                    setCustomBlockFormData({
                                      ...customBlockFormData,
                                      productIds: customBlockFormData.productIds.filter(id => id !== product.id),
                                    });
                                  }
                                }}
                                className="mr-2"
                              />
                              <img
                                src={product.image_url || 'https://via.placeholder.com/40x40'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded mr-2"
                              />
                              <span className="text-sm truncate">{product.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">背景顏色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customBlockFormData.backgroundColor}
                            onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, backgroundColor: e.target.value })}
                            className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customBlockFormData.backgroundColor}
                            onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">文字顏色</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customBlockFormData.textColor}
                            onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, textColor: e.target.value })}
                            className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customBlockFormData.textColor}
                            onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">內距 (padding)</label>
                        <input
                          type="text"
                          value={customBlockFormData.padding}
                          onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, padding: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="20px"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">外距 (margin)</label>
                        <input
                          type="text"
                          value={customBlockFormData.margin}
                          onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, margin: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                          placeholder="0px"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customBlockFormData.isVisible}
                          onChange={(e) => setCustomBlockFormData({ ...customBlockFormData, isVisible: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">顯示此區塊</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomBlockForm(false);
                          setEditingCustomBlock(null);
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (customBlockFormData.type === 'text' && !customBlockFormData.content) {
                            alert('請輸入文字內容');
                            return;
                          }
                          if ((customBlockFormData.type === 'image' || customBlockFormData.type === 'banner') && !customBlockFormData.imageUrl) {
                            alert('請輸入圖片 URL');
                            return;
                          }
                          if (customBlockFormData.type === 'product-grid' && customBlockFormData.productIds.length === 0) {
                            alert('請至少選擇一個商品');
                            return;
                          }

                          const existingBlocks = homePageConfig?.customBlocks || [];
                          let updatedBlocks: CustomBlock[];

                          if (editingCustomBlock) {
                            // 編輯現有區塊
                            updatedBlocks = existingBlocks.map(block =>
                              block.id === editingCustomBlock.id
                                ? {
                                    ...editingCustomBlock,
                                    ...customBlockFormData,
                                    order: editingCustomBlock.order,
                                  }
                                : block
                            );
                          } else {
                            // 新增區塊
                            const newBlock: CustomBlock = {
                              id: `custom-block-${Date.now()}`,
                              ...customBlockFormData,
                              order: existingBlocks.length,
                            };
                            updatedBlocks = [...existingBlocks, newBlock];
                            // 將新區塊加入 sectionOrder
                            const newSectionOrder = [...homeConfigFormData.sectionOrder, newBlock.id];
                            setHomeConfigFormData({ ...homeConfigFormData, sectionOrder: newSectionOrder });
                          }

                          // 只更新本地狀態，不自動保存
                          if (homePageConfig) {
                            setHomePageConfig({ ...homePageConfig, customBlocks: updatedBlocks });
                          }
                          setShowCustomBlockForm(false);
                          setEditingCustomBlock(null);
                          alert(editingCustomBlock ? '自訂區塊已更新，請點擊「保存」按鈕保存配置' : '自訂區塊已新增，請點擊「保存」按鈕保存配置');
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-md shadow-md"
                      >
                        {editingCustomBlock ? '更新' : '新增'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
                  </div>
                </CollapsibleSection>

                {/* 提交按鈕 */}
                <div className="flex justify-end space-x-4 mt-6">
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
          </div>

          {/* 右邊：預覽視窗 */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">即時預覽</h3>
                <div className="flex items-center gap-2">
                  {/* 預覽模式切換 */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        previewMode === 'mobile'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📱 手機
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        previewMode === 'desktop'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      💻 電腦
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const iframe = document.getElementById('homepage-preview') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src; // 重新載入預覽
                      }
                    }}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                  >
                    刷新
                  </button>
                </div>
              </div>
              <div 
                className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 mx-auto"
                style={previewMode === 'mobile' 
                  ? { aspectRatio: '9/16', maxHeight: '80vh', width: '100%' }
                  : { aspectRatio: '16/9', maxHeight: '80vh', width: '100%' }
                }
              >
                <iframe
                  id="homepage-preview"
                  key={`preview-${previewMode}-${homeConfigFormData.primaryColor}-${homeConfigFormData.gradientFrom}-${homeConfigFormData.gradientTo}`}
                  src={`/?preview=true&primary=${encodeURIComponent(homeConfigFormData.primaryColor)}&gradientFrom=${encodeURIComponent(homeConfigFormData.gradientFrom)}&gradientTo=${encodeURIComponent(homeConfigFormData.gradientTo)}`}
                  className={`w-full h-full border-0 ${
                    previewMode === 'mobile' 
                      ? 'transform scale-75 origin-top-left'
                      : 'transform scale-50 origin-top-left'
                  }`}
                  style={previewMode === 'mobile'
                    ? { width: '133.33%', height: '133.33%' }
                    : { width: '200%', height: '200%' }
                  }
                  title="首頁預覽"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                預覽比例：{previewMode === 'mobile' ? '手機版（9:16）' : '電腦版（16:9）'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
