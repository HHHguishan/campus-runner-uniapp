<template>
  <view class="create-container">
    <view class="status-bar"></view>
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">✕</text>
      </view>
      <view class="nav-title">发布动态</view>
      <view class="nav-right">
        <button class="submit-btn" :disabled="!canSubmit || submitting" @tap="submit">发布</button>
      </view>
    </view>

    <scroll-view class="form-content" scroll-y>
      <!-- 标题内容 -->
      <view class="input-section border-bottom">
        <input
          class="title-input"
          v-model="title"
          placeholder="起个吸睛的标题吧..."
          maxlength="100"
        />
      </view>

      <!-- 文字内容 -->
      <view class="input-section">
        <textarea
          class="content-textarea"
          v-model="content"
          placeholder="分享这一刻的想法..."
          maxlength="5000"
          auto-height
        ></textarea>
        <view class="char-count">{{ content.length }}/5000</view>
      </view>

      <!-- 标签选择 -->
      <view class="tag-section">
        <text class="tag-label">选择分类：</text>
        <view class="tag-list">
          <view 
            v-for="t in tagOptions" 
            :key="t" 
            class="tag-item" 
            :class="{active: tag === t}"
            @tap="tag = t"
          >{{ t }}</view>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="image-section">
        <view class="image-list">
          <view class="image-item" v-for="(img, index) in images" :key="index">
            <image :src="img" mode="aspectFill" @tap="previewImage(index)"></image>
            <view class="delete-icon" @tap.stop="removeImage(index)">×</view>
          </view>
          <view v-if="images.length < 9" class="upload-box" @tap="chooseImage">
            <text class="plus">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
        <view class="image-tip">最多可上传9张图片</view>
      </view>
    </scroll-view>

    <!-- 加载中遮罩 -->
    <view v-if="submitting" class="submitting-overlay">
      <view class="loading-box">
        <view class="loading-icon"></view>
        <text>正在发布...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { createPost } from '@/api/forum.js'
import { BASE_URL } from '@/utils/config.js'

