<template>
  <view class="evaluations-container">
    <!-- 骑手导航栏 -->
    <rider-nav current-page="evaluations"></rider-nav>

    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        :class="{ active: activeRating === null }"
        @tap="switchRating(null)"
      >
        <text class="filter-text">全部</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeRating === 5 }"
        @tap="switchRating(5)"
      >
        <text class="filter-text">5星</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeRating === 4 }"
        @tap="switchRating(4)"
      >
        <text class="filter-text">4星</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeRating === 3 }"
        @tap="switchRating(3)"
      >
        <text class="filter-text">3星</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeRating === 2 }"
        @tap="switchRating(2)"
      >
        <text class="filter-text">2星</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeRating === 1 }"
        @tap="switchRating(1)"
      >
        <text class="filter-text">1星</text>
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view
      class="evaluations-scroll"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="evaluation-list" v-if="evaluationList.length > 0">
        <view
          class="evaluation-card"
          v-for="evaluation in evaluationList"
          :key="evaluation.orderId"
        >
          <!-- 用户信息 -->
          <view class="user-section">
            <view class="user-avatar">
              <text>{{ evaluation.userName ? evaluation.userName.substring(0, 1) : '用' }}</text>
            </view>
            <view class="user-info">
              <text class="user-name">{{ evaluation.userName || '用户' }}</text>
              <text class="eval-time">{{ formatTime(evaluation.evaluationTime) }}</text>
            </view>
          </view>

          <!-- 评分 -->
          <view class="rating-section">
            <view class="rating-stars">
              <text
                class="star-icon"
                v-for="(star, index) in 5"
                :key="index"
              >
                {{ index < evaluation.rating ? '★' : '☆' }}
              </text>
            </view>
            <text class="rating-score">{{ evaluation.rating }}分</text>
          </view>

          <!-- 评价标签 -->
          <view class="tags-section" v-if="getTags(evaluation.feedback).length > 0">
            <view
              class="tag-item"
              v-for="(tag, index) in getTags(evaluation.feedback)"
              :key="index"
            >
              {{ tag }}
            </view>
          </view>

          <!-- 评价内容 -->
          <view class="content-section">
            <text class="content-text">{{ getFeedbackText(evaluation.feedback) }}</text>
          </view>

          <!-- 订单信息 -->
          <view class="order-section">
            <view class="order-info">
              <text class="order-label">订单号：</text>
              <text class="order-value">{{ evaluation.orderNo }}</text>
            </view>
            <view class="order-info">
              <text class="order-label">服务类型：</text>
              <text class="order-value">{{ getServiceTypeName(evaluation.serviceType) }}</text>
            </view>
          </view>

          <!-- 骑手回复区域 -->
          <view class="reply-section" v-if="evaluation.riderReply">
            <view class="reply-header">
              <text class="reply-title">我的回复</text>
              <text class="reply-time">{{ formatTime(evaluation.replyTime) }}</text>
            </view>
            <text class="reply-content">{{ evaluation.riderReply }}</text>
          </view>

          <!-- 回复按钮 -->
          <view class="action-section" v-else>
            <button class="btn-reply" @click.stop="replyEvaluation(evaluation.orderId)">
              回复评价
            </button>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="evaluationList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="hasMore">上拉加载更多</text>
        <text v-else>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="evaluationList.length === 0 && !loading">
        <text class="empty-icon">📝</text>
        <text class="empty-title">暂无评价</text>
        <text class="empty-desc">完成订单后就会收到用户评价啦~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import RiderNav from '@/components/rider-nav/rider-nav.vue'
import { getRiderEvaluations } from '@/api/rider.js'

export default {
  components: {
    RiderNav
  },

  data() {
    return {
      activeRating: null, // null=全部, 1-5星
      evaluationList: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10
    }
  },

  onLoad() {
    this.loadEvaluations()
  },

  methods: {
    /**
     * 切换评分筛选
     */
    switchRating(rating) {
      this.activeRating = rating
      this.currentPage = 1
      this.evaluationList = []
      this.hasMore = true
      this.loadEvaluations()
    },

    /**
     * 加载评价列表
     */
    async loadEvaluations() {
      if (this.loading) return

      try {
        this.loading = true

        const params = {
          type: 'received', // 收到的评价
          page: this.currentPage,
          size: this.pageSize
        }

        // 添加评分筛选
        if (this.activeRating !== null) {
          params.rating = this.activeRating
        }

        const result = await getRiderEvaluations(params)

        if (result.code === 200 && result.data) {
          const newEvaluations = result.data.records || []

          if (this.currentPage === 1) {
            this.evaluationList = newEvaluations
          } else {
            this.evaluationList = [...this.evaluationList, ...newEvaluations]
          }

          // 判断是否还有更多
          this.hasMore = newEvaluations.length >= this.pageSize
        }

      } catch (error) {
        console.error('获取评价列表失败:', error)
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
      this.loadEvaluations()
    },

    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true
      this.currentPage = 1
      this.loadEvaluations()
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
     * 获取服务类型名称
     */
    getServiceTypeName(type) {
      const types = {
        1: '帮买',
        2: '帮送',
        3: '帮取',
        4: '全能'
      }
      return types[type] || '未知'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
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
.evaluations-container {
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
  gap: 10rpx;
  overflow-x: auto;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 50;
}

.filter-item {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
}

.filter-item.active {
  background: #07c160;
  color: #fff;
  font-weight: bold;
}

/* 评价列表 */
.evaluations-scroll {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.evaluation-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 用户信息 */
.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.eval-time {
  font-size: 24rpx;
  color: #999;
}

/* 评分 */
.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
  margin-right: 16rpx;
}

.star-icon {
  font-size: 32rpx;
  color: #ffd700;
}

.rating-score {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff9800;
}

/* 评价标签 */
.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.tag-item {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

/* 评价内容 */
.content-section {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

/* 订单信息 */
.order-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-info {
  display: flex;
  font-size: 26rpx;
}

.order-label {
  color: #999;
  flex-shrink: 0;
}

.order-value {
  color: #333;
  flex: 1;
}

/* 骑手回复 */
.reply-section {
  padding: 20rpx;
  background: #f0f7ff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.reply-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #1890ff;
}

.reply-time {
  font-size: 22rpx;
  color: #999;
}

.reply-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

/* 操作区域 */
.action-section {
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
