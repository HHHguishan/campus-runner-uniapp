<template>
  <view class="mine-container">
    <!-- 顶部用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @tap="editProfile">
        <image
          class="avatar"
          :src="userInfo.avatar || 'https://via.placeholder.com/120'"
          mode="aspectFill"
        ></image>
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
          <text class="mobile">{{ userInfo.mobile || '' }}</text>
        </view>
        <view class="edit-btn">
          <text>编辑</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 数据统计 -->
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ (userInfo.balance || 0).toFixed(2) }}</text>
          <text class="stat-label">余额</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.creditScore || 100 }}</text>
          <text class="stat-label">信用分</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ getRiderStatusText() }}</text>
          <text class="stat-label">骑手状态</text>
        </view>
      </view>
    </view>

    <!-- 身份切换卡片 -->
    <view class="identity-card">
      <view class="identity-header">
        <text class="identity-title">快速切换</text>
        <text class="identity-status">进入骑手工作台</text>
      </view>
      <view class="identity-action">
        <button
          class="switch-btn"
          @click="switchToRiderMode"
        >
          切换为骑手模式
        </button>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-section">
      <view class="function-title">常用功能</view>
      <view class="function-list">
        <view class="function-item" @tap="goToAddressList">
          <view class="item-left">
            <text class="item-icon">📍</text>
            <text class="item-label">我的地址簿</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/forum/my-posts')">
          <view class="item-left">
            <text class="item-icon">📝</text>
            <text class="item-label">我的帖子</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="goToWallet">
          <view class="item-left">
            <text class="item-icon">💰</text>
            <text class="item-label">我的钱包</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/wallet/alipay-bind')">
          <view class="item-left">
            <text class="item-icon">💙</text>
            <text class="item-label">绑定支付宝</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/rider/auth')">
          <view class="item-left">
            <text class="item-icon">🛡️</text>
            <text class="item-label">骑手认证</text>
          </view>
          <view class="item-right">
            <text class="item-status">{{ getRiderStatusText() }}</text>
            <text class="item-arrow">›</text>
          </view>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/evaluation/evaluation')">
          <view class="item-left">
            <text class="item-icon">⭐</text>
            <text class="item-label">我的评价</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/support/chat')">
          <view class="item-left">
            <text class="item-icon">🤖</text>
            <text class="item-label">AI 智能客服</text>
          </view>
          <view class="item-right">
            <text class="item-status">流式响应</text>
            <text class="item-arrow">›</text>
          </view>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/settings/settings')">
          <view class="item-left">
            <text class="item-icon">⚙️</text>
            <text class="item-label">设置</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="navigateTo('/pages/debug/api')">
          <view class="item-left">
            <text class="item-icon">🔧</text>
            <text class="item-label">API调试</text>
          </view>
          <text class="item-arrow">›</text>
        </view>

        <view class="function-item" @tap="goToAdminOrderList">
          <view class="item-left">
            <text class="item-icon">👑</text>
            <text class="item-label">管理员入口</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { getUserInfo, setUserInfo, removeToken, removeUserInfo } from '@/utils/token.js';
