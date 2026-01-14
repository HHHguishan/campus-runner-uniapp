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
          
          // 解析图片 JSON 字符串
          if (this.post.images && typeof this.post.images === 'string') {
            try {
              this.post.images = JSON.parse(this.post.images)
            } catch (e) {
              console.error('解析详情图片失败:', e)
              this.post.images = []
            }
          }
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
@import "@/uni.scss";
.detail-container {
  height: 100vh;
  background-color: #f8fcf9;
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
    font-size: 52rpx;
    color: #fff;
    width: 60rpx;
    font-weight: 300;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    letter-spacing: 2rpx;
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
  margin-bottom: 24rpx;
  box-shadow: $forum-card-shadow;
  
  .user-row {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .avatar {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      background: #f8f8f8;
      border: 4rpx solid #ffffff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
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
        color: $forum-text-main;
      }
      
      .tag {
        font-size: 20rpx;
        color: $forum-primary;
        background: $forum-primary-light;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-weight: 600;
      }
      
      .time {
        font-size: 24rpx;
        color: $forum-text-light;
        margin-top: 6rpx;
      }
    }
    
    .del-btn {
      font-size: 24rpx;
      color: #ff4d4f;
      background: #fff1f0;
      padding: 0 28rpx;
      height: 56rpx;
      line-height: 56rpx;
      border-radius: 28rpx;
      border: 1rpx solid rgba(255, 77, 79, 0.2);
      font-weight: 500;
      
      &::after { border: none; }
    }
  }
  
  .content {
    .title {
      font-size: 44rpx;
      font-weight: bold;
      color: $forum-text-main;
      margin-bottom: 28rpx;
      display: block;
      line-height: 1.5;
    }
    
    .text {
      font-size: 32rpx;
      color: $forum-text-sub;
      line-height: 1.8;
      margin-bottom: 32rpx;
      display: block;
      white-space: pre-wrap;
    }
    
    .image-grid {
      display: flex;
      flex-direction: column;
      gap: 24rpx;
      
      .detail-img {
        width: 100%;
        border-radius: 24rpx;
        background: #f8f8f8;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
      }
    }
  }

  .interact-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 60rpx;
    padding-top: 32rpx;
    border-top: 2rpx solid #fafafa;
    
    .item {
      display: flex;
      align-items: center;
      padding: 16rpx 40rpx;
      background: #f8f9fa;
      border-radius: 40rpx;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      .icon {
        font-size: 38rpx;
        margin-right: 12rpx;
      }
      
      .num {
        font-size: 28rpx;
        color: $forum-text-sub;
        font-weight: 600;
      }
      
      &.active {
        background: #fff1f0;
        transform: scale(1.05);
        box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.15);
        .num { color: #ff4d4f; }
      }
      
      &:active { transform: scale(0.95); }
    }
    
    .view-info {
      font-size: 24rpx;
      color: $forum-text-light;
    }
  }
}

.comment-section {
  padding: 40rpx 30rpx;
  background: #fff;
  min-height: 400rpx;
  padding-bottom: 140rpx;
  box-shadow: $forum-card-shadow;
  
  .section-title {
    font-size: 34rpx;
    font-weight: bold;
    color: $forum-text-main;
    margin-bottom: 40rpx;
    display: flex;
    align-items: center;
    
    &::before {
      content: '';
      width: 10rpx;
      height: 36rpx;
      background: $forum-primary-gradient;
      margin-right: 18rpx;
      border-radius: 6rpx;
    }
  }
}

.comment-item {
  display: flex;
  margin-bottom: 48rpx;
  
  .c-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background: #f8f8f8;
    border: 2rpx solid #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  }
  
  .c-body {
    flex: 1;
    
    .c-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .c-nickname {
        font-size: 29rpx;
        font-weight: 600;
        color: $forum-text-main;
      }
      
      .c-time {
        font-size: 22rpx;
        color: $forum-text-light;
      }
    }
    
    .c-text {
      font-size: 29rpx;
      color: $forum-text-sub;
      line-height: 1.6;
      display: block;
    }
    
    .c-delete {
      font-size: 22rpx;
      color: #ff4d4f;
      margin-top: 14rpx;
      display: inline-block;
      opacity: 0.6;
      font-weight: 500;
    }
  }
}

.no-comment {
  padding: 120rpx 0;
  text-align: center;
  color: #bbb;
  font-size: 28rpx;
}

.comment-input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $forum-glass-bg;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.05);
  border-top: 2rpx solid $forum-glass-border;
  z-index: 100;
  
  .c-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.8);
    height: 84rpx;
    border-radius: 42rpx;
    padding: 0 36rpx;
    font-size: 28rpx;
    border: 1rpx solid rgba(0, 0, 0, 0.04);
  }
  
  .send-btn {
    margin-left: 28rpx;
    font-size: 32rpx;
    color: #bbb;
    font-weight: 600;
    transition: all 0.3s;
    
    &.active {
      color: $forum-primary;
      transform: scale(1.05);
    }
    
    &:active { opacity: 0.6; }
  }
}

.bottom-padding {
  height: 80rpx;
}
</style>
