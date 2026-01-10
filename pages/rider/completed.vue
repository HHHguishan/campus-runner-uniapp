<template>
  <view class="completed-container">
    <!-- 骑手导航栏 -->
    <rider-nav current-page="completed"></rider-nav>

    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: activeTab === 'all' }"
        @tap="switchTab('all')"
      >
        <text class="filter-text">全部</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeTab === 'rated' }"
        @tap="switchTab('rated')"
      >
        <text class="filter-text">已评价</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeTab === 'unrated' }"
        @tap="switchTab('unrated')"
      >
        <text class="filter-text">未评价</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="orders-scroll"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="order-list" v-if="orderList.length > 0">
        <view
          class="order-card"
          v-for="order in orderList"
          :key="order.id"
          @click="goToDetail(order.id)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-no">订单号：{{ order.orderNo }}</view>
            <view class="order-status completed">已完成</view>
          </view>

          <!-- 订单内容 -->
          <view class="order-content">
            <view class="service-type">
              <text class="type-icon">{{ getTypeIcon(order.type) }}</text>
              <text class="type-name">{{ getTypeName(order.type) }}</text>
            </view>

            <view class="goods-info">
              <text class="goods-label">物品：</text>
              <text class="goods-text">{{ order.goodsDesc }}</text>
            </view>

            <view class="address-info">
              <view class="address-item">
                <text class="address-label">取</text>
                <text class="address-text">{{ order.pickupAddr }}</text>
              </view>
              <view class="address-item">
                <text class="address-label">送</text>
                <text class="address-text">{{ order.deliveryAddr }}</text>
              </view>
            </view>

            <view class="order-footer">
              <view class="order-time">
                <text>{{ formatTime(order.finishTime) }}</text>
              </view>
              <view class="order-amount">
                <text class="amount-label">收入：</text>
                <text class="amount-value">¥{{ order.runnerFee }}</text>
              </view>
            </view>
          </view>

          <!-- 评价信息 -->
          <view class="evaluation-section" v-if="order.rating">
            <view class="evaluation-header">
              <text class="evaluation-title">用户评价</text>
              <view class="rating-stars">
                <text
                  class="star-icon"
                  v-for="(star, index) in 5"
                  :key="index"
                >
                  {{ index < order.rating ? '★' : '☆' }}
                </text>
              </view>
            </view>
            <view class="evaluation-content" v-if="order.feedback">
              <text class="feedback-text">{{ getFeedbackText(order.feedback) }}</text>
            </view>
            <view class="evaluation-tags" v-if="getTags(order.feedback).length > 0">
              <view
                class="tag-item"
                v-for="(tag, index) in getTags(order.feedback)"
                :key="index"
              >
                {{ tag }}
              </view>
            </view>
            <view class="rider-reply" v-if="order.riderReply">
              <text class="reply-label">骑手回复：</text>
              <text class="reply-content">{{ order.riderReply }}</text>
            </view>
            <view class="reply-btn-wrapper" v-if="!order.riderReply">
              <button class="btn-reply" @click.stop="replyEvaluation(order.id)">
                回复评价
              </button>
            </view>
          </view>

          <!-- 未评价提示 -->
          <view class="no-evaluation" v-else>
            <text class="no-eval-text">用户暂未评价</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="orderList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="hasMore">上拉加载更多</text>
        <text v-else>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="orderList.length === 0 && !loading">
        <text class="empty-icon">📦</text>
        <text class="empty-title">暂无已完成订单</text>
        <text class="empty-desc">快去接单大厅接单吧~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getRiderOrders } from '@/api/rider.js'
import RiderNav from '@/components/rider-nav/rider-nav.vue'

