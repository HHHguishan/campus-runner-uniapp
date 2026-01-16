<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">提现申请</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="label">可提现余额</view>
      <view class="amount">¥{{ balance }}</view>
    </view>

    <!-- 提现表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="item-label">提现金额</text>
        <view class="input-wrapper">
          <text class="currency">¥</text>
          <input 
            type="digit" 
            v-model="formData.amount" 
            placeholder="请输入提现金额" 
            class="amount-input"
          />
          <view class="all-btn" @tap="withdrawAll">全部提现</view>
        </view>
        <view class="tip">最低提现 ¥1.00</view>
      </view>

      <view class="form-item">
        <text class="item-label">提现方式</text>
        <radio-group class="type-group" @change="onTypeChange">
          <label class="type-label" v-for="item in accountTypes" :key="item.value">
            <radio :value="item.value" :checked="formData.accountType === item.value" color="#1677ff" />
            <text class="type-text">{{ item.name }}</text>
          </label>
        </radio-group>
      </view>

      <view class="form-item">
        <text class="item-label">收款账号</text>
        <input 
          type="text" 
          v-model="formData.accountNo" 
          :placeholder="'请输入' + getAccountTypeName + '账号'" 
          class="normal-input"
        />
      </view>

      <view class="form-item">
        <text class="item-label">真实姓名</text>
        <input 
          type="text" 
          v-model="formData.realName" 
          placeholder="请输入收款人真实姓名" 
          class="normal-input"
        />
        <text class="notice">请务必确保姓名与实名账号一致，否则将导致打款失败。</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="btn-area">
      <button class="submit-btn" :loading="submitting" @tap="submitWithdraw">申请提现</button>
      <view class="history-link" @tap="goToHistory">我的提现记录</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      balance: '0.00',
      submitting: false,
      formData: {
        amount: '',
        accountType: 'alipay',
        accountNo: '',
        realName: ''
      },
      accountTypes: [
        { name: '支付宝', value: 'alipay' },
        { name: '微信支付', value: 'wechat' },
        { name: '银行卡', value: 'bank' }
      ]
    }
  },
  computed: {
    getAccountTypeName() {
      const type = this.accountTypes.find(t => t.value === this.formData.accountType)
      return type ? type.name : ''
    }
  },
  onShow() {
    this.loadBalance()
  },
  methods: {
    async loadBalance() {
      try {
        const res = await this.$request({
          url: '/wallet/balance',
          method: 'GET'
        })
        // request.js 的响应拦截器已经返回了 data (Result对象)
        if (res.code === 200) {
          this.balance = (res.data || 0).toFixed(2)
        }
        
        // 同步加载用户信息以回显绑定账号
        this.loadUserInfo()
      } catch (e) {
        console.error('加载余额失败', e)
      }
    },
    async loadUserInfo() {
      try {
        const res = await this.$request({
          url: '/user/info',
          method: 'GET'
        })
        if (res.code === 200 && res.data) {
          // 如果用户已绑定支付宝，且当前表单未填写，则自动填充
          if (res.data.alipayAccount && !this.formData.accountNo) {
            this.formData.accountNo = res.data.alipayAccount
          }
          if (res.data.alipayName && !this.formData.realName) {
            this.formData.realName = res.data.alipayName
          }
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    goBack() {
      uni.navigateBack()
    },
    onTypeChange(e) {
      this.formData.accountType = e.detail.value
    },
    withdrawAll() {
      this.formData.amount = this.balance
    },
    goToHistory() {
      uni.navigateTo({
        url: '/pages/wallet/withdraw-records'
      })
    },
    async submitWithdraw() {
      if (!this.formData.amount || parseFloat(this.formData.amount) < 1) {
        return uni.showToast({ title: '提现金额需不小于1元', icon: 'none' })
      }
      if (parseFloat(this.formData.amount) > parseFloat(this.balance)) {
        return uni.showToast({ title: '余额不足', icon: 'none' })
      }
      if (!this.formData.accountNo) {
        return uni.showToast({ title: '请填写收款账号', icon: 'none' })
      }
      if (!this.formData.realName) {
        return uni.showToast({ title: '请填写真实姓名', icon: 'none' })
      }

      uni.showModal({
        title: '提现确认',
        content: `申请提现 ¥${this.formData.amount} 到 ${this.getAccountTypeName}？\n审核期间该笔金额将被锁定。`,
        success: async (res) => {
          if (res.confirm) {
            this.executeSubmit()
          }
        }
      })
    },
    async executeSubmit() {
      this.submitting = true
      try {
        const res = await this.$request({
          url: '/withdraw/apply',
          method: 'POST',
          data: this.formData
        })
        if (res.code === 200) {
          uni.showToast({ title: '申请已提交', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.message || '申请失败', icon: 'none' })
        }
      } catch (e) {
        console.error('提现申请失败', e)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20rpx;
  padding-top: calc(var(--status-bar-height) + 110rpx);
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  padding-top: var(--status-bar-height);
  background: linear-gradient(135deg, #1677ff, #4096ff);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.nav-placeholder {
  width: 60rpx;
}

.balance-card {
  background: linear-gradient(135deg, #1677ff, #4096ff);
  padding: 60rpx 40rpx;
  border-radius: 20rpx;
  color: #fff;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(22, 119, 255, 0.2);

  .label {
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 15rpx;
  }

  .amount {
    font-size: 64rpx;
    font-weight: bold;
  }
}

.form-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;

  .item-label {
    display: block;
    font-size: 30rpx;
    color: #333;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
}

.input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 10rpx 0;

  .currency {
    font-size: 40rpx;
    font-weight: bold;
    margin-right: 15rpx;
  }

  .amount-input {
    flex: 1;
    height: 80rpx;
    font-size: 48rpx;
    font-weight: 500;
  }

  .all-btn {
    font-size: 28rpx;
    color: #1677ff;
    padding-left: 20rpx;
  }
}

.tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 15rpx;
}

.notice {
  font-size: 24rpx;
  color: #ff4d4f;
  margin-top: 15rpx;
  display: block;
}

.type-group {
  display: flex;
  flex-wrap: wrap;
  
  .type-label {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
    margin-bottom: 10rpx;
  }

  .type-text {
    font-size: 28rpx;
    margin-left: 10rpx;
  }
}

.normal-input {
  background-color: #f5f5f5;
  height: 90rpx;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.btn-area {
  margin-top: 60rpx;
  padding-bottom: 40rpx;
}

.submit-btn {
  background-color: #1677ff;
  color: #fff;
  height: 100rpx;
  line-height: 100rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 10rpx 20rpx rgba(22, 119, 255, 0.3);
}

.history-link {
  text-align: center;
  color: #666;
  font-size: 28rpx;
  padding: 30rpx;
}
</style>
