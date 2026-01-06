<template>
  <view class="auth-container">
    <!-- 顶部标题 -->
    <view class="auth-header">
      <text class="header-title">🛵 骑手认证</text>
      <text class="header-subtitle">完成认证后即可接单赚钱</text>
    </view>

    <!-- 认证状态展示 -->
    <view class="status-card" v-if="authInfo.status !== undefined">
      <view class="status-icon">{{ getStatusIcon(authInfo.status) }}</view>
      <view class="status-info">
        <text class="status-title">{{ getStatusTitle(authInfo.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(authInfo.status) }}</text>
        <text class="status-reason" v-if="authInfo.status === 2 && authInfo.auditReason">
          驳回原因：{{ authInfo.auditReason }}
        </text>
      </view>
    </view>

    <!-- 认证表单 -->
    <view class="auth-form" v-if="!isApproved">
      <view class="form-section">
        <view class="section-title">基本信息</view>

        <!-- 真实姓名 -->
        <view class="form-item">
          <text class="item-label">真实姓名</text>
          <input
            class="item-input"
            type="text"
            v-model="formData.realName"
            placeholder="请输入真实姓名"
            :disabled="isPending"
          />
        </view>

        <!-- 学号 -->
        <view class="form-item">
          <text class="item-label">学号</text>
          <input
            class="item-input"
            type="text"
            v-model="formData.studentId"
            placeholder="请输入学号"
            :disabled="isPending"
          />
        </view>

        <!-- 学校名称 -->
        <view class="form-item">
          <text class="item-label">学校名称</text>
          <input
            class="item-input"
            type="text"
            v-model="formData.schoolName"
            placeholder="请输入学校名称"
            :disabled="isPending"
          />
        </view>

        <!-- 所属学院 -->
        <view class="form-item">
          <text class="item-label">所属学院</text>
          <input
            class="item-input"
            type="text"
            v-model="formData.college"
            placeholder="请输入所属学院"
            :disabled="isPending"
          />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">证件上传</view>

        <!-- 学生证照片 -->
        <view class="upload-item">
          <text class="upload-label">学生证照片</text>
          <view class="upload-area" @tap="chooseImage('studentCard')">
            <image
              v-if="formData.studentCardImg"
              class="upload-image"
              :src="formData.studentCardImg"
              mode="aspectFill"
            ></image>
            <view v-else class="upload-placeholder">
              <text class="upload-icon">📷</text>
              <text class="upload-text">点击上传学生证照片</text>
            </view>
          </view>
        </view>

        <view class="upload-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">请确保照片清晰完整，信息可见</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button
          class="submit-btn"
          :disabled="!canSubmit || isPending"
          @tap="handleSubmit"
        >
          {{ isPending ? '审核中' : '提交认证' }}
        </button>
      </view>
    </view>

    <!-- 认证通过后的展示 -->
    <view class="approved-card" v-else>
      <view class="approved-icon">✅</view>
      <text class="approved-title">认证已通过</text>
      <text class="approved-desc">您已成为认证骑手，可以接单赚钱了！</text>
      <button class="go-hall-btn" @tap="goToHall">前往接单大厅</button>
    </view>
  </view>
</template>

<script>
import { uploadFile } from '@/api/common.js';
import {
  getRunnerStatus,
  submitStudentCardApply
} from '@/api/rider.js';

export default {
  data() {
    return {
      // 认证信息
      authInfo: {
        status: undefined, // 0-待审核, 1-通过, 2-驳回
        auditReason: ''
      },

      // 表单数据
      formData: {
        realName: '',      // 真实姓名
        studentId: '',     // 学号
        schoolName: '',    // 学校名称
        college: '',       // 所属学院
        studentCardImg: '' // 学生证照片
      }
    };
  },

  computed: {
    // 是否待审核
    isPending() {
      return this.authInfo.status === 0;
    },

    // 是否已通过
    isApproved() {
      return this.authInfo.status === 1;
    },

    // 是否可以提交
    canSubmit() {
      return (
        this.formData.realName &&
        this.formData.studentId &&
        this.formData.schoolName &&
        this.formData.college &&
        this.formData.studentCardImg
      );
    }
  },

  onLoad() {
    this.loadAuthStatus();
  },

  methods: {
    // 加载认证状态
    async loadAuthStatus() {
      try {
        const result = await getRunnerStatus();
        if (result.data) {
          this.authInfo = result.data;

          // 如果有认证信息，回填表单
          if (result.data.realName) {
            this.formData.realName = result.data.realName;
            this.formData.studentId = result.data.studentId;
            this.formData.schoolName = result.data.schoolName;
            this.formData.college = result.data.college;
            this.formData.studentCardImg = result.data.studentCardImg;
          }
        }
      } catch (error) {
        console.error('获取认证状态失败:', error);
      }
    },

    // 选择图片
    chooseImage() {
      if (this.isPending) {
        uni.showToast({
          title: '审核中无法修改',
          icon: 'none'
        });
        return;
      }

      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadImage(tempFilePath);
        }
      });
    },

    // 上传图片
    async uploadImage(filePath) {
      try {
        uni.showLoading({ title: '上传中...', mask: true });

        const result = await uploadFile(filePath, 'id_card');

        uni.hideLoading();

        this.formData.studentCardImg = result.data;

        uni.showToast({
          title: '上传成功',
          icon: 'success'
        });
      } catch (error) {
        uni.hideLoading();
        console.error('上传失败:', error);
      }
    },

    // 提交认证
    async handleSubmit() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请完善所有信息',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '提交中...', mask: true });

        await submitStudentCardApply(this.formData);

        uni.hideLoading();

        uni.showToast({
          title: '提交成功，请等待审核',
          icon: 'success',
          duration: 2000
        });

        // 重新加载状态
        setTimeout(() => {
          this.loadAuthStatus();
        }, 1000);

      } catch (error) {
        uni.hideLoading();
        console.error('提交失败:', error);
      }
    },

    // 前往接单大厅
    goToHall() {
      uni.redirectTo({
        url: '/pages/hall/hall'
      });
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        0: '⏳',
        1: '✅',
        2: '❌'
      };
      return iconMap[status] || '';
    },

    // 获取状态标题
    getStatusTitle(status) {
      const titleMap = {
        0: '审核中',
        1: '认证已通过',
        2: '认证未通过'
      };
      return titleMap[status] || '未认证';
    },

    // 获取状态描述
    getStatusDesc(status) {
      const descMap = {
        0: '您的认证申请正在审核中，请耐心等待',
        1: '恭喜！您已成为认证骑手',
        2: '很遗憾，您的认证未通过，请修改后重新提交'
      };
      return descMap[status] || '';
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部标题 */
.auth-header {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
  text-align: center;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 16rpx;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

/* 状态卡片 */
.status-card {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.status-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.status-reason {
  font-size: 24rpx;
  color: #ff4d4f;
  display: block;
  padding: 12rpx 16rpx;
  background: #fff1f0;
  border-radius: 8rpx;
  margin-top: 12rpx;
}

/* 认证表单 */
.auth-form {
  margin: 0 20rpx;
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.item-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

/* 上传区域 */
.upload-item {
  margin-bottom: 30rpx;
}

.upload-item:last-child {
  margin-bottom: 0;
}

.upload-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.upload-area {
  width: 100%;
  height: 360rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
  opacity: 0.5;
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.upload-tip {
  display: flex;
  align-items: center;
  background: #fff7e6;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.tip-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #fa8c16;
  flex: 1;
}

/* 提交按钮 */
.submit-section {
  margin: 40rpx 20rpx 0;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #07c160;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
}

/* 认证通过卡片 */
.approved-card {
  margin: 40rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.approved-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.approved-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.approved-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.go-hall-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #07c160;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
}

.go-hall-btn::after {
  border: none;
}
</style>
