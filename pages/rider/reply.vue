<template>
  <view class="reply-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">回复评价</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 评价信息 -->
    <scroll-view class="content" scroll-y>
      <!-- 用户评价 -->
      <view class="evaluation-card" v-if="evaluationInfo">
        <view class="card-header">
          <text class="header-title">用户评价</text>
          <view class="rating-stars">
            <text
              class="star-icon"
              v-for="(star, index) in 5"
              :key="index"
            >
              {{ index < evaluationInfo.rating ? '★' : '☆' }}
            </text>
          </view>
        </view>

        <view class="evaluation-tags" v-if="getTags().length > 0">
          <view
            class="tag-item"
            v-for="(tag, index) in getTags()"
            :key="index"
          >
            {{ tag }}
          </view>
        </view>

        <view class="evaluation-content">
          <text class="feedback-text">{{ getFeedbackText() }}</text>
        </view>

        <view class="evaluation-time">
          <text>{{ formatTime(evaluationInfo.evaluationTime) }}</text>
        </view>
      </view>

      <!-- 回复输入 -->
      <view class="reply-section">
        <view class="section-title">
          <text class="title-text">您的回复</text>
          <text class="title-tip">{{ replyContent.length }}/200</text>
        </view>
        <textarea
          class="reply-input"
          v-model="replyContent"
          placeholder="感谢您的评价，我会继续努力提供优质服务~"
          maxlength="200"
          :show-confirm-bar="false"
        ></textarea>

        <!-- 快捷回复 -->
        <view class="quick-replies">
          <view class="quick-title">快捷回复：</view>
          <view class="quick-list">
            <view
              class="quick-item"
              v-for="(quick, index) in quickReplies"
              :key="index"
              @click="selectQuickReply(quick)"
            >
              {{ quick }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <button class="btn-submit" @click="submitReply" :disabled="!replyContent.trim()">
        提交回复
      </button>
    </view>
  </view>
</template>

<script>
import { getEvaluationDetail } from '@/api/order.js'
import { submitRiderReply } from '@/api/rider.js'

export default {
  data() {
    return {
      orderId: null,
      evaluationInfo: null,
      replyContent: '',
      quickReplies: [
        '感谢您的好评，期待再次为您服务！',
        '谢谢您的认可，我会继续努力的！',
        '感谢您的评价，祝您生活愉快！',
        '非常感谢您的理解与支持！',
        '您的满意就是我们最大的动力！'
      ]
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadEvaluation()
    }
  },

  methods: {
    /**
     * 加载评价信息
     */
    async loadEvaluation() {
      try {
        uni.showLoading({ title: '加载中...' })

        const res = await getEvaluationDetail(this.orderId)

        uni.hideLoading()

        if (res.code === 200 && res.data) {
          this.evaluationInfo = res.data
        } else {
          uni.showToast({
            title: '评价信息不存在',
            icon: 'none'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('加载评价失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      }
    },

    /**
     * 从评价内容中提取标签
     */
    getTags() {
      if (!this.evaluationInfo || !this.evaluationInfo.feedback) return []

      const feedback = this.evaluationInfo.feedback
      const tagMatch = feedback.match(/\[(.*?)\]/)

      if (tagMatch && tagMatch[1]) {
        return tagMatch[1].split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      return []
    },

    /**
     * 获取纯文本评价内容
     */
    getFeedbackText() {
      if (!this.evaluationInfo || !this.evaluationInfo.feedback) return ''

      let feedback = this.evaluationInfo.feedback
      feedback = feedback.replace(/\[.*?\]\s*/, '')
      return feedback.trim()
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
     * 选择快捷回复
     */
    selectQuickReply(quick) {
      this.replyContent = quick
    },

    /**
     * 提交回复
     */
    async submitReply() {
      const content = this.replyContent.trim()

      if (!content) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({ title: '提交中...', mask: true })

        await submitRiderReply({
          orderId: Number(this.orderId),
          riderReply: content
        })

        uni.hideLoading()

        uni.showToast({
          title: '回复成功',
          icon: 'success'
        })

        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)

      } catch (error) {
        uni.hideLoading()
        console.error('回复失败:', error)
        uni.showToast({
          title: error.message || '回复失败，请重试',
          icon: 'none'
        })
      }
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

<style scoped>
.reply-container {
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
}

.back-icon {
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.nav-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* 内容区域 */
.content {
  flex: 1;
  margin-top: 54px;
  margin-bottom: 80px;
  padding: 15px;
  overflow-y: auto;
}

/* 评价卡片 */
.evaluation-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star-icon {
  font-size: 20px;
  color: #ffd700;
}

.evaluation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.tag-item {
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
}

.evaluation-content {
  margin-bottom: 12px;
}

.feedback-text {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.evaluation-time {
  text-align: right;
}

.evaluation-time text {
  font-size: 12px;
  color: #999;
}

/* 回复区域 */
.reply-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.title-tip {
  font-size: 12px;
  color: #999;
}

.reply-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  font-size: 15px;
  color: #333;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: none;
  resize: none;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* 快捷回复 */
.quick-replies {
  margin-top: 16px;
}

.quick-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-item {
  padding: 8px 16px;
  background: #f0f7ff;
  color: #1890ff;
  font-size: 13px;
  border-radius: 20px;
  border: 1px solid #1890ff;
}

/* 底部提交栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.btn-submit {
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
}

.btn-submit[disabled] {
  background: #ccc;
  color: #999;
}

.btn-submit::after {
  border: none;
}
</style>
