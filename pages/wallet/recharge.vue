<template>
  <view class="recharge-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">账户充值</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 充值金额选择 -->
    <view class="recharge-content">
      <view class="amount-section">
        <view class="section-title">选择充值金额</view>
        <view class="amount-grid">
          <view
            class="amount-item"
            :class="{ active: selectedAmount === amount }"
            v-for="amount in presetAmounts"
            :key="amount"
            @click="selectAmount(amount)"
          >
            <text class="amount-value">{{ amount }}</text>
            <text class="amount-unit">元</text>
          </view>
        </view>
      </view>

      <!-- 自定义金额 -->
      <view class="custom-amount-section">
        <view class="section-title">自定义金额</view>
        <view class="custom-input-wrapper">
          <text class="input-symbol">¥</text>
          <input
            class="custom-input"
            type="digit"
            v-model="customAmount"
            placeholder="请输入充值金额"
            @input="onCustomAmountInput"
          />
        </view>
        <view class="amount-tips">
          <text>单笔最低充值：1元，最高：10000元</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-section">
        <view class="section-title">支付方式</view>
        <view class="payment-method">
          <view class="method-icon">
            <text>💰</text>
          </view>
          <view class="method-info">
            <text class="method-name">模拟支付</text>
            <text class="method-desc">测试环境虚拟支付</text>
          </view>
          <view class="method-check">
            <text class="iconfont">✓</text>
          </view>
        </view>
      </view>

      <!-- 充值说明 -->
      <view class="tips-section">
        <view class="tips-title">充值说明</view>
        <view class="tips-list">
          <text class="tip-item">• 充值后余额实时到账</text>
          <text class="tip-item">• 测试环境使用模拟充值，无需实际支付</text>
          <text class="tip-item">• 如有问题请联系客服</text>
        </view>
      </view>
    </view>

    <!-- 底部充值按钮 -->
    <view class="bottom-bar">
      <view class="bar-info">
        <text class="bar-label">充值金额：</text>
        <text class="bar-amount">¥{{ finalAmount }}</text>
      </view>
      <button class="btn-confirm" @click="handleRecharge" :disabled="!canRecharge">
        确认充值
      </button>
    </view>
  </view>
</template>

<script>
import { recharge } from '@/api/wallet.js'

export default {
  data() {
    return {
      presetAmounts: [10, 50, 100, 200, 500, 1000], // 预设金额
      selectedAmount: null, // 选中的预设金额
      customAmount: '', // 自定义金额
      currentAmount: 0 // 当前充值金额
    }
  },

  computed: {
    // 最终充值金额
    finalAmount() {
      return Number(this.currentAmount || 0).toFixed(2)
    },
    // 是否可以充值
    canRecharge() {
      const amount = Number(this.currentAmount)
      return amount >= 1 && amount <= 10000
    }
  },

  methods: {
    /**
     * 选择预设金额
     */
    selectAmount(amount) {
      this.selectedAmount = amount
      this.customAmount = ''
      this.currentAmount = amount
    },

    /**
     * 自定义金额输入
     */
    onCustomAmountInput(e) {
      const value = e.detail.value
      this.customAmount = value

      // 限制小数点后两位
      if (value.includes('.')) {
        const parts = value.split('.')
        if (parts[1] && parts[1].length > 2) {
          this.customAmount = parts[0] + '.' + parts[1].substring(0, 2)
        }
      }

      // 清除选中状态
      this.selectedAmount = null
      this.currentAmount = Number(this.customAmount)
    },

    /**
     * 充值
     */
    async handleRecharge() {
      const amount = Number(this.currentAmount)

      // 验证金额
      if (amount < 1) {
        uni.showToast({
          title: '充值金额不能低于1元',
          icon: 'none'
        })
        return
      }

      if (amount > 10000) {
        uni.showToast({
          title: '单笔充值不能超过10000元',
          icon: 'none'
        })
        return
      }

      // 确认充值
      uni.showModal({
        title: '确认充值',
        content: `确定要充值 ¥${amount.toFixed(2)} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.doRecharge(amount)
          }
        }
      })
    },

    /**
     * 执行充值
     */
    async doRecharge(amount) {
      try {
        uni.showLoading({ title: '充值中...' })

        const res = await recharge({ amount })

        uni.hideLoading()

        if (res.code === 200) {
          // 充值成功
          uni.showToast({
            title: '充值成功',
            icon: 'success',
            duration: 1500
          })

          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '充值失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 充值失败:', error)
        uni.showToast({
          title: '充值失败，请稍后重试',
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
.recharge-container {
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

/* 充值内容 */
.recharge-content {
  flex: 1;
  margin-top: 54px;
  margin-bottom: 70px;
  padding: 15px;
  overflow-y: auto;
}

.amount-section,
.custom-amount-section,
.payment-section,
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

/* 预设金额 */
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-item.active {
  background-color: #f0f4ff;
  border-color: #667eea;
}

.amount-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.amount-unit {
  font-size: 12px;
  color: #999;
}

/* 自定义金额 */
.custom-input-wrapper {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.input-symbol {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.custom-input {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.amount-tips {
  font-size: 12px;
  color: #999;
  text-align: center;
}

/* 支付方式 */
.payment-method {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

/* 充值说明 */
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
}

.btn-confirm {
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

.btn-confirm[disabled] {
  opacity: 0.5;
}
</style>
