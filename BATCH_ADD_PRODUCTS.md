# 批量添加女裝範例商品指南

## 方法 1: 使用瀏覽器控制台批量添加（最快）

### 步驟 1: 登錄管理後台

1. 打開您的網站
2. 登錄您的帳號（確保是管理員帳號）
3. 進入「管理後台」頁面
4. 打開瀏覽器開發者工具（按 F12）
5. 切換到「Console」標籤

### 步驟 2: 複製並運行腳本

在控制台中複製並運行以下代碼：

```javascript
// 批量添加女裝範例商品
const exampleProducts = [
  {
    name: '優雅氣質長袖連衣裙',
    description: '經典優雅的長袖連衣裙，採用優質面料，適合各種正式場合。修身剪裁，展現女性優雅氣質。精緻細節設計，讓您在任何場合都散發自信魅力。',
    price: 1280,
    stock: 50,
    category: '連衣裙',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
  },
  {
    name: '簡約百搭白襯衫',
    description: '經典白襯衫，簡約百搭，適合職場和日常穿搭。優質棉質面料，舒適透氣。精緻剪裁，展現專業與優雅。',
    price: 680,
    stock: 80,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80'
  },
  {
    name: '舒適休閒短袖T恤',
    description: '柔軟舒適的休閒T恤，多種顏色可選。適合日常休閒穿搭，輕鬆自在。優質面料，親膚舒適。',
    price: 380,
    stock: 100,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
  },
  {
    name: '時尚高腰闊腿褲',
    description: '時尚高腰設計，闊腿剪裁，修飾腿型。優質面料，舒適透氣，適合多種場合。展現優雅氣質與時尚品味。',
    price: 980,
    stock: 60,
    category: '褲裝',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'
  },
  {
    name: '溫柔針織開衫外套',
    description: '柔軟針織面料，溫柔優雅。適合春秋季節，可搭配各種內搭，展現溫柔氣質。舒適保暖，時尚百搭。',
    price: 890,
    stock: 45,
    category: '外套',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'
  },
  {
    name: 'A字半身裙',
    description: '經典A字版型，修飾腰臀線條。多種顏色可選，適合搭配各種上衣，展現優雅氣質。優質面料，舒適貼身。',
    price: 750,
    stock: 70,
    category: '裙裝',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
  },
  {
    name: '修身彈力牛仔褲',
    description: '經典牛仔褲，修身剪裁，彈力面料。百搭單品，適合各種場合和風格。優質牛仔面料，耐穿舒適。',
    price: 880,
    stock: 90,
    category: '褲裝',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'
  },
  {
    name: '經典風衣外套',
    description: '經典風衣設計，防風防雨。優質面料，精緻工藝，適合春秋季節，展現優雅氣質。多種顏色可選。',
    price: 1580,
    stock: 35,
    category: '外套',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'
  },
  {
    name: '優雅無袖連衣裙',
    description: '清爽無袖設計，適合夏季穿著。優雅剪裁，展現女性魅力。優質面料，舒適透氣，適合各種場合。',
    price: 980,
    stock: 55,
    category: '連衣裙',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
  },
  {
    name: '時尚條紋T恤',
    description: '經典條紋設計，時尚百搭。優質面料，舒適親膚。適合日常休閒穿搭，展現青春活力。',
    price: 420,
    stock: 85,
    category: '上衣',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
  }
];

// 導入 Firestore 服務（需要確保在管理後台頁面）
async function batchAddProducts() {
  try {
    // 獲取 firestoreService（需要從頁面中獲取）
    const { firestoreService } = await import('./services/firestore');
    
    console.log('開始批量添加商品...');
    const results = [];
    
    for (const product of exampleProducts) {
      try {
        const productId = await firestoreService.createProduct(product);
        results.push({ success: true, name: product.name, id: productId });
        console.log(`✅ 已添加: ${product.name}`);
      } catch (error) {
        results.push({ success: false, name: product.name, error });
        console.error(`❌ 添加失敗: ${product.name}`, error);
      }
    }
    
    console.log('批量添加完成！', results);
    alert(`成功添加 ${results.filter(r => r.success).length} 個商品！`);
    
    // 刷新頁面以顯示新商品
    window.location.reload();
  } catch (error) {
    console.error('批量添加失敗:', error);
    alert('批量添加失敗，請檢查控制台錯誤信息');
  }
}

// 運行批量添加
batchAddProducts();
```

