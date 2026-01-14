<template>
  <view class="pay-container">
    <view class="status-box">
      <view class="icon-alipay">🔷</view>
      <view class="status-text">{{ statusText }}</view>
      <view class="amount-text">¥{{ amount }}</view>
    </view>

    <!-- H5 环境下的表单容器 -->
    <!-- #ifdef H5 -->
    <view v-html="alipayForm" ref="formContainer" style="display: none;"></view>
    <!-- #endif -->

    <view class="action-box">
      <!-- #ifdef MP-WEIXIN -->
      <view class="mini-tips">
        <text>由于平台限制，请复制支付链接到浏览器打开</text>
      </view>
      <button class="btn-copy" @click="copyPayLink">复制支付链接</button>
      <!-- #endif -->
      
      <!-- #ifndef MP-WEIXIN -->
      <button class="btn-submit" @click="submitPay">立即支付</button>
      <!-- #endif -->
      
      <button class="btn-cancel" @click="goBack">返回</button>
    </view>
    
    <view class="query-tips" v-if="orderId">
      <text>支付完成后，系统将自动检测状态并回跳</text>
    </view>

    <view class="check-box" v-if="isPaid">
      <text class="success-tip">✅ 检测到支付已完成</text>
    </view>
    <button v-else-if="alipayForm" class="btn-check" @click="checkPayStatus">我已完成支付，点击刷新</button>
  </view>
</template>

<script>
import { getWalletBalance, syncAlipayStatus } from '@/api/wallet.js'
import { getOrderDetail } from '@/api/order.js'

