import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService, MembershipLevel } from '../services/firestore';

const Membership = () => {
  const { user, firebaseUser } = useAuth();
  const [membershipInfo, setMembershipInfo] = useState<{
    user: any;
    membership: MembershipLevel;
  } | null>(null);
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      fetchMembershipInfo();
      fetchLevels();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const fetchMembershipInfo = async () => {
    if (!firebaseUser) return;
    try {
      const info = await firestoreService.getUserMembership(firebaseUser.uid);
      setMembershipInfo(info);
    } catch (error) {
      console.error('獲取會員信息失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const membershipLevels = await firestoreService.getMembershipLevels();
      setLevels(membershipLevels);
    } catch (error) {
      console.error('獲取會員等級失敗:', error);
      setLevels([]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加載中...</div>
      </div>
    );
  }

  if (!membershipInfo || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">無法獲取會員信息</div>
      </div>
    );
  }

  const { user: userData, membership } = membershipInfo;
  const nextLevel = levels.find(l => l.min_points > (userData.points || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的會員</h1>

      {/* 當前會員等級卡片 */}
      <div className="bg-white shadow-xl rounded-lg p-8 mb-8 border-2" style={{ borderColor: membership.color || '#6B7280' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{membership.icon || '⭐'}</span>
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: membership.color || '#6B7280' }}>
                {membership.name || '普通會員'}
              </h2>
              <p className="text-gray-600">{membership.description || ''}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: membership.color || '#6B7280' }}>
              {membership.discount_percentage || 0}% 折扣
            </div>
            <p className="text-sm text-gray-500">專屬優惠</p>
          </div>
        </div>
      </div>

      {/* 積分和消費統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">當前積分</h3>
          <p className="text-3xl font-bold text-blue-600">{userData.points || 0}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">累計消費</h3>
          <p className="text-3xl font-bold text-green-600">¥{(userData.total_spent || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">會員折扣</h3>
          <p className="text-3xl font-bold text-purple-600">{membership.discount_percentage || 0}%</p>
        </div>
      </div>

      {/* 升級進度 */}
      {nextLevel && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">升級進度</h3>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>距離下一等級: {nextLevel.name}</span>
              <span>{userData.points || 0} / {nextLevel.min_points} 積分</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((userData.points || 0) / nextLevel.min_points) * 100)}%`,
                  backgroundColor: nextLevel.color || '#6B7280'
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              還需 {Math.max(0, nextLevel.min_points - (userData.points || 0))} 積分即可升級
            </p>
          </div>
        </div>
      )}

      {/* 所有會員等級 */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">會員等級說明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`p-4 rounded-lg border-2 ${
                level.id === userData.membership_level_id ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: level.color,
                ...(level.id === userData.membership_level_id ? { '--tw-ring-color': level.color } as React.CSSProperties : {})
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{level.icon}</span>
                <h4 className="font-bold" style={{ color: level.color }}>
                  {level.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{level.description}</p>
              <div className="text-sm">
                <p className="font-semibold">折扣: {level.discount_percentage}%</p>
                <p className="text-gray-500">需 {level.min_points} 積分</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;
