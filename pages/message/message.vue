<template>
  <view class="message-container">
    <!-- 功能入口列表 -->
    <view class="function-list">
      <!-- 系统公告 -->
      <view class="function-item" @tap="goToNotice">
        <view class="item-left">
          <view class="item-icon notice-icon">📢</view>
          <view class="item-info">
            <text class="item-title">系统公告</text>
            <text class="item-desc">查看最新系统公告和活动通知</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 订单消息 -->
      <view class="function-item" @tap="goToOrders">
        <view class="item-left">
          <view class="item-icon order-icon">📦</view>
          <view class="item-info">
            <text class="item-title">订单消息</text>
            <text class="item-desc">查看订单相关的通知消息</text>
          </view>
        </view>
        <view class="item-right">
          <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 系统通知 -->
      <view class="function-item">
        <view class="item-left">
          <view class="item-icon system-icon">🔔</view>
          <view class="item-info">
            <text class="item-title">系统通知</text>
            <text class="item-desc">账户变动、安全提醒等</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 最新公告预览 -->
    <view class="latest-notice" v-if="latestNotice" @tap="goToNotice">
      <view class="notice-header">
        <text class="section-title">📢 最新公告</text>
        <text class="more-btn">查看更多 ›</text>
      </view>
      <view class="notice-card">
        <text class="notice-title-text">{{ latestNotice.title }}</text>
        <text class="notice-time-text">{{ formatTime(latestNotice.createTime) }}</text>
      </view>
    </view>

    <!-- 暂无消息提示 -->
    <view class="empty-tips" v-if="!latestNotice">
      <text class="tips-icon">💬</text>
      <text class="tips-text">暂无新消息</text>
    </view>
  </view>
</template>

<script>
import { getNoticeList } from '../../api/notice.js'

export default {
  data() {
    return {
      latestNotice: null,
      unreadCount: 0
    }
  },

  onLoad() {
    this.loadLatestNotice()
  },

  methods: {
    // 加载最新公告
    async loadLatestNotice() {
      try {
        console.log('=== 开始加载最新公告 ===')

        const res = await getNoticeList({ type: 1 })

        console.log('最新公告API响应:', res)
        console.log('响应数据:', res.data)

        if (res.code === 200 && res.data) {
          const noticeData = Array.isArray(res.data) ? res.data : []

          console.log('公告数量:', noticeData.length)

          if (noticeData.length > 0) {
            // 取第一条作为最新公告
            this.latestNotice = noticeData[0]
            console.log('最新公告:', this.latestNotice)
          }
        }
      } catch (error) {
        console.error('=== 加载最新公告失败 ===')
        console.error('错误信息:', error)
      }
    },

    // 跳转到公告页面
    goToNotice() {
      uni.navigateTo({
        url: '/pages/notice/notice'
      })
    },

    // 跳转到订单页面
    goToOrders() {
      uni.switchTab({
        url: '/pages/orders/orders'
      })
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      }

      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      }

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 功能列表 */
.function-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
}

.notice-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.order-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.system-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

.item-right {
  display: flex;
  align-items: center;
}

.badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-right: 16rpx;
  min-width: 32rpx;
  text-align: center;
}

.arrow {
  font-size: 40rpx;
  color: #ccc;
  font-weight: 300;
}

/* 最新公告 */
.latest-notice {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.notice-header {
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

.more-btn {
  font-size: 26rpx;
  color: #07c160;
}

.notice-card {
  background: #f8f8f8;
  padding: 24rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
}

.notice-title-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.notice-time-text {
  font-size: 24rpx;
  color: #999;
}

/* 空状态 */
.empty-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.tips-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.tips-text {
  font-size: 28rpx;
  color: #999;
}
</style>
