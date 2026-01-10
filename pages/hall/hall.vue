<template>
  <view class="hall-container">
    <!-- 骑手导航栏 -->
    <rider-nav current-page="hall"></rider-nav>

    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: filterType === 'distance' }" @tap="setFilter('distance')">
        <text class="filter-text">距离最近</text>
      </view>
      <view class="filter-item" :class="{ active: filterType === 'price' }" @tap="setFilter('price')">
        <text class="filter-text">金额最高</text>
      </view>
      <view class="filter-item" :class="{ active: filterType === 'all' }" @tap="setFilter('all')">
        <text class="filter-text">全部订单</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="orderList.length > 0">
      <view
        class="order-card"
        v-for="order in orderList"
        :key="order.id"
        @tap="goToOrderDetail(order.id)"
      >
        <!-- 订单类型和价格 -->
        <view class="card-header">
          <view class="order-type-badge" :class="'type-' + order.type">
            {{ order.typeText }}
          </view>
          <view class="order-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ order.runnerFee }}</text>
          </view>
        </view>

        <!-- 地址信息 -->
        <view class="address-section">
          <view class="address-item start">
            <text class="address-icon">🟢</text>
            <text class="address-text">{{ order.pickupAddr }}</text>
          </view>
          <view class="address-divider"></view>
          <view class="address-item end">
            <text class="address-icon">🔴</text>
            <text class="address-text">{{ order.deliveryAddr }}</text>
          </view>
        </view>

        <!-- 订单信息 -->
        <view class="order-info">
          <view class="info-item">
            <text class="info-icon">📍</text>
            <text class="info-text">{{ order.distance }}km</text>
          </view>
          <view class="info-item">
            <text class="info-icon">⏱️</text>
            <text class="info-text">{{ order.createTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-icon">📦</text>
            <text class="info-text">{{ order.goodsDesc }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="card-footer">
          <button class="grab-btn" @tap.stop="grabOrder(order.id)">
            立即接单
          </button>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无可接订单</text>
      <text class="empty-tip">刷新看看吧~</text>
    </view>

    <!-- 刷新按钮 -->
    <view class="refresh-btn" @tap="loadOrders">
      <text class="refresh-icon">🔄</text>
    </view>
  </view>
</template>

<script>
import { grabOrder, getRiderOrders } from '@/api/rider.js';
import RiderNav from '@/components/rider-nav/rider-nav.vue';

export default {
  components: {
    RiderNav
  },
  data() {
    return {
      filterType: 'distance', // distance, price, all
      orderList: [],
      loading: false
    };
  },

  onLoad() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders();
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },

  methods: {
    // 加载订单列表
    async loadOrders() {
      if (this.loading) return;

      try {
        this.loading = true;

        // 调用后端API获取待接单列表（状态=1，待接单）
        const result = await getRiderOrders({
          page: 1,
          size: 20,
          status: 1 // 待接单
        });

        if (result.data && result.data.records) {
          // 格式化订单数据
          this.orderList = result.data.records.map(order => ({
            id: order.orderId || order.id,
            type: order.serviceType || order.type,
            typeText: this.getTypeText(order.serviceType || order.type),
            pickupAddr: order.pickupAddr || (order.addressInfo && order.addressInfo.pickupAddress) || '',
            deliveryAddr: order.deliveryAddr || (order.addressInfo && order.addressInfo.deliveryAddress) || '',
            distance: order.distance || 0,
            runnerFee: order.runnerFee || order.totalAmount,
            goodsDesc: order.goodsDesc || order.goodsInfo,
            createTime: this.formatTime(order.createTime)
          }));
        }

      } catch (error) {
        console.error('获取订单列表失败:', error);
        // 如果API调用失败，显示空列表或示例数据
        this.orderList = [];
      } finally {
        this.loading = false;
      }
    },

    // 获取订单类型文本
    getTypeText(type) {
      const typeMap = {
        1: '帮买',
        2: '帮送',
        3: '帮取',
        4: '全能'
      };
      return typeMap[type] || '未知';
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '';

      const now = new Date();
      const createTime = new Date(time);
      const diff = Math.floor((now - createTime) / 1000 / 60); // 分钟差

      if (diff < 1) return '刚刚';
      if (diff < 60) return `${diff}分钟前`;
      if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
      return `${Math.floor(diff / 1440)}天前`;
    },

    // 设置筛选类型
    setFilter(type) {
      this.filterType = type;
      this.loadOrders();
    },

    // 接单
    async grabOrder(orderId) {
      uni.showModal({
        title: '确认接单',
        content: '确定要接这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '接单中...', mask: true });

              await grabOrder(orderId);

              uni.hideLoading();

              uni.showToast({
                title: '接单成功',
                icon: 'success'
              });

              // 跳转到配送中页面
              setTimeout(() => {
                uni.redirectTo({
                  url: '/pages/running/running'
                });
              }, 1500);

            } catch (error) {
              uni.hideLoading();
              console.error('接单失败:', error);
            }
          }
        }
      });
    },

    // 查看订单详情
    goToOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    }
  }
};
</script>

<style scoped>
.hall-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  box-sizing: border-box;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx;
  position: sticky;
  top: 0;
  z-index: 50;
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  margin: 0 10rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
}

.filter-item.active {
  background: #07c160;
}

.filter-text {
  font-size: 28rpx;
  color: #333;
}

.filter-item.active .filter-text {
  color: #fff;
}

/* 订单列表 */
.order-list {
  padding: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.order-type-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.type-1 {
  background: #fff7e6;
  color: #fa8c16;
}

.type-2 {
  background: #e6f7ff;
  color: #1890ff;
}

.type-3 {
  background: #f6ffed;
  color: #52c41a;
}

.type-4 {
  background: #fff0f6;
  color: #eb2f96;
}

.order-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-right: 4rpx;
}

.price-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #ff4d4f;
}

/* 地址信息 */
.address-section {
  margin-bottom: 24rpx;
}

.address-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.address-item:last-child {
  margin-bottom: 0;
}

.address-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.address-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.address-divider {
  height: 2rpx;
  background: #f5f5f5;
  margin: 16rpx 0 16rpx 44rpx;
}

/* 订单信息 */
.order-info {
  display: flex;
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.info-text {
  font-size: 24rpx;
  color: #666;
}

/* 底部按钮 */
.card-footer {
  display: flex;
  justify-content: flex-end;
}

.grab-btn {
  width: 240rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  background: #07c160;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}

.grab-btn::after {
  border: none;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 150rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999;
}

/* 刷新按钮 */
.refresh-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(7, 193, 96, 0.3);
}

.refresh-icon {
  font-size: 50rpx;
}
</style>
