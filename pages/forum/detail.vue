<template>
  <view class="detail-container">
    <view class="status-bar"></view>
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">详情</view>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="detail-scroll" scroll-y>
      <!-- 帖子内容 -->
      <view class="post-pannel" v-if="post">
        <view class="user-row">
          <image class="avatar" :src="post.avatar || '/static/images/default-avatar.png'"></image>
          <view class="info">
            <view class="name-box">
              <text class="nickname">{{ post.nickname }}</text>
              <text v-if="post.tag" class="tag">{{ post.tag }}</text>
            </view>
            <text class="time">{{ post.createTime }}</text>
          </view>
          <button v-if="isMe" class="del-btn" @tap="onDeletePost">删除</button>
        </view>
        
        <view class="content">
          <text v-if="post.title" class="title">{{ post.title }}</text>
          <text class="text">{{ post.content }}</text>
          <view class="image-grid">
            <image 
              v-for="(img, idx) in post.images" 
              :key="idx" 
              :src="img" 
              class="detail-img" 
              mode="widthFix"
              @tap="previewImage(idx)"
            ></image>
          </view>
        </view>

        <view class="interact-bar">
          <view class="item" :class="{active: post.liked}" @tap="onLike">
            <text class="icon">{{ post.liked ? '❤️' : '🤍' }}</text>
            <text class="num">{{ post.likeCount || 0 }} 人觉得很赞</text>
          </view>
          <view class="view-info">{{ post.viewCount || 0 }} 次阅读</view>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="comment-section">
        <view class="section-title">评论 ({{ comments.length }})</view>
        
        <view class="comment-list">
          <view class="comment-item" v-for="comment in comments" :key="comment.id">
            <image class="c-avatar" :src="comment.avatar || '/static/images/default-avatar.png'"></image>
            <view class="c-body">
              <view class="c-header">
                <text class="c-nickname">{{ comment.nickname }}</text>
                <text class="c-time">{{ comment.createTime }}</text>
              </view>
              <text class="c-text">{{ comment.content }}</text>
              <view v-if="comment.isMe" class="c-delete" @tap="onDeleteComment(comment.id)">删除</view>
            </view>
          </view>
          
          <view v-if="comments.length === 0" class="no-comment">
            还没有评论，快来抢沙发~
          </view>
        </view>
      </view>
      
      <!-- 底部撑开 -->
      <view class="bottom-padding"></view>
    </scroll-view>

    <!-- 底部输入框 -->
    <view class="comment-input-bar">
      <input 
        class="c-input" 
        v-model="commentValue" 
        placeholder="写下你的热评..." 
        confirm-type="send"
        @confirm="submitComment"
      />
      <text class="send-btn" :class="{active: commentValue.trim()}" @tap="submitComment">发送</text>
    </view>
  </view>
</template>

<script>
import { getPostDetail, likePost, deletePost, addComment, getCommentList, deleteComment } from '@/api/forum.js'

