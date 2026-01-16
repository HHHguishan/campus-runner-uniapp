<template>
  <view class="container">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">绑定支付宝</view>
      <view class="nav-placeholder"></view>
    </view>

    <view class="tips-box">
      <text class="iconfont tip-icon">ℹ️</text>
      <text class="tip-text">绑定后提现将自动填充账号信息，请确保姓名与支付宝实名一致。</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">支付宝账号</text>
        <input 
          type="text" 
          v-model="formData.alipayAccount" 
          placeholder="请输入支付宝登录账号/手机号" 
          class="input-box"
        />
      </view>

      <view class="form-item">
        <text class="label">收款人姓名</text>
        <input 
          type="text" 
          v-model="formData.alipayName" 
          placeholder="请输入支付宝实名认证姓名" 
          class="input-box"
        />
      </view>
    </view>

    <view class="btn-area">
      <button class="save-btn" :loading="loading" @tap="handleSave">保存绑定</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      formData: {
        alipayAccount: '',
        alipayName: ''
      }
    }
  },
  onLoad() {
    this.loadCurrentInfo()
  },
  methods: {
    async loadCurrentInfo() {
      try {
        const res = await this.$request({
          url: '/user/info',
          method: 'GET'
        })
        if (res.code === 200) {
          this.formData.alipayAccount = res.data.alipayAccount || ''
          this.formData.alipayName = res.data.alipayName || ''
        }
      } catch (e) {
        console.error('获取信息失败', e)
      }
    },
    goBack() {
      uni.navigateBack()
    },
    async handleSave() {
      if (!this.formData.alipayAccount) {
        return uni.showToast({ title: '请输入支付宝账号', icon: 'none' })
      }
      if (!this.formData.alipayName) {
        return uni.showToast({ title: '请输入收款人姓名', icon: 'none' })
      }

      this.loading = true
      try {
        const res = await this.$request({
          url: '/user/update',
          method: 'PUT',
          data: this.formData
        })
        if (res.code === 200) {
          uni.showToast({ title: '绑定成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (e) {
        console.error('更新失败', e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 30rpx;
  padding-top: calc(var(--status-bar-height) + 110rpx);
}

.nav-bar {
  display: flex; align-items: center; justify-content: space-between;
  height: 88rpx; padding: 0 30rpx; padding-top: var(--status-bar-height);
  background: white; position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  border-bottom: 1rpx solid #eee;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #333; }
.nav-placeholder { width: 60rpx; }

.tips-box {
  background-color: #e6f7ff; border: 1rpx solid #91d5ff; border-radius: 12rpx;
  padding: 24rpx; display: flex; margin-bottom: 30rpx;
  .tip-icon { font-size: 32rpx; margin-right: 16rpx; }
  .tip-text { font-size: 26rpx; color: #0050b3; flex: 1; line-height: 1.5; }
}

.form-card {
  background-color: #fff; border-radius: 20rpx; padding: 30rpx;
  .form-item {
    margin-bottom: 30rpx;
    &:last-child { margin-bottom: 0; }
    .label { font-size: 28rpx; color: #333; margin-bottom: 16rpx; display: block; font-weight: 600; }
    .input-box { background-color: #f5f5f5; height: 100rpx; border-radius: 12rpx; padding: 0 24rpx; font-size: 30rpx; }
  }
}

.btn-area { margin-top: 60rpx; }
.save-btn {
  background-color: #1677ff; color: #fff; height: 100rpx; line-height: 100rpx;
  border-radius: 50rpx; font-size: 32rpx; font-weight: 600; box-shadow: 0 10rpx 20rpx rgba(22, 119, 255, 0.2);
}
</style>
