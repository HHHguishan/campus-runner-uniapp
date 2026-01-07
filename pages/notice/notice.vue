<template>
  <view class="notice-container">
    <!-- 公告类型筛选 -->
    <view class="type-tabs">
      <view
        class="tab-item"
        :class="{ active: currentType === null }"
        @tap="switchType(null)"
      >
        全部
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === 1 }"
        @tap="switchType(1)"
      >
        系统公告
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === 2 }"
        @tap="switchType(2)"
      >
        活动通知
      </view>
    </view>

    <!-- 公告列表 -->
    <view class="notice-list" v-if="noticeList.length > 0">
      <view
        class="notice-item"
        v-for="notice in noticeList"
        :key="notice.id"
        @tap="viewNoticeDetail(notice)"
      >
        <view class="notice-header">
          <view class="notice-title-row">
            <text class="notice-tag" v-if="notice.type === 1">公告</text>
            <text class="notice-tag activity" v-else-if="notice.type === 2">活动</text>
            <text class="notice-title">{{ notice.title }}</text>
          </view>
          <text class="notice-time">{{ formatTime(notice.createTime) }}</text>
        </view>

        <view class="notice-content" v-if="notice.imgUrl">
          <image :src="notice.imgUrl" class="notice-image" mode="aspectFill"></image>
        </view>

        <view class="notice-desc" v-if="notice.content">
          <text class="desc-text">{{ getContentPreview(notice.content) }}</text>
          <text class="view-more">查看详情 ›</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">📢</text>
      <text class="empty-text">暂无公告</text>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getNoticeList } from '../../api/notice.js'

export default {
  data() {
    return {
      currentType: null, // 当前选中的类型 null=全部 1=公告 2=活动
      noticeList: [],
      loading: false
    }
  },

  onLoad() {
    this.loadNotices()
  },

  methods: {
    // 加载公告列表
    async loadNotices() {
      this.loading = true
      try {
        console.log('=== 开始加载公告列表 ===')
        console.log('当前公告类型:', this.currentType)

        const params = {}
        if (this.currentType !== null) {
          params.type = this.currentType
        }

        console.log('请求参数:', params)

        const res = await getNoticeList(params)

        console.log('公告API响应:', res)
        console.log('响应码:', res.code)
        console.log('响应数据:', res.data)
        console.log('数据类型:', typeof res.data)
        console.log('是否为数组:', Array.isArray(res.data))

        if (res.code === 200 && res.data) {
          // 确保data是数组
          const noticeData = Array.isArray(res.data) ? res.data : []

          console.log('处理后的公告数据:', noticeData)
          console.log('公告数量:', noticeData.length)

          // 处理公告数据，确保字段完整性
          this.noticeList = noticeData.map(item => {
            return {
              id: item.id,
              title: item.title || '公告标题',
              content: item.content,
              imgUrl: item.imgUrl || item.imageUrl || '',
              type: item.type,
              status: item.status,
              sort: item.sort || 0,
              createTime: item.createTime
            }
          })

          console.log('最终公告列表:', this.noticeList)
        } else {
          console.log('响应码不是200或没有数据')
          this.noticeList = []
        }
      } catch (error) {
        console.error('=== 加载公告失败 ===')
        console.error('错误信息:', error)
        console.error('错误详情:', JSON.stringify(error))

        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })

        this.noticeList = []
      } finally {
        this.loading = false
      }
    },

    // 切换公告类型
    switchType(type) {
      if (this.currentType === type) return
      this.currentType = type
      this.loadNotices()
    },

    // 查看公告详情
    viewNoticeDetail(notice) {
      // 显示公告详情弹窗
      uni.showModal({
        title: notice.title,
        content: notice.content || '暂无详细内容',
        showCancel: false,
        confirmText: '我知道了'
      })
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      // 小于1小时
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      }

      // 小于24小时
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      }

      // 小于7天
      if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前'
      }

      // 其他显示完整日期
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 获取内容预览
    getContentPreview(content) {
      if (!content) return ''
      if (content.length <= 50) return content
      return content.substring(0, 50) + '...'
    }
  }
}
</script>

<style scoped>
.notice-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 类型筛选 */
.type-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #07c160;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #07c160;
  border-radius: 2rpx;
}

/* 公告列表 */
.notice-list {
  padding: 20rpx;
}

.notice-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.notice-header {
  margin-bottom: 20rpx;
}

.notice-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.notice-tag {
  background: #e6f7ff;
  color: #1890ff;
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
}

.notice-tag.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.notice-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 24rpx;
  color: #999;
}

.notice-content {
  margin-bottom: 20rpx;
}

.notice-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
}

.notice-desc {
  display: flex;
  flex-direction: column;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.view-more {
  font-size: 26rpx;
  color: #07c160;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
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

/* 加载中 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}
</style>
