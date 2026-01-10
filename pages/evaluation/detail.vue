<template>
  <view class="evaluation-detail-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">评价详情</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 评价内容 -->
    <scroll-view class="detail-content" scroll-y>
      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 无评价状态 -->
      <view class="empty-state" v-else-if="!evaluationInfo">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无评价</text>
      </view>

      <!-- 评价详情 -->
      <view class="evaluation-detail" v-else>
        <!-- 用户信息 -->
        <view class="user-section">
          <view class="user-avatar">
            <text>{{ userInfo.userName ? userInfo.userName.substring(0, 1) : '用' }}</text>
          </view>
          <view class="user-info">
            <text class="user-name">{{ userInfo.userName || '用户' }}</text>
            <text class="evaluate-time">{{ formatTime(evaluationInfo.createTime) }}</text>
          </view>
        </view>

        <!-- 评分显示 -->
        <view class="rating-display">
          <view class="stars">
            <text
              class="star-icon"
              v-for="(star, index) in 5"
              :key="index"
            >
              {{ index < evaluationInfo.rating ? '★' : '☆' }}
            </text>
          </view>
          <text class="rating-text">{{ getRatingText(evaluationInfo.rating) }}</text>
        </view>

        <!-- 评价标签 -->
        <view class="tags-display" v-if="evaluationInfo.tags">
          <view
            class="tag-item"
            v-for="(tag, index) in evaluationInfo.tags.split(',')"
            :key="index"
          >
            {{ tag }}
          </view>
        </view>

        <!-- 评价内容 -->
        <view class="comment-display">
          <text class="comment-text">{{ evaluationInfo.content || '' }}</text>
        </view>

        <!-- 订单信息 -->
        <view class="order-info" v-if="orderInfo">
          <view class="info-title">订单信息</view>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">订单号</text>
              <text class="info-value">{{ orderInfo.orderNo || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">服务类型</text>
              <text class="info-value">{{ getServiceTypeName(orderInfo.serviceType) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">完成时间</text>
              <text class="info-value">{{ formatTime(orderInfo.completeTime) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/order.js'
import { getEvaluationDetail } from '@/api/order.js'

export default {
  data() {
    return {
      orderId: null,
      evaluationInfo: null,
      orderInfo: null,
      userInfo: {},
      loading: true
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadEvaluationDetail()
    }
  },

  methods: {
    /**
     * 加载评价详情
     */
    async loadEvaluationDetail() {
      try {
        uni.showLoading({ title: '加载中...' })

        // 并行加载评价详情和订单详情
        const [evalRes, orderRes] = await Promise.all([
          getEvaluationDetail(this.orderId),
          getOrderDetail(this.orderId)
        ])

        uni.hideLoading()
        this.loading = false

        // 处理评价数据
        if (evalRes.code === 200 && evalRes.data) {
          this.evaluationInfo = evalRes.data
          this.userInfo = evalRes.data.user || {}
          console.log('✅ 评价详情加载成功:', this.evaluationInfo)
        } else {
          // 评价可能不存在
          this.evaluationInfo = null
        }

        // 处理订单数据
        if (orderRes.code === 200 && orderRes.data) {
          this.orderInfo = orderRes.data
        }
      } catch (error) {
        uni.hideLoading()
        this.loading = false
        console.error('❌ 加载评价详情失败:', error)
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    /**
     * 获取评分文字
     */
    getRatingText(rating) {
      const texts = {
        1: '非常不满意',
        2: '不满意',
        3: '一般',
        4: '满意',
        5: '非常满意'
      }
      return texts[rating] || ''
    },

    /**
     * 获取服务类型名称
     */
    getServiceTypeName(type) {
      const types = {
        1: '帮我买',
        2: '帮我送',
        3: '帮我取',
        4: '全能'
      }
      return types[type] || '-'
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
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.evaluation-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-back,
.nav-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

/* 详情内容 */
.detail-content {
  flex: 1;
  margin-top: 54px;
  padding: 15px;
  overflow-y: auto;
}

/* 加载状态 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 16px;
}

/* 评价详情 */
.evaluation-detail {
  background-color: #fff;
  border-radius: 12px;
  padding: 25px;
}

/* 用户信息 */
.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.user-avatar {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  margin-right: 12px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.evaluate-time {
  font-size: 13px;
  color: #999;
}

/* 评分显示 */
.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
  border-bottom: 1px solid #f5f5f5;
}

.stars {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.star-icon {
  font-size: 40px;
  color: #ffd700;
}

.rating-text {
  font-size: 15px;
  color: #667eea;
  font-weight: 600;
}

/* 评价标签 */
.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f5;
}

.tag-item {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
}

/* 评价内容 */
.comment-display {
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-text {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
}

/* 订单信息 */
.order-info {
  padding: 20px 0;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
}
</style>
