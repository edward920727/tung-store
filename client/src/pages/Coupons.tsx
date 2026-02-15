import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, Coupon, UserCoupon } from '../services/firestore';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Timestamp } from 'firebase/firestore';

const Coupons = () => {
  const { user, firebaseUser } = useAuth();
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    if (firebaseUser) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const fetchData = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const [available, my] = await Promise.all([
        firestoreService.getAvailableCoupons(),
        firestoreService.getUserCoupons(firebaseUser.uid),
      ]);
      setAvailableCoupons(available);
      setMyCoupons(my);
    } catch (error) {
      console.error('獲取優惠券失敗:', error);
      showError('獲取優惠券失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCoupon = async (couponId: string) => {
    if (!firebaseUser) {
      showError('請先登錄');
      return;
    }

    try {
      await firestoreService.claimCoupon(firebaseUser.uid, couponId);
      success('優惠券領取成功！');
      fetchData();
    } catch (err: any) {
      console.error('領取優惠券失敗:', err);
      showError(err.message || '領取失敗，請稍後再試');
    }
  };

  const isCouponClaimed = (couponId: string): boolean => {
    return myCoupons.some(uc => uc.coupon_id === couponId && !uc.used);
  };

  const formatDate = (timestamp: Timestamp | Date): string => {
    const date = timestamp instanceof Timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = (coupon: Coupon): boolean => {
    const now = new Date();
    const validUntil = coupon.valid_until instanceof Timestamp 
      ? coupon.valid_until.toDate() 
      : new Date(coupon.valid_until);
    return now > validUntil;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">請先登錄以查看優惠券</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">優惠券</h1>

        {/* 標籤切換 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              可領取優惠券 ({availableCoupons.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              我的優惠券 ({myCoupons.length})
            </button>
          </nav>
        </div>

        {/* 可領取優惠券 */}
        {activeTab === 'available' && (
          <div>
            {availableCoupons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">目前沒有可領取的優惠券</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCoupons.map((coupon) => {
                  const claimed = isCouponClaimed(coupon.id);
                  const expired = isExpired(coupon);
                  
                  return (
                    <div
                      key={coupon.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-all"
                    >
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-bold">{coupon.code}</h3>
                          <div className="text-right">
                            {coupon.discount_type === 'percentage' ? (
                              <span className="text-3xl font-bold">
                                {coupon.discount_value}%
                              </span>
                            ) : (
                              <span className="text-3xl font-bold">
                                NT${coupon.discount_value}
                              </span>
                            )}
                          </div>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-pink-100 mt-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {coupon.min_purchase && (
                            <div className="flex items-center">
                              <span className="mr-2">📦</span>
                              <span>滿 NT${coupon.min_purchase} 可用</span>
                            </div>
                          )}
                          {coupon.max_discount && coupon.discount_type === 'percentage' && (
                            <div className="flex items-center">
                              <span className="mr-2">💰</span>
                              <span>最高折扣 NT${coupon.max_discount}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>有效期至 {formatDate(coupon.valid_until)}</span>
                          </div>
                          {coupon.usage_limit && (
                            <div className="flex items-center">
                              <span className="mr-2">🎫</span>
                              <span>
                                剩餘 {coupon.usage_limit - coupon.used_count} 張
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleClaimCoupon(coupon.id)}
                          disabled={claimed || expired}
                          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                            claimed
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : expired
                              ? 'bg-red-100 text-red-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                          }`}
                        >
                          {claimed ? '已領取' : expired ? '已過期' : '立即領取'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 我的優惠券 */}
        {activeTab === 'my' && (
          <div>
            {myCoupons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500 mb-4">您還沒有領取任何優惠券</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-md"
                >
                  去領取優惠券
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCoupons.map((userCoupon) => {
                  if (!userCoupon.coupon) return null;
                  
                  const coupon = userCoupon.coupon;
                  const expired = isExpired(coupon);
                  
                  return (
                    <div
                      key={userCoupon.id}
                      className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
                        userCoupon.used
                          ? 'border-gray-300 opacity-60'
                          : expired
                          ? 'border-red-300'
                          : 'border-green-300 hover:border-green-400'
                      } transition-all`}
                    >
                      <div
                        className={`p-6 text-white ${
                          userCoupon.used
                            ? 'bg-gray-400'
                            : expired
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-bold">{coupon.code}</h3>
                          <div className="text-right">
                            {userCoupon.used && (
                              <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded">
                                已使用
                              </span>
                            )}
                            {!userCoupon.used && expired && (
                              <span className="text-xs bg-white text-red-600 px-2 py-1 rounded">
                                已過期
                              </span>
                            )}
                            {!userCoupon.used && !expired && (
                              <span className="text-xs bg-white text-green-600 px-2 py-1 rounded">
                                可使用
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          {coupon.discount_type === 'percentage' ? (
                            <span className="text-3xl font-bold">
                              {coupon.discount_value}%
                            </span>
                          ) : (
                            <span className="text-3xl font-bold">
                              NT${coupon.discount_value}
                            </span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-white/90 mt-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {coupon.min_purchase && (
                            <div className="flex items-center">
                              <span className="mr-2">📦</span>
                              <span>滿 NT${coupon.min_purchase} 可用</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>有效期至 {formatDate(coupon.valid_until)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">⏰</span>
                            <span>
                              領取時間：{' '}
                              {formatDate(userCoupon.claimed_at)}
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          {userCoupon.used ? (
                            <span className="text-gray-500 text-sm">
                              已在結帳時使用
                            </span>
                          ) : expired ? (
                            <span className="text-red-600 text-sm">
                              優惠券已過期
                            </span>
                          ) : (
                            <span className="text-green-600 text-sm font-medium">
                              ✓ 可在結帳時使用
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Coupons;
