<template>
  <view class="rider-nav">
    <view class="nav-item" :class="{ active: currentPage === 'hall' }" @tap="switchPage('hall')">
      <text class="nav-icon">🏠</text>
      <text class="nav-text">接单</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'running' }" @tap="switchPage('running')">
      <text class="nav-icon">📦</text>
      <text class="nav-text">配送</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'completed' }" @tap="switchPage('completed')">
      <text class="nav-icon">✅</text>
      <text class="nav-text">已完成</text>
    </view>
    <view class="nav-item" :class="{ active: currentPage === 'stats' }" @tap="switchPage('stats')">
      <text class="nav-icon">📊</text>
      <text class="nav-text">业绩</text>
    </view>
    <view class="nav-item switch-user-item" @tap="switchToUser">
      <text class="nav-icon">👤</text>
      <text class="nav-text">用户</text>
    </view>
  </view>
</template>

<script>
import { switchMode } from '@/api/user.js';
import { setUserInfo } from '@/utils/token.js';

export default {
  props: {
    currentPage: {
      type: String,
      default: 'hall'
    }
  },

  methods: {
    switchPage(page) {
      if (page === this.currentPage) return;

      // 处理特殊页面的路径
      let url = `/pages/${page}/${page}`;
      if (page === 'completed') {
        url = '/pages/rider/completed';
      }

      uni.redirectTo({
        url: url
      });
    },

    // 切换为用户模式
    async switchToUser() {
      try {
        uni.showModal({
          title: '切换身份',
          content: '确定切换为用户模式吗？',
          success: async (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '切换中...', mask: true });

              // 设置为用户模式
              uni.setStorageSync('currentMode', 1); // 1 = 用户模式

              const result = await switchMode({ targetMode: 1 }); // 1-用户模式

              uni.hideLoading();

              // 更新本地用户信息
              if (result.data) {
                setUserInfo(result.data);
              }

              uni.showToast({
                title: '切换成功',
                icon: 'success'
              });

              // 跳转到用户首页
              setTimeout(() => {
                uni.switchTab({
                  url: '/pages/index/index'
                });
              }, 1000);
            }
          }
        });
      } catch (error) {
        uni.hideLoading();
        console.error('切换失败:', error);
        uni.showToast({
          title: '切换失败，请重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.rider-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  padding: 10rpx 0 20rpx;
  z-index: 999;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  border-top: 2rpx solid #f0f0f0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0;
  transition: all 0.3s;
}

.nav-item.active {
  background: transparent;
}

.nav-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #999;
}

.nav-item.active .nav-text {
  color: #07c160;
  font-weight: bold;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

/* 切换为用户按钮特殊样式 */
.switch-user-item {
  border-left: 2rpx solid #f0f0f0;
}

.switch-user-item .nav-icon {
  color: #ff6b6b;
}

.switch-user-item .nav-text {
  color: #ff6b6b;
}
</style>