export default {
  data() {
    return {
      alipayForm: '',
      amount: '0.00',
      orderId: '',
      type: 'recharge', // recharge 或 order
      statusText: '正在准备支付...',
      isPaid: false,
      timer: null,
      oldBalance: 0
    }
  },
  async onLoad(options) {
    this.amount = options.amount || '0.00'
    this.orderId = options.orderId || ''
    this.type = options.type || 'recharge'
    
    // 如果是充值模式，先获取当前余额，用于后续对比判断是否到账
    if (this.type === 'recharge') {
      await this.getInitialBalance()
    }
    
    // 从缓存获取支付表单
    const form = uni.getStorageSync('alipay_form')
    console.log('📦 获取到支付表单内容:', form)
    
    if (form) {
      this.alipayForm = typeof form === 'string' ? form.trim() : form
      // 如果是 H5 环境，尝试自动跳转
      // #ifdef H5
      this.statusText = '正在跳转到支付宝...'
      setTimeout(() => {
        this.submitPay()
      }, 500)
      // #endif
      
      // #ifdef MP-WEIXIN
      this.statusText = '请复制链接支付'
      // 启动轮询检查
      this.startPolling()
      // #endif
    } else {
      uni.showToast({
        title: '支付信息丢失',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  onUnload() {
    this.stopPolling()
  },
  methods: {
    async getInitialBalance() {
      try {
        const res = await getWalletBalance()
        if (res.code === 200) {
          this.oldBalance = Number(res.data || 0)
        }
      } catch (e) {}
    },

    startPolling() {
      this.stopPolling()
      this.timer = setInterval(() => {
        this.checkPayStatus(true)
      }, 3000)
    },

    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    /**
     * 检查支付状态
     * @param {Boolean} isAuto 是否为自动轮询
     */
    async checkPayStatus(isAuto = false) {
      if (this.isPaid) return

      // 1. 获取商户订单号并尝试触发后端补单同步
      const outTradeNo = this.getOutTradeNo()
      if (outTradeNo) {
        console.log('🔄 触发后端状态同步:', outTradeNo)
        try {
          await syncAlipayStatus(outTradeNo)
        } catch (e) {
          console.error('同步状态接口异常:', e)
        }
      }

      // 2. 检查本地业务状态
      try {
        if (this.type === 'recharge') {
          // 充值模式：检查余额是否变动
          const res = await getWalletBalance()
          if (res.code === 200) {
            const currentBalance = Number(res.data || 0)
            if (currentBalance > this.oldBalance) {
              this.handleSuccess()
            } else if (!isAuto) {
              uni.showToast({ title: '尚未检测到充值到账', icon: 'none' })
            }
          }
        } else {
          // 订单模式：检查订单状态
          const res = await getOrderDetail(this.orderId)
          if (res.code === 200 && res.data) {
            // 状态 20-待接单 或 30-配送中 均表示支付成功
            const status = res.data.status
            if (status >= 20 && status < 60) {
              this.handleSuccess()
            } else if (!isAuto) {
              uni.showToast({ title: '订单尚未支付成功', icon: 'none' })
            }
          }
        }
      } catch (e) {
        console.error('检查支付状态异常:', e)
      }
    },

    handleSuccess() {
      this.isPaid = true
      this.stopPolling()
      uni.showToast({ title: '支付成功', icon: 'success' })
      
      setTimeout(() => {
        if (this.type === 'recharge') {
          uni.switchTab({ url: '/pages/mine/mine' })
        } else {
          uni.redirectTo({ url: `/pages/order/detail?id=${this.orderId}` })
        }
      }, 1500)
    },
    /**
     * 提交支付（H5环境）
     */
    submitPay() {
      // #ifdef H5
      if (this.alipayForm.startsWith('http')) {
        // 如果是 URL 直接跳转
        window.location.href = this.alipayForm
      } else {
        // 如果是 Form 自动提交
        document.body.insertAdjacentHTML('beforeend', this.alipayForm)
        document.forms[0].submit()
      }
      // #endif

      // #ifndef H5
      this.copyPayLink()
      // #endif
    },

    /**
     * 复制支付链接（小程序环境）
     */
    copyPayLink() {
      console.log('🔗 准备解析支付链接, 内容长度:', this.alipayForm.length)
      let payUrl = ''
      
      const trimmedForm = this.alipayForm.trim()
      
      if (trimmedForm.startsWith('http')) {
        payUrl = trimmedForm
      } else {
        // 尝试从 Form 中提取 action (兼容单引号和双引号)
        const actionMatch = trimmedForm.match(/action=["']([^"']+)["']/)
        if (actionMatch && actionMatch[1]) {
          payUrl = actionMatch[1]
          console.log('✅ 从表单解析出 URL:', payUrl)
        }
      }

      if (payUrl) {
        uni.setClipboardData({
          data: payUrl,
          success: () => {
            console.log('✅ 链接已复制到剪贴板')
            uni.showModal({
              title: '链接已复制',
              content: '支付链接已复制到剪贴板，请打开浏览器粘贴并支付。',
              showCancel: false,
              confirmText: '我知道了'
            })
          }
        })
      } else {
        console.error('❌ 解析支付链接失败, 原内容:', this.alipayForm)
        uni.showToast({
          title: '解析支付链接失败',
          icon: 'none'
        })
      }
    },

    goBack() {
      uni.navigateBack()
    },

    /**
     * 从表单或 URL 中提取商户订单号 (out_trade_no)
     */
    getOutTradeNo() {
      if (!this.alipayForm) return ''
      const trimmedForm = this.alipayForm.trim()
      
      // 1. 尝试从 URL 参数中提取 (GET 方式)
      const urlMatch = trimmedForm.match(/[?&]out_trade_no=([^&]+)/)
      if (urlMatch && urlMatch[1]) return urlMatch[1]
      
      // 2. 尝试从 HTML Input 中提取 (Form 方式)
      const inputMatch = trimmedForm.match(/name=["']out_trade_no["']\s+value=["']([^"']+)["']/)
      if (inputMatch && inputMatch[1]) return inputMatch[1]
      
      // 3. 兼容没有引号的情况或其他属性顺序
      const altMatch = trimmedForm.match(/value=["']([^"']+)["']\s+name=["']out_trade_no["']/)
      if (altMatch && altMatch[1]) return altMatch[1]
      
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.status-box {
  margin-top: -100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.icon-alipay {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.status-text {
  font-size: 34rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.amount-text {
  font-size: 60rpx;
  color: #f40;
  font-weight: bold;
}

.action-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.mini-tips {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-bottom: 20rpx;
}

.btn-submit, .btn-copy {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: linear-gradient(to right, #00a0e9, #0076c8);
  color: #fff;
  font-size: 32rpx;
}

.btn-cancel {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: #fff;
  color: #666;
  font-size: 30rpx;
  border: 1px solid #ddd;
}

.btn-check {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  background: #fff;
  color: #00a0e9;
  font-size: 30rpx;
  border: 1px solid #00a0e9;
  margin-top: 20rpx;
}

.check-box {
  margin-top: 40rpx;
  padding: 20rpx;
  background-color: #e6f7ff;
  border-radius: 12rpx;
  border: 1px solid #91d5ff;
}

.success-tip {
  color: #1890ff;
  font-size: 28rpx;
  font-weight: bold;
}

.query-tips {
  margin-top: 60rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
