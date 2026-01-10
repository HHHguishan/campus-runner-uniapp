<template>
  <view class="running-container">
    <!-- 骑手导航栏 -->
    <rider-nav current-page="running"></rider-nav>

    <!-- 当前配送订单 -->
    <view class="current-order" v-if="currentOrder">
      <view class="order-header">
        <text class="header-title">📦 当前配送</text>
        <text class="order-status">配送中</text>
      </view>

      <!-- 进度条 -->
      <view class="progress-bar">
        <view class="progress-step active">
          <view class="step-icon">✓</view>
          <text class="step-text">已接单</text>
        </view>
        <view class="progress-line active"></view>
        <view class="progress-step active">
          <view class="step-icon">2</view>
          <text class="step-text">配送中</text>
        </view>
        <view class="progress-line"></view>
        <view class="progress-step">
          <view class="step-icon">3</view>
          <text class="step-text">已完成</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info-card">
        <view class="info-section">
          <view class="section-title">📍 配送地址</view>
          <view class="address-item">
            <text class="addr-label">取货地址</text>
            <text class="addr-value">{{ currentOrder.pickupAddr }}</text>
          </view>
          <view class="address-item">
            <text class="addr-label">送货地址</text>
            <text class="addr-value">{{ currentOrder.deliveryAddr }}</text>
          </view>
        </view>

        <view class="info-section">
          <view class="section-title">📞 联系信息</view>
          <view class="contact-item">
            <text class="contact-label">联系人</text>
            <text class="contact-value">{{ currentOrder.contactName }}</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">联系电话</text>
            <text class="contact-value">{{ currentOrder.contactPhone }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn call-btn" @tap="makeCall">
          <text class="btn-icon">📞</text>
          <text>拨打电话</text>
        </button>
        <button class="action-btn finish-btn" @tap="finishOrder">
          <text class="btn-icon">✅</text>
          <text>完成配送</text>
        </button>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-title">暂无配送订单</text>
      <text class="empty-desc">快去接单大厅看看吧~</text>
      <button class="go-hall-btn" @tap="goToHall">前往接单大厅</button>
    </view>

    <!-- 今日统计 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">📊 今日统计</text>
      </view>
      <view class="stats-content">
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.completedOrders || 0 }}</text>
          <text class="stat-label">完成单数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">¥{{ todayStats.todayEarnings || 0 }}</text>
          <text class="stat-label">今日收入</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ todayStats.rating || 5.0 }}</text>
          <text class="stat-label">评分</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { finishOrder, getRiderOrders, getRiderDashboard } from '@/api/rider.js';
import RiderNav from '@/components/rider-nav/rider-nav.vue';

export default {
  components: {
    RiderNav
  },
  data() {
    return {
      currentOrder: null, // 当前配送订单
      todayStats: {
        completedOrders: 8,
        todayEarnings: '125.50',
        rating: 4.9
      }
    };
  },

  onLoad() {
    this.loadCurrentOrder();
    this.loadTodayStats();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadCurrentOrder();
  },

  methods: {
    // 加载当前配送订单
    async loadCurrentOrder() {
      try {
        // 调用后端API获取当前配送中的订单（状态=2，配送中）
        const result = await getRiderOrders({
          page: 1,
          size: 1,
          status: 2 // 配送中
        });

        if (result.data && result.data.records && result.data.records.length > 0) {
          const order = result.data.records[0];
          this.currentOrder = {
            id: order.id,
            pickupAddr: order.pickupAddr,
            deliveryAddr: order.deliveryAddr,
            contactName: order.contactName,
            contactPhone: order.contactPhone,
            goodsDesc: order.goodsDesc
          };
        } else {
          this.currentOrder = null;
        }

      } catch (error) {
        console.error('获取当前订单失败:', error);
        this.currentOrder = null;
      }
    },

    // 加载今日统计
    async loadTodayStats() {
      try {
        // 调用后端API获取今日统计数据
        const result = await getRiderDashboard();

        if (result.data) {
          this.todayStats = {
            completedOrders: result.data.todayCompletedOrders || 0,
            todayEarnings: result.data.todayIncome || '0.00',
            rating: result.data.averageRating || '5.0'
          };
        }

      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    },

    // 拨打电话
    makeCall() {
      if (!this.currentOrder) return;

      uni.makePhoneCall({
        phoneNumber: this.currentOrder.contactPhone
      });
    },

    // 完成配送
    async handleFinish() {
      if (!this.currentOrder) return;

      // 先上传完成凭证图片
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.confirmFinish(tempFilePath);
        }
      });
    },

    // 确认完成
    async confirmFinish(imagePath) {
      try {
        uni.showLoading({ title: '上传中...', mask: true });

        // TODO: 上传图片
        const finishImg = imagePath;

        await finishOrder({
          orderId: this.currentOrder.id,
          finishImg: finishImg
        });

        uni.hideLoading();

        uni.showToast({
          title: '配送完成',
          icon: 'success'
        });

        // 刷新数据
        setTimeout(() => {
          this.loadCurrentOrder();
          this.loadTodayStats();
        }, 1500);

      } catch (error) {
        uni.hideLoading();
        console.error('完成配送失败:', error);
      }
    },

    // 完成订单（跳转到上传图片页面）
    finishOrder() {
      if (!this.currentOrder) return;

      // 将订单信息编码后传递给上传页面
      const orderInfo = encodeURIComponent(JSON.stringify({
        deliveryAddr: this.currentOrder.deliveryAddr
      }));

      uni.navigateTo({
        url: `/pages/upload-finish/upload-finish?orderId=${this.currentOrder.id}&orderInfo=${orderInfo}`
      });
    },

    // 前往接单大厅
    goToHall() {
      uni.switchTab({
        url: '/pages/hall/hall'
      });
    }
  }
};
</script>

<style scoped>
.running-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  box-sizing: border-box;
}

/* 当前订单 */
.current-order {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.order-status {
  font-size: 28rpx;
  color: #07c160;
  font-weight: bold;
}

/* 进度条 */
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.progress-step.active .step-icon {
  background: #fff;
  color: #07c160;
}

.step-text {
  font-size: 24rpx;
  color: #fff;
}

.progress-line {
  width: 80rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 10rpx;
}

.progress-line.active {
  background: #fff;
}

/* 订单信息卡片 */
.order-info-card {
  padding: 30rpx;
}

.info-section {
  margin-bottom: 30rpx;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.address-item {
  margin-bottom: 16rpx;
}

.address-item:last-child {
  margin-bottom: 0;
}

.addr-label {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.addr-value {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.contact-label {
  font-size: 26rpx;
  color: #999;
}

.contact-value {
  font-size: 28rpx;
  color: #333;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx 30rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: none;
}

.action-btn::after {
  border: none;
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.call-btn {
  background: #f5f5f5;
  color: #333;
}

.finish-btn {
  background: #07c160;
  color: #fff;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 150rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-hall-btn {
  width: 300rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background: #07c160;
  color: #fff;
  font-size: 28rpx;
}

.go-hall-btn::after {
  border: none;
}

/* 统计卡片 */
.stats-card {
  margin: 0 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stats-header {
  margin-bottom: 24rpx;
}

.stats-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.stats-content {
  display: flex;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 2rpx;
  background: #f5f5f5;
}
</style>
