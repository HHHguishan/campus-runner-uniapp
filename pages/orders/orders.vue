<template>
  <view class="orders-container">
    <view class="empty-page">
      <text class="empty-icon">📦</text>
      <text class="empty-title">暂无订单</text>
      <text class="empty-desc">快去发布第一个订单吧~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.empty-page {
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

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999;
}
</style>
