<template>
  <view class="order-detail-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">订单详情</view>
      <view class="nav-action" @click="showMoreMenu">
        <text class="iconfont">⋯</text>
      </view>
    </view>

    <!-- 订单内容 -->
    <scroll-view class="detail-content" scroll-y>
      <!-- 订单状态卡片 -->
      <view class="status-card" :class="'status-' + orderStatus">
        <view class="status-icon">
          <text>{{ getStatusIcon(orderStatus) }}</text>
        </view>
        <view class="status-info">
          <text class="status-title">{{ getStatusTitle(orderStatus) }}</text>
          <text class="status-desc">{{ getStatusDesc(orderStatus) }}</text>
        </view>
      </view>

      <!-- 配送进度 -->
      <view class="progress-section" v-if="orderInfo && orderInfo.serviceType">
        <view class="section-title">配送进度</view>
        <view class="progress-timeline">
          <view class="timeline-item" :class="{ active: orderStatus >= 1 }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">订单已创建</text>
              <text class="timeline-time">{{ formatTime(orderInfo.createTime) }}</text>
            </view>
          </view>
          <view class="timeline-item" :class="{ active: orderStatus >= 2 }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">骑手已接单</text>
              <text class="timeline-time">{{ orderInfo.acceptTime ? formatTime(orderInfo.acceptTime) : '等待接单' }}</text>
            </view>
          </view>
          <view class="timeline-item" :class="{ active: orderStatus >= 3 }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">配送中</text>
              <text class="timeline-time">{{ orderInfo.deliveryTime ? formatTime(orderInfo.deliveryTime) : '配送中' }}</text>
            </view>
          </view>
          <view class="timeline-item" :class="{ active: orderStatus >= 4 }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">已完成</text>
              <text class="timeline-time">{{ orderInfo.completeTime ? formatTime(orderInfo.completeTime) : '等待完成' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-section" v-if="orderInfo">
        <view class="section-title">订单信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <view class="info-value-row">
              <text class="info-value">{{ orderInfo.orderNo || '-' }}</text>
              <text class="btn-copy" @click="copyOrderNo">复制</text>
            </view>
          </view>
          <view class="info-item">
            <text class="info-label">服务类型</text>
            <text class="info-value">{{ getServiceTypeName(orderInfo.serviceType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">物品信息</text>
            <text class="info-value">{{ orderInfo.goodsInfo || '-' }}</text>
          </view>
          <view class="info-item" v-if="orderInfo.remark">
            <text class="info-label">备注</text>
            <text class="info-value">{{ orderInfo.remark }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">下单时间</text>
            <text class="info-value">{{ formatTime(orderInfo.createTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 地址信息 -->
      <view class="address-section" v-if="orderInfo">
        <view class="section-title">地址信息</view>
        <view class="address-list">
          <!-- 取件地址 -->
          <view class="address-item">
            <view class="address-icon pickup">
              <text>📍</text>
            </view>
            <view class="address-info">
              <view class="address-header">
                <text class="address-tag">取件地址</text>
              </view>
              <view class="address-detail">{{ orderInfo.addressInfo?.pickupAddress || '-' }}</view>
            </view>
          </view>

          <!-- 送达地址 -->
          <view class="address-item">
            <view class="address-icon delivery">
              <text>🎯</text>
            </view>
            <view class="address-info">
              <view class="address-header">
                <text class="address-tag">送达地址</text>
                <text class="contact-info">{{ orderInfo.deliveryName }} {{ orderInfo.deliveryPhone }}</text>
              </view>
              <view class="address-detail">{{ orderInfo.deliveryAddress || '-' }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 骑手信息 -->
      <view class="rider-section" v-if="riderInfo">
        <view class="section-title">骑手信息</view>
        <view class="rider-card">
          <view class="rider-avatar">
            <text>{{ riderInfo.realName ? riderInfo.realName.substring(0, 1) : '骑' }}</text>
          </view>
          <view class="rider-info">
            <text class="rider-name">{{ riderInfo.realName || '骑手' }}</text>
            <text class="rider-rating" v-if="riderInfo.averageRating">⭐ {{ riderInfo.averageRating.toFixed(1) }}</text>
          </view>
          <view class="rider-actions">
            <button class="btn-call" @click="callRider">
              <text class="btn-icon">📞</text>
              <text>联系</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="cost-section" v-if="orderInfo">
        <view class="section-title">费用明细</view>
        <view class="cost-list">
          <view class="cost-item">
            <text class="cost-label">商品/服务费</text>
            <text class="cost-value">¥{{ orderInfo.goodsAmount || '0.00' }}</text>
          </view>
          <view class="cost-item">
            <text class="cost-label">配送费</text>
            <text class="cost-value">¥{{ orderInfo.deliveryFee || '0.00' }}</text>
          </view>
          <view class="cost-item total">
            <text class="cost-label">实付款</text>
            <text class="cost-value">¥{{ orderInfo.totalAmount || '0.00' }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="orderInfo && shouldShowBottomBar">
      <!-- 待支付状态 -->
      <view class="action-buttons" v-if="orderStatus === 0">
        <button class="btn-cancel" @click="cancelOrder">取消订单</button>
        <button class="btn-primary" @click="goToPay">去支付</button>
      </view>

      <!-- 待接单状态 -->
      <view class="action-buttons" v-if="orderStatus === 1">
        <button class="btn-cancel" @click="cancelOrder">取消订单</button>
      </view>

      <!-- 配送中状态 -->
      <view class="action-buttons" v-if="orderStatus === 2">
        <button class="btn-primary" @click="contactRider">联系骑手</button>
      </view>

      <!-- 已完成状态 - 未评价 -->
      <view class="action-buttons" v-if="orderStatus === 3 && (orderInfo.rating === null || orderInfo.rating === undefined)">
        <button class="btn-primary" @click="goToEvaluate">去评价</button>
      </view>

      <!-- 已完成状态 - 已评价 -->
      <view class="action-buttons" v-if="orderStatus === 3 && (orderInfo.rating !== null && orderInfo.rating !== undefined)">
        <button class="btn-primary" @click="viewEvaluation">查看评价</button>
      </view>

      <!-- 已取消状态 -->
      <view class="action-buttons" v-if="orderStatus === 4">
        <button class="btn-cancel" @click="deleteOrder">删除订单</button>
        <button class="btn-primary" @click="reorder">再来一单</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderDetail, cancelOrder } from '@/api/order.js'

export default {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      riderInfo: null,
      orderStatus: 0 // 0-待支付, 1-待接单, 2-配送中, 3-已完成, 4-已取消
    }
  },

  computed: {
    /**
     * 是否显示底部操作栏
     */
    shouldShowBottomBar() {
      // 只有0-4的状态才显示底部栏
      return this.orderStatus >= 0 && this.orderStatus <= 4
    }
  },

  onLoad(options) {
    if (options.id) {
      this.orderId = options.id
      this.loadOrderDetail()
    }
  },

  onShow() {
    // 从支付页返回时刷新订单状态
    if (this.orderId) {
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
          this.orderStatus = res.data.status || 0

          // 如果有骑手信息
          if (res.data.runnerInfo) {
            this.riderInfo = res.data.runnerInfo
          }

          console.log('✅ 订单详情加载成功:', this.orderInfo)
          console.log('📊 评价状态检查:', {
            rating: this.orderInfo.rating,
            hasRating: !!this.orderInfo.rating,
            status: this.orderStatus
          })
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
     * 获取状态图标
     */
    getStatusIcon(status) {
      const icons = {
        0: '💳', // 待支付
        1: '⏰', // 待接单
        2: '🚚', // 配送中
        3: '✅', // 已完成
        4: '❌'  // 已取消
      }
      return icons[status] || '📦'
    },

    /**
     * 获取状态标题
     */
    getStatusTitle(status) {
      const titles = {
        0: '待支付',
        1: '等待接单',
        2: '配送中',
        3: '已完成',
        4: '已取消'
      }
      return titles[status] || '未知状态'
    },

    /**
     * 获取状态描述
     */
    getStatusDesc(status) {
      const descs = {
        0: '请在30分钟内完成支付',
        1: '正在为您匹配合适的骑手',
        2: '骑手正在火速配送中',
        3: '订单已完成',
        4: '订单已取消'
      }
      return descs[status] || ''
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
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    },

    /**
     * 复制订单号
     */
    copyOrderNo() {
      if (!this.orderInfo || !this.orderInfo.orderNo) return

      uni.setClipboardData({
        data: this.orderInfo.orderNo,
        success: () => {
          uni.showToast({
            title: '订单号已复制',
            icon: 'success'
          })
        }
      })
    },

    /**
     * 联系骑手
     */
    contactRider() {
      if (!this.riderInfo) return

      uni.showActionSheet({
        itemList: ['拨打电话'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.callRider()
          }
        }
      })
    },

    /**
     * 拨打骑手电话
     */
    callRider() {
      if (!this.riderInfo || !this.riderInfo.phone) {
        uni.showToast({
          title: '暂无联系方式',
          icon: 'none'
        })
        return
      }

      uni.makePhoneCall({
        phoneNumber: this.riderInfo.phone
      })
    },

    /**
     * 取消订单
     */
    cancelOrder() {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '取消中...' })

              const result = await cancelOrder({
                orderId: this.orderId,
                cancelReason: '用户主动取消'
              })

              uni.hideLoading()

              if (result.code === 200) {
                uni.showToast({
                  title: '订单已取消',
                  icon: 'success'
                })
                // 刷新订单状态
                this.loadOrderDetail()
              } else {
                uni.showToast({
                  title: result.message || '取消失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('❌ 取消订单失败:', error)
              uni.showToast({
                title: '取消失败，请稍后重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 去支付
     */
    goToPay() {
      uni.navigateTo({
        url: `/pages/order/payment?orderId=${this.orderId}&totalAmount=${this.orderInfo.totalAmount}`
      })
    },

    /**
     * 去评价
     */
    goToEvaluate() {
      uni.navigateTo({
        url: `/pages/evaluation/create?orderId=${this.orderId}`
      })
    },

    /**
     * 查看评价
     */
    viewEvaluation() {
      uni.navigateTo({
        url: `/pages/evaluation/detail?orderId=${this.orderId}`
      })
    },

    /**
     * 更多菜单
     */
    showMoreMenu() {
      uni.showActionSheet({
        itemList: ['复制订单号', '联系客服'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.copyOrderNo()
          } else if (res.tapIndex === 1) {
            uni.showToast({
              title: '客服功能开发中',
              icon: 'none'
            })
          }
        }
      })
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 删除订单
     */
    deleteOrder() {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除这个订单吗？删除后将无法恢复',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '删除功能开发中',
              icon: 'none'
            })
            // TODO: 调用删除订单API
            // const res = await deleteOrderApi(this.orderId)
          }
        }
      })
    },

    /**
     * 再来一单
     */
    reorder() {
      if (!this.orderInfo) return

      // 跳转到创建订单页面，携带订单信息
      uni.navigateTo({
        url: `/pages/order/create?orderId=${this.orderId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-container {
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
.nav-action {
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
  margin-bottom: 70px;
  padding: 15px;
  overflow-y: auto;
}

/* 状态卡片 */
.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 25px 20px;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.status-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 30px;
  margin-right: 15px;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 6px;
}

.status-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 进度时间线 */
.progress-section,
.info-section,
.address-section,
.rider-section,
.cost-section {
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
}

.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background-color: #e0e0e0;
}

.timeline-item.active:not(:last-child)::after {
  background: linear-gradient(180deg, #667eea 0%, #e0e0e0 100%);
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #e0e0e0;
  margin-right: 12px;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  background-color: #667eea;
  box-shadow: 0 0 0 2px #667eea;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.timeline-item.active .timeline-title {
  color: #667eea;
}

.timeline-time {
  font-size: 12px;
  color: #999;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 15px;
}

.info-value-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.btn-copy {
  font-size: 12px;
  color: #667eea;
  padding: 4px 8px;
  background-color: #f0f4ff;
  border-radius: 4px;
}

/* 地址列表 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-item {
  display: flex;
  align-items: flex-start;
}

.address-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 50%;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.address-tag {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  margin-right: 10px;
}

.contact-info {
  font-size: 13px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 骑手卡片 */
.rider-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.rider-avatar {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
}

.rider-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rider-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.rider-rating {
  font-size: 12px;
  color: #ff9800;
}

.rider-actions {
  display: flex;
  gap: 8px;
}

.btn-call {
  padding: 8px 16px;
  background-color: #fff;
  color: #667eea;
  font-size: 13px;
  border-radius: 16px;
  border: none;
}

.btn-call .btn-icon {
  margin-right: 4px;
}

/* 费用列表 */
.cost-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.cost-label {
  font-size: 14px;
  color: #666;
}

.cost-value {
  font-size: 14px;
  color: #333;
}

.cost-item.total {
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 4px;
}

.cost-item.total .cost-label {
  font-weight: 600;
  color: #333;
}

.cost-item.total .cost-value {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons button {
  flex: 1;
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
