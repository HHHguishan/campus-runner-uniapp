<template>
  <view class="payment-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">确认支付</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 支付内容 -->
    <view class="payment-content">
      <!-- 订单金额 -->
      <view class="amount-card">
        <view class="amount-label">支付金额</view>
        <view class="amount-value">
          <text class="amount-symbol">¥</text>
          <text class="amount-number">{{ totalAmount }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info-section" v-if="orderInfo">
        <view class="section-title">订单信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ orderInfo.orderNo || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务类型</text>
            <text class="info-value">{{ getServiceTypeName(orderInfo.serviceType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">物品信息</text>
            <text class="info-value">{{ orderInfo.goodsInfo || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-method-section">
        <view class="section-title">支付方式</view>
        <view class="payment-method-list">
          <!-- 余额支付 -->
          <view class="payment-method-item" @click="selectPayType(1)">
            <view class="method-left">
              <view class="method-icon">
                <text>💰</text>
              </view>
              <view class="method-info">
                <text class="method-name">余额支付</text>
                <text class="method-desc">当前余额：¥{{ balance }}</text>
              </view>
            </view>
            <view class="method-check" :class="{ active: payType === 1 }">
              <text class="check-icon" v-if="payType === 1">✓</text>
            </view>
          </view>

          <!-- 微信支付（未开通） -->
          <view class="payment-method-item disabled">
            <view class="method-left">
              <view class="method-icon">
                <text>💚</text>
              </view>
              <view class="method-info">
                <text class="method-name">微信支付</text>
                <text class="method-desc">暂未开通</text>
              </view>
            </view>
            <view class="method-tag">即将开放</view>
          </view>
        </view>
      </view>

      <!-- 支付说明 -->
      <view class="tips-section">
        <view class="tips-title">支付说明</view>
        <view class="tips-list">
          <text class="tip-item">• 订单提交后30分钟内未支付将自动取消</text>
          <text class="tip-item">• 支付成功后，订单将发送给骑手</text>
          <text class="tip-item">• 如有疑问请联系客服</text>
        </view>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-bar">
      <view class="bar-info">
        <text class="bar-label">支付金额：</text>
        <text class="bar-amount">¥{{ totalAmount }}</text>
      </view>
      <button class="btn-pay" @click="confirmPay" :disabled="paying">
        {{ paying ? '支付中...' : '确认支付' }}
      </button>
    </view>
  </view>
</template>

<script>
import { payOrder, getOrderDetail } from '@/api/order.js'
import { getWalletBalance } from '@/api/wallet.js'

export default {
  data() {
    return {
      orderId: null,
      totalAmount: '0.00',
      orderInfo: null,
      payType: 1, // 1-余额支付
      balance: 0, // 余额
      paying: false // 支付中
    }
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
    }
    if (options.totalAmount) {
      this.totalAmount = Number(options.totalAmount).toFixed(2)
    }

    // 加载订单详情
    if (this.orderId) {
      this.loadOrderDetail()
    }

    // 加载余额
    this.loadBalance()
  },

  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        const res = await getOrderDetail(this.orderId)
        if (res.code === 200 && res.data) {
          this.orderInfo = res.data
          // 如果接口返回了金额，使用接口返回的金额
          if (res.data.totalAmount) {
            this.totalAmount = Number(res.data.totalAmount).toFixed(2)
          }
        }
      } catch (error) {
        console.error('❌ 加载订单详情失败:', error)
      }
    },

    /**
     * 加载余额
     */
    async loadBalance() {
      try {
        const res = await getWalletBalance()
        if (res.code === 200) {
          this.balance = Number(res.data || 0).toFixed(2)
        }
      } catch (error) {
        console.error('❌ 加载余额失败:', error)
      }
    },

    /**
     * 选择支付方式
     */
    selectPayType(type) {
      this.payType = type
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
     * 确认支付
     */
    async confirmPay() {
      // 余额不足检查
      if (this.payType === 1 && Number(this.balance) < Number(this.totalAmount)) {
        uni.showModal({
          title: '余额不足',
          content: `当前余额：¥${this.balance}\n支付金额：¥${this.totalAmount}\n\n请先充值`,
          confirmText: '去充值',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/wallet/recharge'
              })
            }
          }
        })
        return
      }

      // 确认支付
      uni.showModal({
        title: '确认支付',
        content: `确定支付 ¥${this.totalAmount} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.doPay()
          }
        }
      })
    },

    /**
     * 执行支付
     */
    async doPay() {
      if (this.paying) return

      try {
        this.paying = true
        uni.showLoading({ title: '支付中...' })

        const res = await payOrder({
          orderId: this.orderId,
          payType: this.payType
          // payPassword: '123456' // 如果需要支付密码
        })

        uni.hideLoading()
        this.paying = false

        if (res.code === 200) {
          uni.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1500
          })

          // 跳转到订单详情页
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/order/detail?id=${this.orderId}`
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '支付失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        this.paying = false
        console.error('❌ 支付失败:', error)
        uni.showToast({
          title: '支付失败，请稍后重试',
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
.payment-container {
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

.nav-back {
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

.nav-placeholder {
  width: 40px;
}

/* 支付内容 */
.payment-content {
  flex: 1;
  margin-top: 54px;
  margin-bottom: 70px;
  padding: 15px;
  overflow-y: auto;
}

/* 金额卡片 */
.amount-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 15px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.amount-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.amount-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.amount-symbol {
  font-size: 32px;
  color: #fff;
  margin-right: 4px;
}

.amount-number {
  font-size: 56px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

/* 订单信息 */
.order-info-section,
.payment-method-section,
.tips-section {
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
  font-weight: 500;
}

/* 支付方式 */
.payment-method-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method-item:active {
  background-color: #eef0f5;
}

.method-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.method-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  font-size: 20px;
  margin-right: 12px;
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

.method-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 50%;
}

.method-check.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.check-icon {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.method-tag {
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
}

.payment-method-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 支付说明 */
.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.tips-list {
  display: flex;
  flex-direction: column;
}

.tip-item {
  font-size: 13px;
  color: #999;
  line-height: 1.8;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bar-info {
  flex: 1;
}

.bar-label {
  font-size: 13px;
  color: #666;
}

.bar-amount {
  font-size: 20px;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 8px;
}

.btn-pay {
  width: 120px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 22px;
  border: none;
}

.btn-pay[disabled] {
  opacity: 0.5;
}
</style>
