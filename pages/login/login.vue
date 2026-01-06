<template>
  <view class="container">
    <view class="header">
      <view class="welcome-text">
        <text class="title">欢迎登录</text>
        <text class="subtitle">校园跑腿系统 · 手机号快捷登录</text>
      </view>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="label">手机号</text>
        <view class="input-wrapper">
          <text class="area-code">+86</text>
          <input
            class="input-field"
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            maxlength="11"
            @input="onPhoneInput"
          />
        </view>
      </view>

      <view class="input-group">
        <text class="label">验证码</text>
        <view class="input-wrapper">
          <input
            class="input-field"
            type="number"
            v-model="code"
            placeholder="请输入6位验证码"
            maxlength="6"
          />
          <button
            class="get-code-btn"
            :class="{ 'active': canGetCode, 'countdown': countdown > 0 }"
            :disabled="!canGetCode || countdown > 0"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
          </button>
        </view>
      </view>
    </view>

    <view class="action-section">
      <button
        class="login-btn"
        :class="{ 'login-active': canLogin }"
        :disabled="!canLogin || isLoading"
        @click="handleLogin"
      >
        {{ isLoading ? '登录中...' : '立即登录' }}
      </button>

      <view class="protocol-row">
        <checkbox-group @change="handleAgreeChange">
          <checkbox
            :checked="isAgree"
            value="agree"
            color="#07c160"
            style="transform: scale(0.7);"
          />
        </checkbox-group>
        <text class="protocol-text">
          我已阅读并同意
          <text class="link" @tap="showProtocol('user')">《用户协议》</text>
          和
          <text class="link" @tap="showProtocol('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { sendSmsCode, loginByPhone, handleLoginSuccess } from '@/api/auth.js';

export default {
  data() {
    return {
      phone: '',        // 手机号
      code: '',         // 验证码
      countdown: 0,     // 倒计时
      isAgree: false,   // 是否同意协议
      isLoading: false  // 登录加载状态
    };
  },

  computed: {
    // 判断是否可以获取验证码：手机号必须是11位且倒计时结束
    canGetCode() {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(this.phone) && this.countdown === 0;
    },

    // 判断是否可以登录：手机号有效 + 验证码6位 + 已勾选协议
    canLogin() {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(this.phone) &&
             this.code.length === 6 &&
             this.isAgree &&
             !this.isLoading;
    }
  },

  methods: {
    // 处理协议勾选
    handleAgreeChange(e) {
      this.isAgree = e.detail.value.length > 0;
    },

    // 手机号输入处理（限制只能输入数字）
    onPhoneInput(e) {
      const value = e.detail.value.replace(/\D/g, ''); // 移除非数字字符
      this.phone = value;
    },

    // 发送验证码逻辑
    async sendCode() {
      if (!this.canGetCode) return;

      try {
        uni.showLoading({ title: '发送中...', mask: true });

        // 调用后端API发送验证码
        await sendSmsCode(this.phone);

        uni.hideLoading();
        uni.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 2000
        });

        // 开启倒计时
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
          }
        }, 1000);

      } catch (error) {
        uni.hideLoading();

        // 错误信息已经在request.js中统一处理并显示了
        // 这里可以添加额外的错误处理逻辑
        console.error('发送验证码失败:', error);

        // 如果是频率限制错误，显示剩余等待时间
        if (error.message && error.message.includes('发送太频繁')) {
          // 提取剩余秒数
          const match = error.message.match(/请(\d+)秒后再试/);
          if (match) {
            const remainingTime = parseInt(match[1]);
            this.countdown = remainingTime;
            const timer = setInterval(() => {
              this.countdown--;
              if (this.countdown <= 0) {
                clearInterval(timer);
              }
            }, 1000);
          }
        }
      }
    },

    // 登录逻辑
    async handleLogin() {
      if (!this.canLogin) {
        if (!this.isAgree) {
          uni.showToast({
            title: '请先阅读并同意协议',
            icon: 'none'
          });
        }
        return;
      }

      try {
        this.isLoading = true;
        uni.showLoading({ title: '登录中...', mask: true });

        // 调用后端登录API
        const loginResult = await loginByPhone({
          phone: this.phone,
          code: this.code,
          deviceInfo: uni.getSystemInfoSync().model, // 设备信息
          location: '' // 可选：地理位置
        });

        uni.hideLoading();

        // 处理登录成功
        handleLoginSuccess(loginResult.data);

        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 判断是否是新用户
          if (loginResult.data.isNewUser) {
            // 新用户跳转到完善信息页
            uni.redirectTo({
              url: '/pages/profile/profile'
            });
          } else {
            // 老用户跳转到首页
            uni.switchTab({
              url: '/pages/index/index'
            });
          }
        }, 1500);

      } catch (error) {
        this.isLoading = false;
        uni.hideLoading();

        // 错误信息已经在request.js中统一处理并显示了
        console.error('登录失败:', error);
      }
    },

    // 查看协议
    showProtocol(type) {
      const title = type === 'user' ? '用户协议' : '隐私政策';
      uni.showToast({
        title: `暂未开放${title}`,
        icon: 'none'
      });
      // TODO: 后续可以跳转到专门的协议页面
      // uni.navigateTo({
      //   url: `/pages/protocol/protocol?type=${type}`
      // });
    }
  }
};
</script>

<style scoped>
.container {
  padding: 60rpx;
  background-color: #ffffff;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部 */
.header {
  margin-top: 40rpx;
  margin-bottom: 80rpx;
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
}

/* 表单 */
.form-section {
  margin-bottom: 80rpx;
}

.input-group {
  margin-bottom: 50rpx;
  border-bottom: 2rpx solid #f5f5f5;
  padding-bottom: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  height: 80rpx;
}

.area-code {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 24rpx;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  height: 100%;
}

/* 验证码按钮样式 */
.get-code-btn {
  font-size: 26rpx;
  color: #999;
  background: #f8f8f8;
  border-radius: 40rpx;
  padding: 0 32rpx;
  height: 64rpx;
  line-height: 64rpx;
  margin: 0;
  border: none;
  transition: all 0.3s;
}

.get-code-btn::after {
  border: none;
}

.get-code-btn.active {
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
}

.get-code-btn.countdown {
  opacity: 0.6;
}

.get-code-btn[disabled] {
  opacity: 0.6;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #e0e0e0;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  transition: all 0.3s;
}

.login-btn::after {
  border: none;
}

.login-active {
  background: #07c160;
  box-shadow: 0 10rpx 20rpx rgba(7, 193, 96, 0.25);
}

.login-btn[disabled] {
  opacity: 0.8;
}

/* 协议 */
.protocol-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.protocol-text {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.link {
  color: #07c160;
}
</style>
