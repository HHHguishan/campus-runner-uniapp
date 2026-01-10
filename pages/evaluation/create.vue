<template>
  <view class="evaluation-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">评价订单</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 评价内容 -->
    <scroll-view class="evaluation-content" scroll-y>
      <!-- 订单信息 -->
      <view class="order-info" v-if="orderInfo">
        <view class="info-title">订单信息</view>
        <view class="info-detail">
          <text class="order-no">订单号: {{ orderInfo.orderNo || '-' }}</text>
          <text class="service-type">服务类型: {{ getServiceTypeName(orderInfo.serviceType) }}</text>
        </view>
      </view>

      <!-- 骑手信息 -->
      <view class="rider-info" v-if="riderInfo">
        <view class="rider-avatar">
          <text>{{ riderInfo.realName ? riderInfo.realName.substring(0, 1) : '骑' }}</text>
        </view>
        <view class="rider-detail">
          <text class="rider-name">{{ riderInfo.realName || '骑手' }}</text>
          <text class="rider-label">为您服务</text>
        </view>
      </view>

      <!-- 评分区域 -->
      <view class="rating-section">
        <view class="section-title">评分</view>
        <view class="rating-stars">
          <view
            class="star-item"
            v-for="(star, index) in 5"
            :key="index"
            @click="selectStar(index + 1)"
          >
            <text class="star-icon">{{ index < rating ? '★' : '☆' }}</text>
          </view>
        </view>
        <view class="rating-text">{{ getRatingText() }}</view>
      </view>

      <!-- 评价标签 -->
      <view class="tags-section">
        <view class="section-title">评价标签</view>
        <view class="tags-list">
          <view
            class="tag-item"
            v-for="(tag, index) in evaluationTags"
            :key="index"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </view>
        </view>
      </view>

      <!-- 文字评价 -->
      <view class="comment-section">
        <view class="section-title">详细评价</view>
        <textarea
          class="comment-input"
          v-model="comment"
          placeholder="请输入您的评价内容..."
          maxlength="200"
          :show-confirm-bar="false"
        ></textarea>
        <view class="comment-count">{{ comment.length }}/200</view>
      </view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <button class="btn-submit" @click="submitEvaluation" :disabled="!canSubmit">
        提交评价
      </button>
    </view>
  </view>
</template>

<script>
import { getOrderDetail } from '@/api/order.js'
import { submitEvaluation } from '@/api/order.js'

export default {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      riderInfo: null,
      rating: 5, // 默认5星
      comment: '',
      selectedTags: [],
      evaluationTags: [
        '配送速度快',
        '服务态度好',
        '物品完好',
        '沟通顺畅',
        '准时送达',
        '包装仔细',
        '值得信赖',
        '下次还会找你'
      ]
    }
  },

  computed: {
    canSubmit() {
      return this.rating > 0 && this.comment.trim().length > 0
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadOrderDetail()
    }
  },

  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        uni.showLoading({ title: '加载中...' })

        const res = await getOrderDetail(this.orderId)

        uni.hideLoading()

        if (res.code === 200 && res.data) {
          this.orderInfo = res.data
          // 如果有骑手信息
          if (res.data.runnerInfo) {
            this.riderInfo = res.data.runnerInfo
          }
          console.log('✅ 订单详情加载成功:', this.orderInfo)
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 加载订单详情失败:', error)
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    /**
     * 选择评分
     */
    selectStar(star) {
      this.rating = star
    },

    /**
     * 获取评分文字
     */
    getRatingText() {
      const texts = {
        1: '非常不满意',
        2: '不满意',
        3: '一般',
        4: '满意',
        5: '非常满意'
      }
      return texts[this.rating] || ''
    },

    /**
     * 切换标签
     */
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        if (this.selectedTags.length < 5) {
          this.selectedTags.push(tag)
        } else {
          uni.showToast({
            title: '最多选择5个标签',
            icon: 'none'
          })
        }
      }
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
     * 提交评价
     */
    async submitEvaluation() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请完善评价内容',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({ title: '提交中...' })

        // 将标签拼接到评价内容中
        let feedback = this.comment.trim()
        if (this.selectedTags.length > 0) {
          feedback = `[${this.selectedTags.join(', ')}] ${feedback}`
        }

        const data = {
          orderId: Number(this.orderId),
          rating: this.rating,
          feedback: feedback,
          evaluationImgs: [],
          anonymous: false
        }

        console.log('提交评价数据:', data)

        const res = await submitEvaluation(data)

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({
            title: '评价成功',
            icon: 'success'
          })

          // 延迟跳转到评价详情页
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/evaluation/detail?orderId=${this.orderId}`
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 提交评价失败:', error)
        uni.showToast({
          title: '提交失败，请稍后重试',
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

<style lang="scss" scoped>
.evaluation-container {
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

/* 评价内容 */
.evaluation-content {
  flex: 1;
  margin-top: 54px;
  margin-bottom: 80px;
  padding: 15px;
  overflow-y: auto;
}

/* 订单信息 */
.order-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.info-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-no,
.service-type {
  font-size: 14px;
  color: #666;
}

/* 骑手信息 */
.rider-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.rider-avatar {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  margin-right: 15px;
}

.rider-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rider-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.rider-label {
  font-size: 13px;
  color: #999;
}

/* 评分区域 */
.rating-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: left;
}

.rating-stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.star-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.star-item:active {
  transform: scale(1.2);
}

.star-icon {
  font-size: 48px;
  color: #ffd700;
}

.rating-text {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

/* 评价标签 */
.tags-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  padding: 10px 18px;
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tag-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: #667eea;
  transform: scale(1.05);
}

/* 文字评价 */
.comment-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.comment-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  font-size: 14px;
  color: #333;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: none;
  resize: none;
  line-height: 1.6;
}

.comment-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
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
</style>
