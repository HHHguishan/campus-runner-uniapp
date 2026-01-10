<template>
  <view class="upload-container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="header-back" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">上传完成凭证</text>
    </view>

    <!-- 订单信息 -->
    <view class="order-info" v-if="orderInfo">
      <view class="info-title">订单信息</view>
      <view class="info-item">
        <text class="label">送货地址：</text>
        <text class="value">{{ orderInfo.deliveryAddr }}</text>
      </view>
    </view>

    <!-- 上传区域 -->
    <view class="upload-section">
      <view class="section-title">上传完成图片</view>
      <view class="upload-area" @tap="chooseImage">
        <view class="upload-content" v-if="!imageUrl">
          <text class="upload-icon">📷</text>
          <text class="upload-text">点击上传图片</text>
          <text class="upload-tip">请上传配送完成凭证照片</text>
        </view>
        <image v-else class="preview-image" :src="imageUrl" mode="aspectFill"></image>
      </view>
      <view class="action-btns" v-if="imageUrl">
        <button class="btn reupload-btn" @tap.stop="chooseImage">重新上传</button>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" @tap="handleSubmit" :disabled="!imageUrl">
        确认完成配送
      </button>
    </view>

    <!-- 提示信息 -->
    <view class="tips-section">
      <view class="tips-title">温馨提示</view>
      <view class="tips-item">• 请确保图片清晰可见</view>
      <view class="tips-item">• 建议拍摄配送物品送达场景</view>
      <view class="tips-item">• 上传后即可完成配送</view>
    </view>
  </view>
</template>

<script>
import { finishOrder } from '@/api/rider.js';

export default {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      imageUrl: ''
    };
  },

  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
    }
    if (options.orderInfo) {
      try {
        this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
      } catch (error) {
        console.error('解析订单信息失败:', error);
      }
    }
  },

  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.imageUrl = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
        }
      });
    },

    // 提交完成配送
    async handleSubmit() {
      if (!this.imageUrl) {
        uni.showToast({
          title: '请先上传完成凭证图片',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (!this.orderId) {
        uni.showToast({
          title: '订单信息异常',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        uni.showLoading({ title: '提交中...', mask: true });

        // TODO: 这里应该先上传图片到服务器，获取图片URL
        // 暂时使用本地路径
        const finishImg = this.imageUrl;

        console.log('提交完成配送:', {
          orderId: this.orderId,
          finishImg: finishImg,
          orderIdType: typeof this.orderId
        });

        await finishOrder({
          orderId: Number(this.orderId),
          finishImg: finishImg
        });

        uni.hideLoading();

        uni.showToast({
          title: '配送完成',
          icon: 'success',
          duration: 2000
        });

        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);

      } catch (error) {
        uni.hideLoading();
        console.error('完成配送失败:', error);
        uni.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
};
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部标题栏 */
.header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.header-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.header-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-right: 60rpx;
}

/* 订单信息 */
.order-info {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  font-size: 26rpx;
  line-height: 40rpx;
}

.info-item .label {
  color: #666;
  flex-shrink: 0;
}

.info-item .value {
  color: #333;
  flex: 1;
}

/* 上传区域 */
.upload-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.upload-area {
  width: 100%;
  height: 400rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.upload-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.action-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn::after {
  border: none;
}

.reupload-btn {
  background: #f5f5f5;
  color: #333;
}

/* 提交按钮 */
.submit-section {
  padding: 20rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #07c160;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.submit-btn::after {
  border: none;
}

.submit-btn[disabled] {
  background: #ccc;
}

/* 提示信息 */
.tips-section {
  margin: 20rpx;
  background: #fff8e1;
  border-radius: 12rpx;
  padding: 24rpx;
}

.tips-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #ff9800;
  margin-bottom: 16rpx;
}

.tips-item {
  font-size: 24rpx;
  color: #666;
  line-height: 36rpx;
  margin-bottom: 8rpx;
}

.tips-item:last-child {
  margin-bottom: 0;
}
</style>
