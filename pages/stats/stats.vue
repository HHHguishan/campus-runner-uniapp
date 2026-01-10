<template>
  <view class="stats-container">
    <!-- 骑手导航栏 -->
    <rider-nav current-page="stats"></rider-nav>

    <!-- 收入卡片 -->
    <view class="income-card">
      <view class="income-header">
        <text class="income-title">💰 我的收入</text>
        <view class="withdraw-btn" @tap="withdraw">
          <text>提现</text>
        </view>
      </view>
      <view class="income-amount">
        <text class="amount-symbol">¥</text>
        <text class="amount-value">{{ totalIncome }}</text>
      </view>
      <view class="income-detail">
        <view class="detail-item">
          <text class="detail-label">账户余额</text>
          <text class="detail-value">¥{{ balance }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">今日收入</text>
          <text class="detail-value">¥{{ todayIncome }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="data-card">
      <view class="data-header">
        <text class="data-title">📊 数据统计</text>
      </view>
      <view class="data-grid">
        <view class="data-item">
          <text class="data-value">{{ totalOrders }}</text>
          <text class="data-label">总单数</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ todayOrders }}</text>
          <text class="data-label">今日单数</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ rating }}</text>
          <text class="data-label">评分</text>
        </view>
        <view class="data-item">
          <text class="data-value">{{ completeRate }}%</text>
          <text class="data-label">完成率</text>
        </view>
      </view>
    </view>

    <!-- 近期流水 -->
    <view class="records-card">
      <view class="records-header">
        <text class="records-title">📝 近期流水</text>
        <text class="records-more" @tap="goToWallet">查看全部 ›</text>
      </view>
      <view class="records-list" v-if="records.length > 0">
        <view class="record-item" v-for="record in records" :key="record.id">
          <view class="record-left">
            <text class="record-type">{{ record.typeText }}</text>
            <text class="record-time">{{ record.time }}</text>
          </view>
          <view class="record-right">
            <text class="record-amount" :class="record.income ? 'income' : 'expense'">
              {{ record.income ? '+' : '-' }}¥{{ record.amount }}
            </text>
          </view>
        </view>
      </view>
      <view class="empty-records" v-else>
        <text class="empty-text">暂无流水记录</text>
      </view>
    </view>

    <!-- 评分统计 -->
    <view class="rating-card">
      <view class="rating-header">
        <text class="rating-title">⭐ 评分统计</text>
      </view>
      <view class="rating-stats">
        <view class="rating-summary">
          <view class="rating-score">
            <text class="score-value">{{ overallRating }}</text>
            <text class="score-label">综合评分</text>
          </view>
          <view class="rating-detail">
            <view class="detail-row">
              <text class="row-label">总评价数</text>
              <text class="row-value">{{ totalEvaluations }}条</text>
            </view>
            <view class="detail-row">
              <text class="row-label">好评率</text>
              <text class="row-value">{{ positiveRate }}%</text>
            </view>
          </view>
        </view>
      </view>
      <view class="rating-btn" @tap="goToEvaluations">
        <text>查看全部评价</text>
        <text class="btn-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getRiderDashboard, getRiderIncome, getRiderOrderStats, getRiderEvaluationStats } from '@/api/rider.js';
import RiderNav from '@/components/rider-nav/rider-nav.vue';

