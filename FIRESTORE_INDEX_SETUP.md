# Firestore 索引設置指南

## 問題說明

當使用 Firestore 進行復合查詢（同時使用 `where` 和 `orderBy`）時，需要創建對應的複合索引。

## 錯誤訊息

```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/tung-315/firestore/indexes...
```

## 解決方案

### 方法 1：通過錯誤訊息鏈接創建（推薦）

1. 當錯誤發生時，點擊錯誤訊息中的鏈接
2. 瀏覽器會自動打開 Firebase Console
3. 點擊「創建索引」按鈕
4. 等待索引創建完成（通常需要幾分鐘）

### 方法 2：手動創建索引

1. 登錄 [Firebase Console](https://console.firebase.google.com/)
2. 選擇項目：`tung-315`
3. 進入 **Firestore Database** > **索引** 標籤
4. 點擊 **創建索引**
5. 填寫以下信息：
   - **集合 ID**: `orders`
   - **查詢範圍**: 集合
   - **欄位**:
     - `user_id` - 升序 (Ascending)
     - `created_at` - 降序 (Descending)
6. 點擊 **創建**

### 方法 3：使用 Firebase CLI

如果您使用 Firebase CLI，可以創建 `firestore.indexes.json` 文件：

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "user_id",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "created_at",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

然後運行：
```bash
firebase deploy --only firestore:indexes
```

## 需要的索引

### 訂單查詢索引

**集合**: `orders`
**欄位**:
- `user_id` (Ascending)
- `created_at` (Descending)

**用途**: 查詢特定用戶的訂單，按創建時間降序排列

## 索引創建時間

- 小型數據集：通常 1-5 分鐘
- 大型數據集：可能需要 10-30 分鐘或更長

創建完成後，您會收到郵件通知。

## 臨時解決方案

代碼已經包含備用方案：
- 如果索引不存在，會先查詢所有匹配的訂單
- 然後在客戶端按創建時間排序
- 這可以讓應用在索引創建期間繼續工作

**注意**: 備用方案的性能較差，建議盡快創建索引。

## 驗證索引

創建索引後：
1. 刷新應用
2. 訪問訂單頁面
3. 檢查是否還有錯誤
4. 如果仍有錯誤，等待幾分鐘讓索引完全生效

## 其他可能需要創建的索引

如果將來添加了其他復合查詢，可能需要創建更多索引：

### 商品查詢索引（如果使用）

**集合**: `products`
**欄位**:
- `category` (Ascending)
- `created_at` (Descending)

### 優惠券查詢索引（如果使用）

**集合**: `coupons`
**欄位**:
- `is_active` (Ascending)
- `valid_until` (Ascending)

## 常見問題

### Q: 索引創建需要多長時間？
A: 通常 1-5 分鐘，但大型數據集可能需要更長時間。

### Q: 索引創建期間應用還能使用嗎？
A: 可以，代碼包含備用方案，但性能會稍差。

### Q: 如何知道索引是否創建成功？
A: 在 Firebase Console 的索引頁面查看狀態，顯示「已啟用」即表示成功。

### Q: 索引會影響性能嗎？
A: 不會，索引實際上會提升查詢性能。

## 相關文檔

- [Firestore 索引文檔](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Console](https://console.firebase.google.com/)
