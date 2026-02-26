# 后台访问控制说明

## 功能概述

已实现以下安全措施：

1. **隐藏所有入口**：UI 界面中已删除所有前往 `/admin` 的按钮和链接
2. **强化路由守卫**：非管理员访问 `/admin` 路径时，直接重定向到首页，不显示任何提示
3. **总部验证**：支持从 edward727.com 通过 URL token 验证后访问管理后台

## 总部验证使用方式

### 从 edward727.com 跳转访问

在 edward727.com 生成包含验证 token 的链接，格式如下：

```
https://your-store-domain.com/admin?admin_token=YOUR_SECRET_TOKEN
```

或

```
https://your-store-domain.com/admin?token=YOUR_SECRET_TOKEN
```

### 验证逻辑

1. 系统会自动检测 URL 中的 `admin_token` 或 `token` 参数
2. 验证 token 的有效性
3. 如果验证通过，将验证状态存储到 sessionStorage（有效期 1 小时）
4. 自动清除 URL 中的 token 参数（保护隐私）

### 配置验证密钥

在 `.env` 文件中设置：

```env
VITE_HEADQUARTERS_SECRET=your-secret-key-here
```

如果不设置，将使用默认密钥（仅用于开发测试）。

### 生产环境建议

在生产环境中，建议：

1. 将验证密钥存储在环境变量中
2. 实现调用 edward727.com 的 API 来验证 token（而不是简单的字符串比较）
3. 使用 HTTPS 确保传输安全
4. 考虑实现 token 的过期时间和刷新机制

### 修改验证逻辑

如需修改验证逻辑，请编辑 `client/src/utils/adminAuth.ts` 文件中的 `verifyHeadquartersToken` 函数。

例如，调用 edward727.com 的 API：

```typescript
export const verifyHeadquartersToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('https://edward727.com/api/verify-admin-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('验证总部 token 失败:', error);
    return false;
  }
};
```

## 安全说明

- 验证状态存储在 sessionStorage 中，关闭浏览器标签页后失效
- 验证状态有效期为 1 小时
- URL 中的 token 参数会在验证后自动清除
- 非管理员用户无法通过任何 UI 入口访问后台
- 即使知道 `/admin` 路径，非管理员也会被自动重定向到首页