export default {
  components: {
    RiderNav
  },
  data() {
    return {
      totalIncome: '0.00',
      balance: '0.00',
      todayIncome: '0.00',
      totalOrders: 0,
      todayOrders: 0,
      rating: '5.0',
      completeRate: 100,
      overallRating: '5.0',
      totalEvaluations: 0,
      positiveRate: 100,
      records: [
        // 示例数据
        {
          id: 1,
          typeText: '订单收入',
          time: '10:30',
          amount: '8.00',
          income: true
        },
        {
          id: 2,
          typeText: '订单收入',
          time: '09:15',
          amount: '6.50',
          income: true
        }
      ]
    };
  },

  onLoad() {
    this.loadStats();
  },

  methods: {
    // 加载统计数据
    async loadStats() {
      try {
        // 获取工作台数据看板（包含今日收入、余额、今日订单数等）
        const dashboardResult = await getRiderDashboard();
        if (dashboardResult.data) {
          this.totalIncome = dashboardResult.data.monthlyIncome || '0.00';
          this.balance = dashboardResult.data.currentBalance || '0.00';
          this.todayIncome = dashboardResult.data.todayIncome || '0.00';
          this.totalOrders = dashboardResult.data.totalCompletedOrders || 0;
          this.todayOrders = dashboardResult.data.todayCompletedOrders || 0;
          this.rating = dashboardResult.data.averageRating || '5.0';
        }

        // 获取订单统计（包含完成率）
        const orderStatsResult = await getRiderOrderStats();
        if (orderStatsResult.data) {
          this.completeRate = orderStatsResult.data.completionRate || 100;
        }

        // 获取评分统计
        const evalResult = await getRiderEvaluationStats();
        if (evalResult.data) {
          this.overallRating = evalResult.data.averageRating || '5.0';
          this.totalEvaluations = evalResult.data.totalEvaluations || 0;
          this.positiveRate = evalResult.data.positiveRate || 100;
        }

        // 获取流水记录
        // TODO: 调用钱包流水API
        this.records = [
          {
            id: 1,
            typeText: '订单收入',
            time: '10:30',
            amount: '8.00',
            income: true
          },
          {
            id: 2,
            typeText: '订单收入',
            time: '09:15',
            amount: '6.50',
            income: true
          }
        ];

      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    },

    // 提现
    withdraw() {
      uni.showToast({
        title: '提现功能开发中...',
        icon: 'none'
      });
      // TODO: 实现提现功能
    },

    // 查看钱包
    goToWallet() {
      uni.navigateTo({
        url: '/pages/wallet/wallet'
      });
    },

    // 查看评价
    goToEvaluations() {
      uni.navigateTo({
        url: '/pages/rider/evaluations'
      });
    }
  }
};
</script>

<style scoped>
.stats-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
  box-sizing: border-box;
}

/* 收入卡片 */
.income-card {
  margin: 20rpx;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 16rpx;
  padding: 40rpx;
  color: #fff;
}

.income-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.income-title {
  font-size: 28rpx;
  opacity: 0.9;
}

.withdraw-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 24rpx;
}

.income-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 30rpx;
}

.amount-symbol {
  font-size: 40rpx;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 80rpx;
  font-weight: bold;
}

.income-detail {
  display: flex;
  gap: 40rpx;
}

.detail-item {
  flex: 1;
}

.detail-label {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 32rpx;
  font-weight: bold;
}

/* 数据卡片 */
.data-card {
  margin: 0 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.data-header {
  margin-bottom: 24rpx;
}

.data-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #07c160;
  margin-bottom: 8rpx;
}

.data-label {
  font-size: 24rpx;
  color: #999;
}

/* 流水记录 */
.records-card {
  margin: 0 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.records-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.records-more {
  font-size: 26rpx;
  color: #07c160;
}

.records-list {
  border-top: 2rpx solid #f5f5f5;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  flex-direction: column;
}

.record-type {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-amount {
  font-size: 32rpx;
  font-weight: bold;
}

.record-amount.income {
  color: #07c160;
}

.record-amount.expense {
  color: #ff4d4f;
}

.empty-records {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

/* 评分卡片 */
.rating-card {
  margin: 0 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.rating-header {
  margin-bottom: 24rpx;
}

.rating-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.rating-stats {
  margin-bottom: 20rpx;
}

.rating-summary {
  display: flex;
  align-items: center;
}

.rating-score {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20rpx;
  border-right: 2rpx solid #f5f5f5;
}

.score-value {
  font-size: 60rpx;
  font-weight: bold;
  color: #07c160;
  margin-bottom: 8rpx;
}

.score-label {
  font-size: 24rpx;
  color: #999;
}

.rating-detail {
  flex: 2;
  padding-left: 20rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.row-label {
  font-size: 26rpx;
  color: #666;
}

.row-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.rating-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.btn-arrow {
  font-size: 32rpx;
  color: #999;
  font-weight: bold;
}
</style>