export default {
  components: {
    RiderNav
  },

  data() {
    return {
      activeTab: 'all', // all, rated, unrated
      orderList: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10
    }
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    // 从评价详情返回时刷新列表
    if (this.orderList.length > 0) {
      this.refreshList()
    }
  },

  methods: {
    /**
     * 切换标签
     */
    switchTab(tab) {
      this.activeTab = tab
      this.currentPage = 1
      this.orderList = []
      this.hasMore = true
      this.loadOrders()
    },

    /**
     * 加载订单列表
     */
    async loadOrders() {
      if (this.loading) return

      try {
        this.loading = true

        // 检查当前模式
        const currentMode = uni.getStorageSync('currentMode') || 1
        console.log('🔍 当前模式:', currentMode, '(1=用户模式, 2=骑手模式)')

        // 构建查询参数
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          status: 3 // 已完成
        }

        // 根据标签筛选
        if (this.activeTab === 'rated') {
          // 已评价：在后端筛选
          params.hasRating = true
        } else if (this.activeTab === 'unrated') {
          // 未评价：在后端筛选
          params.hasRating = false
        }

        console.log('📋 请求参数:', params)

        const result = await getRiderOrders(params)

        if (result.data && result.data.records) {
          const newOrders = result.data.records.map(order => ({
            id: order.orderId || order.id,
            orderNo: order.orderNo,
            type: order.serviceType || order.type,
            goodsDesc: order.goodsDesc,
            pickupAddr: order.pickupAddr,
            deliveryAddr: order.deliveryAddr,
            runnerFee: order.runnerFee || order.totalAmount,
            finishTime: order.finishTime || order.completeTime,
            rating: order.rating,
            feedback: order.feedback,
            riderReply: order.riderReply
          }))

          if (this.currentPage === 1) {
            this.orderList = newOrders
          } else {
            this.orderList = [...this.orderList, ...newOrders]
          }

          // 判断是否还有更多
          this.hasMore = newOrders.length >= this.pageSize
        }

      } catch (error) {
        console.error('获取订单列表失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading) return

      this.currentPage++
      this.loadOrders()
    },

    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true
      this.currentPage = 1
      this.loadOrders()
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.currentPage = 1
      this.loadOrders()
    },

    /**
     * 获取订单类型图标
     */
    getTypeIcon(type) {
      const icons = {
        1: '🛒',
        2: '📦',
        3: '📬',
        4: '🚀'
      }
      return icons[type] || '📦'
    },

    /**
     * 获取订单类型名称
     */
    getTypeName(type) {
      const names = {
        1: '帮买',
        2: '帮送',
        3: '帮取',
        4: '全能'
      }
      return names[type] || '未知'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    },

    /**
     * 从评价内容中提取标签
     */
    getTags(feedback) {
      if (!feedback) return []
      const tagMatch = feedback.match(/\[(.*?)\]/)
      if (tagMatch && tagMatch[1]) {
        return tagMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag)
      }
      return []
    },

    /**
     * 获取纯文本评价内容
     */
    getFeedbackText(feedback) {
      if (!feedback) return ''
      return feedback.replace(/\[.*?\]\s*/, '').trim()
    },

    /**
     * 查看订单详情
     */
    goToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      })
    },

    /**
     * 回复评价
     */
    replyEvaluation(orderId) {
      uni.navigateTo({
        url: `/pages/rider/reply?orderId=${orderId}`
      })
    }
  }
}
</script>

<style scoped>
.completed-container {
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
  border-radius: 8rpx;
  margin: 0 8rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.filter-item.active {
  background: #07c160;
  color: #fff;
  font-weight: bold;
}

/* 订单列表 */
.orders-scroll {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  font-weight: bold;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.order-status.completed {
  background: #e8f5e9;
  color: #4caf50;
}

/* 订单内容 */
.order-content {
  margin-bottom: 20rpx;
}

.service-type {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.type-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.type-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.goods-info {
  margin-bottom: 16rpx;
  font-size: 26rpx;
  color: #666;
}

.goods-label {
  color: #999;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.address-item {
  display: flex;
  align-items: flex-start;
  font-size: 26rpx;
}

.address-label {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 50%;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.address-text {
  flex: 1;
  color: #333;
  line-height: 40rpx;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-amount {
  display: flex;
  align-items: baseline;
}

.amount-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

/* 评价区域 */
.evaluation-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.evaluation-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
}

.star-icon {
  font-size: 28rpx;
  color: #ffd700;
}

.evaluation-content {
  margin-bottom: 16rpx;
}

.feedback-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.evaluation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tag-item {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.rider-reply {
  padding: 16rpx;
  background: #f0f7ff;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.reply-label {
  font-size: 24rpx;
  color: #1890ff;
  font-weight: bold;
}

.reply-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.reply-btn-wrapper {
  text-align: right;
}

.btn-reply {
  padding: 12rpx 32rpx;
  background: #07c160;
  color: #fff;
  font-size: 26rpx;
  border-radius: 40rpx;
  border: none;
}

.btn-reply::after {
  border: none;
}

/* 未评价提示 */
.no-evaluation {
  padding: 20rpx;
  text-align: center;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.no-eval-text {
  font-size: 26rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  padding: 30rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
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
}
</style>
