<template>
  <view class="admin-order-detail">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">订单详情</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 详情内容 -->
    <view class="detail-content" v-if="orderInfo">
      <!-- 订单状态卡片 -->
      <view class="status-card">
        <view class="status-icon">
          <text>{{ getStatusIcon(orderInfo.status) }}</text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ getStatusText(orderInfo.status) }}</text>
          <text class="status-desc">{{ getStatusDesc(orderInfo.status) }}</text>
        </view>
      </view>

      <!-- 订单基本信息 -->
      <view class="info-section">
        <view class="section-title">基本信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ orderInfo.orderNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务类型</text>
            <view class="type-badge" :class="'type-' + orderInfo.type">
              {{ getOrderTypeText(orderInfo.type) }}
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">订单金额</text>
            <text class="info-value amount">¥{{ orderInfo.totalFee }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">配送费</text>
            <text class="info-value">¥{{ orderInfo.deliveryFee }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ formatFullTime(orderInfo.createTime) }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.payTime">
            <text class="info-label">支付时间</text>
            <text class="info-value">{{ formatFullTime(orderInfo.payTime) }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.grabTime">
            <text class="info-label">接单时间</text>
            <text class="info-value">{{ formatFullTime(orderInfo.grabTime) }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.finishTime">
            <text class="info-label">完成时间</text>
            <text class="info-value">{{ formatFullTime(orderInfo.finishTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="info-section">
        <view class="section-title">商品信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">商品描述</text>
            <text class="info-value">{{ orderInfo.goodsDesc || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品重量</text>
            <text class="info-value">{{ orderInfo.goodsWeight || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">备注说明</text>
            <text class="info-value">{{ orderInfo.remark || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 用户信息 -->
      <view class="info-section">
        <view class="section-title">用户信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">用户昵称</text>
            <text class="info-value">{{ orderInfo.userNickname || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系人</text>
            <text class="info-value">{{ orderInfo.contactName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value phone">{{ orderInfo.contactPhone || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 骑手信息 -->
      <view class="info-section" v-if="orderInfo.runnerId">
        <view class="section-title">骑手信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">骑手昵称</text>
            <text class="info-value">{{ orderInfo.runnerNickname || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">骑手手机</text>
            <text class="info-value phone">{{ orderInfo.runnerPhone || '-' }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.evidenceImage">
            <text class="info-label">完成凭证</text>
            <image class="evidence-image" :src="orderInfo.evidenceImage"
                   mode="aspectFill" @click="previewImage(orderInfo.evidenceImage)"></image>
          </view>
        </view>
      </view>

      <!-- 配送信息 -->
      <view class="info-section">
        <view class="section-title">配送信息</view>
        <view class="info-list">
          <view class="info-item full-width">
            <text class="info-label">取货地址</text>
            <text class="info-value address">{{ orderInfo.fetchAddress }}</text>
          </view>
          <view class="info-item full-width">
            <text class="info-label">送货地址</text>
            <text class="info-value address">{{ orderInfo.deliveryAddress }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.distance">
            <text class="info-label">配送距离</text>
            <text class="info-value">{{ orderInfo.distance }} km</text>
          </view>
        </view>
      </view>

      <!-- 支付信息 -->
      <view class="info-section" v-if="orderInfo.status > 0">
        <view class="section-title">支付信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">支付方式</text>
            <text class="info-value">{{ getPayTypeText(orderInfo.payType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">支付金额</text>
            <text class="info-value amount">¥{{ orderInfo.totalFee }}</text>
          </view>
        </view>
      </view>

      <!-- 取消/退款信息 -->
      <view class="info-section" v-if="orderInfo.status === 4 || orderInfo.status === 5">
        <view class="section-title">{{ orderInfo.status === 4 ? '取消信息' : '退款信息' }}</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">{{ orderInfo.status === 4 ? '取消原因' : '退款原因' }}</text>
            <text class="info-value">{{ orderInfo.cancelReason || '-' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-else>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getAdminOrderDetail } from '@/api/admin.js'

export default {
  data() {
    return {
      orderId: null,
      orderInfo: null
    }
  },

  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      this.loadOrderDetail()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },

  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        uni.showLoading({ title: '加载中...' })

        console.log('📋 加载订单详情，订单ID：', this.orderId)

        const res = await getAdminOrderDetail(this.orderId)
        console.log('📋 订单详情响应：', res)

        uni.hideLoading()

        if (res.code === 200) {
          this.orderInfo = res.data
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 加载订单详情失败：', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    /**
     * 获取订单状态图标
     */
    getStatusIcon(status) {
      const iconMap = {
        0: '💰',
        1: '⏰',
        2: '🚚',
        3: '✅',
        4: '❌',
        5: '↩️'
      }
      return iconMap[status] || '📋'
    },

    /**
     * 获取订单状态文本
     */
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '待接单',
        2: '配送中',
        3: '已完成',
        4: '已取消',
        5: '退款中'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取订单状态描述
     */
    getStatusDesc(status) {
      const descMap = {
        0: '等待用户支付',
        1: '等待骑手接单',
        2: '骑手正在配送中',
        3: '订单已完成',
        4: '订单已取消',
        5: '正在处理退款'
      }
      return descMap[status] || ''
    },

    /**
     * 获取订单类型文本
     */
    getOrderTypeText(type) {
      const typeMap = {
        'buy': '帮买',
        'send': '帮送',
        'pick': '帮取',
        'all': '全能'
      }
      return typeMap[type] || type
    },

    /**
     * 获取支付方式文本
     */
    getPayTypeText(payType) {
      if (!payType) return '-'
      const typeMap = {
        'BALANCE': '余额支付',
        'ALIPAY': '支付宝',
        'WECHAT': '微信支付'
      }
      return typeMap[payType] || payType
    },

    /**
     * 格式化完整时间
     */
    formatFullTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      const second = date.getSeconds().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },

    /**
     * 预览图片
     */
    previewImage(url) {
      uni.previewImage({
        urls: [url],
        current: url
      })
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
.admin-order-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
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

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 40px;
}

/* 详情内容 */
.detail-content {
  margin-top: 54px;
  padding: 15px;
}

/* 状态卡片 */
.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.status-icon {
  font-size: 48px;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-text {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.status-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 信息区域 */
.info-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f5f5f5;
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
  min-height: 20px;
}

.info-item.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #333;
  text-align: right;
}

.info-item.full-width .info-value {
  text-align: left;
  width: 100%;
}

.info-value.amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff4d4f;
}

.info-value.phone {
  color: #667eea;
}

.info-value.address {
  line-height: 1.6;
  word-break: break-all;
}

/* 订单类型标签 */
.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-buy {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type-send {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.type-pick {
  background-color: #fff3e0;
  color: #f57c00;
}

.type-all {
  background-color: #e8f5e9;
  color: #388e3c;
}

/* 凭证图片 */
.evidence-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-left: auto;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading-text {
  font-size: 14px;
  color: #999;
}
</style>