**注意**: 上面的腳本需要訪問 `firestoreService`，但由於模塊系統的限制，可能無法直接運行。

## 方法 2: 使用簡化版本（推薦）

在管理後台頁面的控制台中運行以下代碼：

```javascript
// 簡化版批量添加腳本
(async function() {
  const products = [
    { name: '優雅氣質長袖連衣裙', description: '經典優雅的長袖連衣裙，採用優質面料，適合各種正式場合。修身剪裁，展現女性優雅氣質。', price: 1280, stock: 50, category: '連衣裙', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
    { name: '簡約百搭白襯衫', description: '經典白襯衫，簡約百搭，適合職場和日常穿搭。優質棉質面料，舒適透氣。', price: 680, stock: 80, category: '上衣', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80' },
    { name: '舒適休閒短袖T恤', description: '柔軟舒適的休閒T恤，多種顏色可選。適合日常休閒穿搭，輕鬆自在。', price: 380, stock: 100, category: '上衣', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' },
    { name: '時尚高腰闊腿褲', description: '時尚高腰設計，闊腿剪裁，修飾腿型。優質面料，舒適透氣，適合多種場合。', price: 980, stock: 60, category: '褲裝', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80' },
    { name: '溫柔針織開衫外套', description: '柔軟針織面料，溫柔優雅。適合春秋季節，可搭配各種內搭，展現溫柔氣質。', price: 890, stock: 45, category: '外套', image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80' },
    { name: 'A字半身裙', description: '經典A字版型，修飾腰臀線條。多種顏色可選，適合搭配各種上衣，展現優雅氣質。', price: 750, stock: 70, category: '裙裝', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
    { name: '修身彈力牛仔褲', description: '經典牛仔褲，修身剪裁，彈力面料。百搭單品，適合各種場合和風格。', price: 880, stock: 90, category: '褲裝', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80' },
    { name: '經典風衣外套', description: '經典風衣設計，防風防雨。優質面料，精緻工藝，適合春秋季節，展現優雅氣質。', price: 1580, stock: 35, category: '外套', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80' },
    { name: '優雅無袖連衣裙', description: '清爽無袖設計，適合夏季穿著。優雅剪裁，展現女性魅力。優質面料，舒適透氣。', price: 980, stock: 55, category: '連衣裙', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
    { name: '時尚條紋T恤', description: '經典條紋設計，時尚百搭。優質面料，舒適親膚。適合日常休閒穿搭，展現青春活力。', price: 420, stock: 85, category: '上衣', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' }
  ];
  
  // 這個方法需要通過頁面的實際 API 調用
  // 由於無法直接訪問模塊，建議使用方法 3
  console.log('商品數據已準備:', products);
  console.log('請使用方法 3 手動添加，或聯繫開發者創建批量添加功能');
})();
```

## 方法 3: 手動添加（最可靠）

1. **登錄管理後台**
   - 打開網站
   - 登錄您的帳號
   - 點擊「管理後台」

2. **進入商品管理**
   - 點擊「商品管理」標籤
   - 點擊「新增商品」按鈕

3. **添加商品**
   - 按照 `EXAMPLE_PRODUCTS.md` 中的商品信息填寫
   - 每個商品大約需要 1-2 分鐘
   - 建議先添加 3-5 個商品作為範例

4. **設置精選商品**
   - 進入「首頁設計」標籤
   - 在「精選商品」區域選擇已添加的商品
   - 保存配置

## 快速登錄指南

### 如果您還沒有管理員帳號：

1. **註冊新帳號**
   - 在網站首頁點擊「註冊」
   - 填寫用戶名、郵箱、密碼
   - 點擊「註冊」

2. **設置為管理員**
   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇專案 `tung-315`
   - 進入 **Firestore Database** > `users` 集合
   - 找到您的用戶文檔（通過 email 查找）
   - 將 `role` 字段改為 `admin`
   - 保存

3. **驗證**
   - 刷新網站
   - 重新登錄
   - 應該能看到「管理後台」按鈕

## 需要幫助？

如果您在操作過程中遇到任何問題，請告訴我：
- 您當前的登錄狀態
- 是否能看到「管理後台」按鈕
- 遇到的具體錯誤信息

我可以為您提供更詳細的指導。