export default {
  data() {
    return {
      id: null,
      post: null,
      comments: [],
      commentValue: '',
      isMe: false
    }
  },
  onLoad(options) {
    this.id = options.id
    this.loadData()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadData() {
      uni.showLoading({ title: '加载中' })
      try {
        const [pRes, cRes] = await Promise.all([
          getPostDetail(this.id),
          getCommentList({ postId: this.id, page: 1, size: 50 })
        ])
        
        console.log('🔍 帖子详情响应:', pRes)
        console.log('🔍 评论列表响应:', cRes)
        
        if (pRes.code === 200) {
          this.post = pRes.data
          this.isMe = this.post.isOwner // 使用后端返回的 isOwner
        }
        
        if (cRes.code === 200) {
          this.comments = cRes.data.records || []
        }
      } catch (e) {
        console.error('❌ 加载详情失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    async onLike() {
      try {
        const res = await likePost(this.id)
        if (res.code === 200) {
          this.post.liked = res.data.liked
          this.post.likeCount = res.data.likeCount
        }
      } catch (e) {}
    },
    async submitComment() {
      if (!this.commentValue.trim()) return
      
      try {
        const res = await addComment({
          postId: this.id,
          content: this.commentValue,
          parentId: null // 顶层评论
        })
        if (res.code === 200) {
          uni.showToast({ title: '回复成功' })
          this.commentValue = ''
          this.loadData() // 重新加载评论列表
        }
      } catch (e) {}
    },
    async onDeletePost() {
      uni.showModal({
        content: '确定删除该动态吗？',
        success: async (res) => {
          if (res.confirm) {
            const dRes = await deletePost(this.id)
            if (dRes.code === 200) {
              uni.$emit('refreshForum')
              uni.navigateBack()
            }
          }
        }
      })
    },
    async onDeleteComment(cid) {
      const res = await deleteComment(cid)
      if (res.code === 200) this.loadData()
    },
    previewImage(idx) {
      uni.previewImage({
        urls: this.post.images,
        current: idx
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.status-bar {
  height: var(--status-bar-height);
  background: #fff;
}

.nav-bar {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  
  .nav-back {
    font-size: 48rpx;
    color: #333;
    width: 60rpx;
  }
  
  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #1a1a1a;
  }
  
  .nav-right {
    width: 60rpx;
  }
}

.detail-scroll {
  flex: 1;
  overflow: hidden;
}

.post-pannel {
  background: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .user-row {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .avatar {
      width: 90rpx;
      height: 90rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      background: #f5f5f5;
    }
    
    .info {
      flex: 1;
      
      .name-box {
        display: flex;
        align-items: center;
        gap: 12rpx;
      }
      
      .nickname {
        font-size: 32rpx;
        font-weight: 600;
        color: #1a1a1a;
      }
      
      .tag {
        font-size: 20rpx;
        color: #07c160;
        background: rgba(7, 193, 96, 0.1);
        padding: 4rpx 16rpx;
        border-radius: 6rpx;
        font-weight: 500;
      }
      
      .time {
        font-size: 24rpx;
        color: #999;
        margin-top: 6rpx;
      }
    }
    
    .del-btn {
      font-size: 24rpx;
      color: #ff4d4f;
      background: #fff1f0;
      padding: 0 24rpx;
      height: 52rpx;
      line-height: 52rpx;
      border-radius: 26rpx;
      border: 1rpx solid #ffa39e;
      
      &::after { border: none; }
    }
  }
  
  .content {
    .title {
      font-size: 42rpx;
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 24rpx;
      display: block;
      line-height: 1.4;
    }
    
    .text {
      font-size: 32rpx;
      color: #333;
      line-height: 1.8;
      margin-bottom: 32rpx;
      display: block;
      white-space: pre-wrap;
    }
    
    .image-grid {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      
      .detail-img {
        width: 100%;
        border-radius: 16rpx;
        background: #f8f8f8;
      }
    }
  }

  .interact-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 60rpx;
    padding-top: 32rpx;
    border-top: 1rpx solid #f2f2f2;
    
    .item {
      display: flex;
      align-items: center;
      padding: 12rpx 32rpx;
      background: #f8f9fa;
      border-radius: 40rpx;
      transition: all 0.2s;
      
      .icon {
        font-size: 36rpx;
        margin-right: 12rpx;
      }
      
      .num {
        font-size: 26rpx;
        color: #666;
        font-weight: 500;
      }
      
      &.active {
        background: #fff1f0;
        .num { color: #ff4d4f; }
      }
      
      &:active { transform: scale(0.95); }
    }
    
    .view-info {
      font-size: 24rpx;
      color: #bbb;
    }
  }
}

.comment-section {
  padding: 40rpx 30rpx;
  background: #fff;
  min-height: 400rpx;
  padding-bottom: 140rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 40rpx;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      width: 8rpx;
      height: 32rpx;
      background: #07c160;
      margin-right: 16rpx;
      border-radius: 4rpx;
    }
  }
}

.comment-item {
  display: flex;
  margin-bottom: 42rpx;
  
  .c-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: #f5f5f5;
  }
  
  .c-body {
    flex: 1;
    
    .c-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8rpx;
      
      .c-nickname {
        font-size: 28rpx;
        font-weight: 600;
        color: #4a4a4a;
      }
      
      .c-time {
        font-size: 22rpx;
        color: #bbb;
      }
    }
    
    .c-text {
      font-size: 28rpx;
      color: #1a1a1a;
      line-height: 1.6;
      display: block;
    }
    
    .c-delete {
      font-size: 22rpx;
      color: #ff4d4f;
      margin-top: 12rpx;
      display: inline-block;
      opacity: 0.7;
    }
  }
}

.no-comment {
  padding: 100rpx 0;
  text-align: center;
  color: #bbb;
  font-size: 26rpx;
}

.comment-input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.05);
  z-index: 100;
  
  .c-input {
    flex: 1;
    background: #f8f9fa;
    height: 80rpx;
    border-radius: 40rpx;
    padding: 0 32rpx;
    font-size: 28rpx;
    border: 1rpx solid #f0f0f0;
  }
  
  .send-btn {
    margin-left: 24rpx;
    font-size: 30rpx;
    color: #bbb;
    font-weight: 600;
    transition: color 0.3s;
    
    &.active {
      color: #07c160;
    }
    
    &:active { opacity: 0.7; }
  }
}

.bottom-padding {
  height: 60rpx;
}
</style>
