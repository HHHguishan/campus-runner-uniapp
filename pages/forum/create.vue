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
.create-container {
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
  background-color: #fff;
}

.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1px solid #f5f5f5;
  
  .nav-back {
    font-size: 40rpx;
    color: #333;
    width: 80rpx;
  }
  
  .nav-title {
    font-size: 32rpx;
    font-weight: bold;
  }
  
  .nav-right {
    width: 140rpx;
    display: flex;
    justify-content: flex-end;
  }
  
  .submit-btn {
    margin: 0;
    padding: 0 24rpx;
    height: 56rpx;
    line-height: 56rpx;
    background: #07c160;
    color: #fff;
    font-size: 26rpx;
    border-radius: 28rpx;
    border: none;
    
    &[disabled] {
      background: #e1e1e1;
      color: #999;
    }
  }
}

.form-content {
  flex: 1;
  padding: 30rpx;
}

.input-section {
  position: relative;
  margin-bottom: 40rpx;
  
  .content-textarea {
    width: 100%;
    min-height: 300rpx;
    font-size: 30rpx;
    line-height: 1.6;
    color: #333;
  }
  
  .char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.border-bottom {
  border-bottom: 2rpx solid #f5f5f5;
  padding-bottom: 20rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  font-size: 34rpx;
  font-weight: bold;
}

.tag-section {
  margin-bottom: 40rpx;
  
  .tag-label {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .tag-item {
    padding: 10rpx 30rpx;
    background: #f5f5f5;
    border-radius: 30rpx;
    font-size: 24rpx;
    color: #666;
    
    &.active {
      background: #e6f7ff;
      color: #007aff;
      border: 1px solid #007aff;
    }
  }
}

.image-section {
  .image-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
  }
  
  .image-item {
    position: relative;
    width: 100%;
    height: 210rpx;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
    
    .delete-icon {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
    }
  }
  
  .upload-box {
    width: 100%;
    height: 210rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #ddd;
    
    .plus {
      font-size: 60rpx;
      color: #999;
      margin-bottom: 4rpx;
    }
    
    .upload-text {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .image-tip {
    margin-top: 20rpx;
    font-size: 24rpx;
    color: #999;
  }
}

.submitting-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .loading-icon {
      width: 60rpx;
      height: 60rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #07c160;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }
    
    text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
