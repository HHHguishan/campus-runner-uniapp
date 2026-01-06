<template>
  <view class="index-container">
    <!-- 顶部定位栏 -->
    <view class="location-bar">
      <text class="location-icon">📍</text>
      <text class="location-text">广州大学城...</text>
      <text class="location-arrow">▼</text>
    </view>

    <!-- 轮播图区域 -->
    <view class="banner-section">
      <swiper class="banner-swiper" indicator-dots autoplay circular>
        <swiper-item>
          <view class="banner-item banner-1">
            <text class="banner-text">新用户首单立减¥5</text>
          </view>
        </swiper-item>
        <swiper-item>
          <view class="banner-item banner-2">
            <text class="banner-text">成为骑手，轻松赚钱</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 金刚区图标导航 -->
    <view class="nav-grid">
      <view class="nav-item" @tap="navigateToPublish('buy')">
        <view class="nav-icon nav-icon-1">🛒</view>
        <text class="nav-label">帮买</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('send')">
        <view class="nav-icon nav-icon-2">📦</view>
        <text class="nav-label">帮送</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('fetch')">
        <view class="nav-icon nav-icon-3">📬</view>
        <text class="nav-label">帮取</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('all')">
        <view class="nav-icon nav-icon-4">🚀</view>
        <text class="nav-label">全能</text>
      </view>
    </view>

    <!-- 快捷发布卡片 -->
    <view class="publish-card" @tap="navigateToPublish('all')">
      <view class="publish-header">
        <text class="publish-title">🚀 快速发布订单</text>
        <text class="publish-subtitle">支持帮买、帮送、帮取</text>
      </view>
      <view class="publish-btn">
        <text>立即发布</text>
        <text class="btn-arrow">›</text>
      </view>
    </view>

    <!-- 最近订单 -->
    <view class="recent-orders" v-if="recentOrders.length > 0">
      <view class="section-header">
        <text class="section-title">最近订单</text>
        <text class="section-more" @tap="goToOrders">查看全部 ›</text>
      </view>

      <view class="order-list">
        <view
          class="order-item"
          v-for="order in recentOrders"
          :key="order.id"
          @tap="goToOrderDetail(order.id)"
        >
          <view class="order-header">
            <text class="order-type">{{ order.typeText }}</text>
            <text class="order-status" :class="'status-' + order.status">
              {{ order.statusText }}
            </text>
          </view>
          <view class="order-content">
            <text class="order-address">{{ order.address }}</text>
            <text class="order-time">{{ order.time }}</text>
          </view>
          <view class="order-footer">
            <text class="order-price">¥{{ order.price }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 暂无订单提示 -->
    <view class="empty-tips" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无订单，快去发布第一个订单吧~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recentOrders: [
        // 示例数据，后续从接口获取
        {
          id: 1,
          typeText: '帮买',
          status: 1,
          statusText: '待接单',
          address: '奶茶店 → 5号楼302',
          time: '10分钟前',
          price: '8.00'
        }
      ]
    };
  },

  methods: {
    // 跳转到发布订单页面
    navigateToPublish(type) {
      uni.showToast({
        title: '发布订单功能开发中...',
        icon: 'none'
      });
      // TODO: 跳转到发布订单页面
      // uni.navigateTo({
      //   url: `/pages/publish/publish?type=${type}`
      // });
    },

    // 跳转到订单列表
    goToOrders() {
      uni.switchTab({
        url: '/pages/orders/orders'
      });
    },

    // 跳转到订单详情
    goToOrderDetail(orderId) {
      uni.showToast({
        title: '订单详情功能开发中...',
        icon: 'none'
      });
      // TODO: 跳转到订单详情页面
      // uni.navigateTo({
      //   url: `/pages/order/detail?id=${orderId}`
      // });
    }
  }
};
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 定位栏 */
.location-bar {
  background: #fff;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.location-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.location-arrow {
  font-size: 20rpx;
  color: #999;
}

/* 轮播图 */
.banner-section {
  padding: 20rpx;
}

.banner-swiper {
  height: 300rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
}

.banner-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.banner-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.banner-text {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}

/* 金刚区 */
.nav-grid {
  display: flex;
  background: #fff;
  padding: 40rpx 0;
  margin: 20rpx;
  border-radius: 16rpx;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  margin-bottom: 16rpx;
}

.nav-icon-1 {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
}

.nav-icon-2 {
  background: linear-gradient(135deg, #a8e6cf 0%, #56ab91 100%);
}

.nav-icon-3 {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.nav-icon-4 {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.nav-label {
  font-size: 26rpx;
  color: #333;
}

/* 发布卡片 */
.publish-card {
  margin: 0 20rpx 20rpx;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-header {
  flex: 1;
}

.publish-title {
  display: block;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.publish-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

.publish-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 20rpx 30rpx;
  border-radius: 40rpx;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.btn-arrow {
  font-size: 32rpx;
  margin-left: 10rpx;
  font-weight: bold;
}

/* 最近订单 */
.recent-orders {
  margin: 0 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #07c160;
}

.order-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-item {
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-type {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.order-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.status-0 {
  background: #fff7e6;
  color: #fa8c16;
}

.status-1 {
  background: #e6f7ff;
  color: #1890ff;
}

.status-2 {
  background: #f6ffed;
  color: #52c41a;
}

.status-3 {
  background: #f5f5f5;
  color: #999;
}

.order-content {
  margin-bottom: 16rpx;
}

.order-address {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
}

.order-price {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: bold;
}

/* 空状态 */
.empty-tips {
  margin: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
