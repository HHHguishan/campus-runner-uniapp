<template>
  <view class="post-card" @tap="onCardClick">
    <!-- 用户信息 -->
    <view class="post-header">
      <image class="avatar" :src="post.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
      <view class="user-info">
        <view class="name-row">
          <text class="nickname">{{ post.nickname || '匿名用户' }}</text>
          <text v-if="post.tag" class="post-tag">{{ post.tag }}</text>
        </view>
        <text class="time">{{ post.createTime || '刚刚' }}</text>
      </view>
      <view v-if="isMyPost" class="delete-btn" @tap.stop="onDelete">
        <text class="iconfont">🗑️</text>
      </view>
    </view>

    <!-- 帖子内容 -->
    <view class="post-content">
      <text v-if="post.title" class="post-title">{{ post.title }}</text>
      <text class="post-text">{{ post.contentPreview || post.content }}</text>
      <!-- 图片列表 -->
      <view v-if="post.images && post.images.length > 0" class="post-images" :class="'images-' + Math.min(post.images.length, 3)">
        <image 
          v-for="(img, index) in post.images" 
          :key="index" 
          :src="img" 
          class="post-image" 
          mode="aspectFill"
          @tap.stop="previewImage(index)"
        ></image>
      </view>
    </view>

    <!-- 交互栏 -->
    <view class="post-footer">
      <view class="action-group">
        <view class="action-item" :class="{ active: post.liked }" @tap.stop="onLike">
          <text class="action-icon">{{ post.liked ? '❤️' : '🤍' }}</text>
          <text class="action-count">{{ post.likeCount || 0 }}</text>
        </view>
        <view class="action-item" @tap.stop="onComment">
          <text class="action-icon">💬</text>
          <text class="action-count">{{ post.commentCount || 0 }}</text>
        </view>
      </view>
      <view class="view-count" v-if="post.viewCount">
        <text>{{ post.viewCount }} 次阅读</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true
    },
    isMyPost: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onCardClick() {
      this.$emit('click', this.post.id)
    },
    onLike() {
      this.$emit('like', this.post.id)
    },
    onComment() {
      this.$emit('comment', this.post.id)
    },
    onDelete() {
      this.$emit('delete', this.post.id)
    },
    previewImage(current) {
      uni.previewImage({
        urls: this.post.images,
        current: current
      })
    }
  }
}
</script>

<style scoped>
.post-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.post-card:active {
  transform: scale(0.99);
  background: #fafafa;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.post-header .avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background: #f5f5f5;
  border: 2rpx solid #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.post-header .user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-header .user-info .name-row {
  display: flex;
  align-items: center;
}

.post-header .user-info .nickname {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 12rpx;
}

.post-header .user-info .post-tag {
  font-size: 20rpx;
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.post-header .user-info .time {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
}

.post-header .delete-btn {
  padding: 10rpx;
  color: #ff4d4f;
  opacity: 0.6;
}

.post-header .delete-btn:active {
  opacity: 1;
}

.post-content {
  margin-bottom: 24rpx;
}

.post-content .post-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 12rpx;
  display: block;
  line-height: 1.4;
}

.post-content .post-text {
  font-size: 28rpx;
  color: #4a4a4a;
  line-height: 1.6;
  display: block;
  word-break: break-all;
}

.post-content .post-images {
  display: grid;
  gap: 12rpx;
  margin-top: 20rpx;
}

.post-content .post-images.images-1 {
  grid-template-columns: 1fr;
}
.post-content .post-images.images-1 .post-image {
  height: 400rpx;
  width: 100%;
  border-radius: 16rpx;
}

.post-content .post-images.images-2 {
  grid-template-columns: 1fr 1fr;
}
.post-content .post-images.images-2 .post-image {
  height: 280rpx;
  border-radius: 12rpx;
}

.post-content .post-images.images-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.post-content .post-images.images-3 .post-image {
  height: 210rpx;
  border-radius: 8rpx;
}

.post-content .post-images .post-image {
  width: 100%;
  background: #f8f8f8;
}

.post-content .post-images .post-image:active {
  opacity: 0.8;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.post-footer .action-group {
  display: flex;
}

.post-footer .action-item {
  display: flex;
  align-items: center;
  margin-right: 48rpx;
}

.post-footer .action-item .action-icon {
  font-size: 36rpx;
  margin-right: 8rpx;
}

.post-footer .action-item .action-count {
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.post-footer .action-item.active .action-count {
  color: #ff4d4f;
}

.post-footer .view-count {
  font-size: 22rpx;
  color: #bbbbbb;
}
</style>