export default {
  data() {
    return {
      title: '',
      content: '',
      tag: '吐槽',
      tagOptions: ['失物', '吐槽', '闲置', '求助', '表白'],
      images: [],
      submitting: false
    }
  },
  computed: {
    canSubmit() {
      return this.title.trim().length > 0 && this.content.trim().length > 0
    }
  },
  methods: {
    goBack() {
      if (this.title || this.content || this.images.length > 0) {
        uni.showModal({
          title: '提示',
          content: '退出将丢失已编辑的内容，确定吗？',
          success: (res) => {
            if (res.confirm) uni.navigateBack()
          }
        })
      } else {
        uni.navigateBack()
      }
    },
    async chooseImage() {
      const count = 9 - this.images.length
      uni.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          // 在实际项目中，这里应该先上传到服务器/OSS
          // 这里暂时直接存入本地路径预览，模拟上传过程
          this.uploadImages(res.tempFilePaths)
        }
      })
    },
    async uploadImages(paths) {
      uni.showLoading({ title: '正在上传...' })
      
      // 模拟多图上传逻辑
      for (const path of paths) {
        try {
          // 这里应该是真实的 uni.uploadFile
          // const res = await uni.uploadFile({ ... })
          // const data = JSON.parse(res.data)
          // if (data.code === 200) this.images.push(data.data.url)
          
          // 暂时模拟直接成功
          this.images.push(path) 
        } catch (e) {
          uni.showToast({ title: '部分图片上传失败', icon: 'none' })
        }
      }
      uni.hideLoading()
    },
    removeImage(index) {
      this.images.splice(index, 1)
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.images,
        current: index
      })
    },
    async submit() {
      if (this.submitting) return
      this.submitting = true
      
      try {
        const res = await createPost({
          title: this.title,
          content: this.content,
          tag: this.tag,
          images: this.images
        })
        
        if (res.code === 200) {
          uni.showToast({ title: '发布成功', icon: 'success' })
          // 发送全局事件通知列表刷新
          uni.$emit('refreshForum')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res.message || '发布失败', icon: 'none' })
          this.submitting = false
        }
      } catch (error) {
        uni.showToast({ title: '网络错误', icon: 'none' })
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.create-container {
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
  background: $forum-primary-gradient;
}

.nav-bar {
  height: 44px;
  background: $forum-primary-gradient;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(7, 193, 96, 0.15);
  position: relative;
  z-index: 100;
  
  .nav-back {
    font-size: 44rpx;
    color: #fff;
    width: 80rpx;
    font-weight: 300;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2rpx;
  }
  
  .nav-right {
    width: 140rpx;
    display: flex;
    justify-content: flex-end;
  }
  
  .submit-btn {
    margin: 0;
    padding: 0 32rpx;
    height: 60rpx;
    line-height: 60rpx;
    background: #fff;
    color: $forum-primary;
    font-size: 28rpx;
    border-radius: 30rpx;
    font-weight: 600;
    border: none;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    &[disabled] {
      background: rgba(255, 255, 255, 0.6);
      color: rgba(7, 193, 96, 0.5);
      box-shadow: none;
    }
    
    &:active:not([disabled]) {
      transform: scale(0.95);
      background: #f0f0f0;
    }
  }
}

.form-content {
  flex: 1;
  padding: 40rpx 30rpx;
}

.input-section {
  position: relative;
  margin-bottom: 40rpx;
  
  .content-textarea {
    width: 100%;
    min-height: 360rpx;
    font-size: 32rpx;
    line-height: 1.6;
    color: $forum-text-main;
  }
  
  .char-count {
    text-align: right;
    font-size: 24rpx;
    color: $forum-text-light;
    margin-top: 16rpx;
  }
}

.border-bottom {
  border-bottom: 2rpx solid #f8f8f8;
  padding-bottom: 24rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  font-size: 38rpx;
  font-weight: bold;
  color: $forum-text-main;
}

.tag-section {
  margin-bottom: 48rpx;
  
  .tag-label {
    font-size: 28rpx;
    font-weight: 600;
    color: $forum-text-main;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .tag-item {
    padding: 12rpx 36rpx;
    background: #f5f5f5;
    border-radius: 40rpx;
    font-size: 26rpx;
    color: $forum-text-sub;
    transition: all 0.3s;
    border: 1rpx solid transparent;
    
    &.active {
      background: $forum-primary-light;
      color: $forum-primary;
      border-color: rgba(7, 193, 96, 0.2);
      font-weight: 600;
      box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.1);
    }
  }
}

.image-section {
  .image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
  }
  
  .image-item {
    position: relative;
    width: 100%;
    height: 220rpx;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }
    
    .delete-icon {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 44rpx;
      height: 44rpx;
      background: rgba(255, 77, 79, 0.9);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      border: 4rpx solid #fff;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }
  }
  
  .upload-box {
    width: 100%;
    height: 220rpx;
    background: #fbfbfb;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #e0e0e0;
    transition: all 0.2s;
    
    .plus {
      font-size: 64rpx;
      color: #ccc;
      margin-bottom: 4rpx;
    }
    
    .upload-text {
      font-size: 24rpx;
      color: #bbb;
    }
    
    &:active {
      background: #f5f5f5;
      border-color: $forum-primary;
    }
  }
  
  .image-tip {
    margin-top: 24rpx;
    font-size: 24rpx;
    color: $forum-text-light;
  }
}

.submitting-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $forum-glass-bg;
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    padding: 40rpx 60rpx;
    border-radius: 32rpx;
    box-shadow: $forum-glass-shadow;
    
    .loading-icon {
      width: 64rpx;
      height: 64rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid $forum-primary;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 24rpx;
    }
    
    text {
      font-size: 28rpx;
      color: $forum-text-main;
      font-weight: 500;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