import { getUserInfo as fetchUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      userInfo: {}
    };
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 每次显示页面时重新加载用户信息
    this.loadUserInfo();
  },

  methods: {
    // 获取骑手认证状态文本
    getRiderStatusText() {
      const { isRider, riderStatus } = this.userInfo;

      if (!isRider || isRider === 0) {
        return '未认证';
      }

      // 已申请认证，根据状态显示
      switch (riderStatus) {
        case 0:
          return '审核中';
        case 1:
          return '已认证';
        case 2:
          return '已驳回';
        default:
          return '未认证';
      }
    },

    // 加载用户信息
    async loadUserInfo() {
      try {
        console.log('=== 开始加载用户信息 ===');
        // 从后端获取最新的用户信息
        const result = await fetchUserInfo();

        console.log('API返回结果:', result);
        console.log('result.data:', result.data);

        if (result.data) {
          this.userInfo = result.data;

          // 更新本地存储
          setUserInfo(result.data);

          // 打印详细日志用于调试
          console.log('=== 用户信息详情 ===');
          console.log('完整用户对象:', JSON.stringify(result.data, null, 2));
          console.log('isRider值:', result.data.isRider, '类型:', typeof result.data.isRider);
          console.log('riderStatus值:', result.data.riderStatus, '类型:', typeof result.data.riderStatus);

          // 判断认证状态
          const isCertified = result.data.isRider === 1 && result.data.riderStatus === 1;
          console.log('是否已认证:', isCertified);
          console.log('认证状态文本:', this.getRiderStatusText());
        }
      } catch (error) {
        console.error('=== 获取用户信息失败 ===');
        console.error('错误信息:', error);
        console.error('错误详情:', JSON.stringify(error));

        // 如果API调用失败，使用本地缓存的数据
        const userInfo = getUserInfo();
        if (userInfo) {
          console.log('使用本地缓存数据:', userInfo);
          this.userInfo = userInfo;
        } else {
          // 未登录，跳转到登录页
          console.log('未登录，跳转到登录页');
          uni.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    },

    // 切换为骑手模式
    switchToRiderMode() {
      // 检查是否已通过骑手认证（isRider=1 且 riderStatus=1）
      const isRiderCertified = this.userInfo.isRider === 1 && this.userInfo.riderStatus === 1;

      console.log('当前用户信息:', this.userInfo);
      console.log('isRider:', this.userInfo.isRider);
      console.log('riderStatus:', this.userInfo.riderStatus);
      console.log('是否已认证:', isRiderCertified);

      if (!isRiderCertified) {
        // 未认证或审核未通过，弹出提示
        uni.showModal({
          title: '提示',
          content: '您还未通过骑手认证，是否前往认证？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/rider/auth'
              });
            }
          }
        });
        return;
      }

      // 已认证，设置骑手模式并跳转到接单大厅
      uni.setStorageSync('currentMode', 2) // 2 = 骑手模式

      uni.redirectTo({
        url: '/pages/hall/hall'
      });

      console.log('✅ 已切换到骑手模式，currentMode = 2');
    },

    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除本地存储
            removeToken();
            removeUserInfo();
            uni.removeStorageSync('currentMode'); // 重置身份模式

            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });

            setTimeout(() => {
              // 跳转到登录页
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }, 1000);
          }
        }
      });
    },

    // 页面跳转
    navigateTo(url) {
      uni.navigateTo({
        url: url,
        fail: () => {
          uni.showToast({
            title: '页面开发中...',
            icon: 'none'
          });
        }
      });
    },

    // 跳转到地址列表
    goToAddressList() {
      console.log('🚀 准备跳转到地址列表页');

      uni.navigateTo({
        url: '/pages/address/list',
        success: () => {
          console.log('✅ 地址列表页跳转成功');
        },
        fail: (err) => {
          console.error('❌ 地址列表页跳转失败:', err);
          console.error('错误详情:', JSON.stringify(err));

          // 更详细的错误提示
          uni.showModal({
            title: '跳转失败',
            content: '地址管理页面未找到，请重新编译项目。\n\n步骤：\n1. 删除unpackage文件夹\n2. 重新运行项目',
            confirmText: '我知道了',
            showCancel: false
          });
        }
      });
    },

    // 跳转到钱包页面
    goToWallet() {
      console.log('🚀 准备跳转到钱包页面');

      uni.navigateTo({
        url: '/pages/wallet/wallet',
        success: () => {
          console.log('✅ 钱包页面跳转成功');
        },
        fail: (err) => {
          console.error('❌ 钱包页面跳转失败:', err);
          console.error('错误详情:', JSON.stringify(err));

          uni.showModal({
            title: '跳转失败',
            content: '钱包页面未找到，请重新编译项目。\n\n步骤：\n1. 删除unpackage文件夹\n2. 重新运行项目',
            confirmText: '我知道了',
            showCancel: false
          });
        }
      });
    },

    // 编辑个人资料
    editProfile() {
      uni.navigateTo({
        url: '/pages/profile/edit'
      });
    },

    // 跳转到管理员订单列表
    goToAdminOrderList() {
      uni.navigateTo({
        url: '/pages/admin/order-list',
        success: () => {
          console.log('✅ 管理员订单列表页跳转成功');
        },
        fail: (err) => {
          console.error('❌ 管理员订单列表页跳转失败', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #0081ff 0%, #1cbbff 100%);
  padding: 80rpx 40rpx 40rpx;
  color: #fff;
  border-radius: 0 0 60rpx 60rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 129, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 50rpx;
  position: relative;
}

.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.4);
  margin-right: 24rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.info {
  flex: 1;
}

.edit-btn {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  background: rgba(255,255,255,0.2);
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(5px);
}

.edit-btn .arrow {
  font-size: 32rpx;
  margin-left: 8rpx;
  font-weight: bold;
}

.nickname {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.mobile {
  font-size: 28rpx;
  opacity: 0.9;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 30rpx;
  padding: 30rpx 0;
  border: 1rpx solid rgba(255,255,255,0.2);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 44rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  align-self: center;
}

/* 身份切换卡片 */
.identity-card {
  margin: -40rpx 30rpx 20rpx;
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
}

.identity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.identity-title {
  font-size: 28rpx;
  color: #94a3b8;
}

.identity-status {
  font-size: 32rpx;
  font-weight: bold;
  color: #0081ff;
}

.switch-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(135deg, #0081ff 0%, #00bcff 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(0, 129, 255, 0.2);
}

.switch-btn::after {
  border: none;
}

/* 功能列表 */
.function-section {
  margin: 30rpx;
  background: #fff;
  border-radius: 30rpx;
  padding: 36rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
}

.function-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 30rpx;
  padding-left: 10rpx;
  border-left: 8rpx solid #0081ff;
}

.function-list {
  /* border-top: 2rpx solid #f8fafc; */
}

.function-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 10rpx;
  border-bottom: 1rpx solid #f1f5f9;
  transition: all 0.2s;
  
  &:active {
    background-color: #f8fafc;
  }
}

.function-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  font-size: 44rpx;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.05);
}

.item-label {
  font-size: 30rpx;
  color: #334155;
  font-weight: 500;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-status {
  font-size: 26rpx;
  color: #0081ff;
  margin-right: 14rpx;
  background: rgba(0,129,255,0.05);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.item-arrow {
  font-size: 40rpx;
  color: #cbd5e1;
  font-weight: bold;
}

/* 退出登录 */
.logout-section {
  margin: 60rpx 30rpx;
  padding-bottom: 60rpx;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: #fff;
  color: #94a3b8;
  font-size: 30rpx;
  border: 1rpx solid #e2e8f0;
}

.logout-btn::after {
  border: none;
}
</style>
