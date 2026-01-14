<template>
  <view class="forum-container">
    <view class="status-bar"></view>
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">校园广场</view>
      <view class="nav-right"></view>
    </view>

    <!-- 分类筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="tag-scroll" shows-horizontal-scroll-view="false">
        <view 
          class="tag-pill" 
          :class="{active: currentTag === null}" 
          @tap="switchTag(null)"
        >全部</view>
        <view 
          v-for="tag in tagOptions" 
          :key="tag" 
          class="tag-pill" 
          :class="{active: currentTag === tag}"
          @tap="switchTag(tag)"
        >{{ tag }}</view>
      </scroll-view>
    </view>

    <!-- 帖子列表 -->
    <scroll-view 
      class="post-list-scroll" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="post-list">
        
        <!-- 直接渲染帖子卡片（绕过组件问题） -->
        <view 
          v-for="post in posts" 
          :key="'inline-' + post.id"
          class="post-card-inline"
          @tap="goToDetail(post.id)"
        >
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
          </view>
          
          <!-- 帖子内容 -->
          <view class="post-content">
            <text v-if="post.title" class="post-title">{{ post.title }}</text>
            <text class="post-text">{{ post.contentPreview || post.content }}</text>
          </view>
          
          <!-- 交互栏 -->
          <view class="post-footer">
            <view class="action-group">
              <view class="action-item" :class="{ active: post.liked }" @tap.stop="onLike(post.id)">
                <text class="action-icon">{{ post.liked ? '❤️' : '🤍' }}</text>
                <text class="action-count">{{ post.likeCount || 0 }}</text>
              </view>
              <view class="action-item" @tap.stop="goToDetail(post.id)">
                <text class="action-icon">💬</text>
                <text class="action-count">{{ post.commentCount || 0 }}</text>
              </view>
            </view>
            <view class="view-count" v-if="post.viewCount">
              <text>{{ post.viewCount }} 次阅读</text>
            </view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading-status">
          <view v-if="loading" class="loading-spinner"></view>
          <text v-if="loading">正在加载...</text>
          <block v-else>
            <text v-if="posts.length === 0">在这里分享你的校园生活吧</text>
            <text v-else-if="noMore">暂无更多精彩动态</text>
          </block>
        </view>
      </view>
    </scroll-view>

    <!-- 发布悬浮按钮 -->
    <view class="publish-btn" @tap="goToCreate">
      <text class="plus-icon">+</text>
    </view>
  </view>
</template>

<script>
import PostCard from '../../components/post-card/post-card.vue'
import { getPostList, likePost } from '../../api/forum.js'

export default {
  components: {
    'post-card': PostCard
  },
  data() {
    return {
      posts: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      refreshing: false,
      currentTag: null,
      tagOptions: ['失物', '吐槽', '闲置', '求助', '表白']
    }
  },
  onLoad() {
    this.loadPosts()
    // 监听刷新事件
    uni.$on('refreshForum', this.onRefresh)
  },
  onUnload() {
    // 移除监听
    uni.$off('refreshForum', this.onRefresh)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async loadPosts(isRefresh = false) {
      if (this.loading) return
      this.loading = true
      
      try {
        const params = {
          page: isRefresh ? 1 : this.pageNum,
          size: this.pageSize,
          orderBy: 'createTime,desc'
        }
        if (this.currentTag) {
          params.tag = this.currentTag
        }
        
        const res = await getPostList(params)
        
        if (res.code === 200) {
          // 兼容处理：支持 data.records (分页) 和 data (直接数组)
          let list = []
          let total = 0
          
          if (res.data) {
             if (Array.isArray(res.data)) {
                 list = res.data
                 total = list.length
             } else if (res.data.records && Array.isArray(res.data.records)) {
                 list = res.data.records
                 total = res.data.total || 0
             }
          }
          
          if (isRefresh) {
            this.posts = list
            this.pageNum = 2
            this.noMore = list.length < this.pageSize
          } else {
            this.posts = [...this.posts, ...list]
            this.pageNum++
            // 判断是否没有更多数据：本次不够pageSize 或 总数已够
            this.noMore = (list.length < this.pageSize) || (total > 0 && this.posts.length >= total)
          }
        } else {
          console.warn('⚠️ 响应异常或无数据:', res)
          if (isRefresh) this.posts = []
          this.noMore = true
        }
      } catch (error) {
        console.error('❌ 加载动态失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    onRefresh() {
      this.refreshing = true
      this.loadPosts(true)
    },
    switchTag(tag) {
      if (this.currentTag === tag) return
      this.currentTag = tag
      this.posts = []
      this.pageNum = 1
      this.loadPosts(true)
    },
    loadMore() {
      if (!this.noMore) {
        this.loadPosts()
      }
    },
    goToDetail(postId) {
      uni.navigateTo({
        url: `/pages/forum/detail?id=${postId}`
      })
    },
    goToCreate() {
      uni.navigateTo({
        url: '/pages/forum/create'
      })
    },
    async onLike(postId) {
      try {
        const res = await likePost(postId)
        if (res.code === 200) {
          const index = this.posts.findIndex(p => p.id === postId)
          if (index !== -1) {
            const post = this.posts[index]
            post.liked = res.data.liked
            post.likeCount = res.data.likeCount
            this.posts[index] = post
          }
        }
      } catch (error) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.forum-container {
  height: 100vh;
  background-color: #f8fcf9; // 更清新的淡绿色背景
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
  position: relative;
  z-index: 100;
  box-shadow: 0 4rpx 20rpx rgba(7, 193, 96, 0.15);
  
  .nav-back {
    width: 60rpx;
    font-size: 52rpx;
    color: #fff;
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

.filter-bar {
  background: $forum-glass-bg;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 24rpx 0;
  border-bottom: 2rpx solid $forum-glass-border;
  position: sticky;
  top: 0;
  z-index: 90;
  
  .tag-scroll {
    white-space: nowrap;
    padding: 0 30rpx;
    
    .tag-pill {
      display: inline-block;
      padding: 14rpx 36rpx;
      margin-right: 20rpx;
      background: rgba(255, 255, 255, 0.6);
      color: $forum-text-sub;
      border-radius: 40rpx;
      font-size: 26rpx;
      border: 1rpx solid rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      &.active {
        background: $forum-primary;
        color: #fff;
        font-weight: 600;
        box-shadow: 0 8rpx 16rpx rgba(7, 193, 96, 0.25);
        transform: translateY(-2rpx);
        border-color: rgba(7, 193, 96, 0.1);
      }
    }
  }
}

.post-list-scroll {
  flex: 1;
  height: 0;
}

.post-list {
  padding: 24rpx;
  
  .loading-status {
    padding: 60rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #bbb;
    font-size: 26rpx;
    
    .loading-spinner {
      width: 44rpx;
      height: 44rpx;
      border: 4rpx solid #f3f3f3;
      border-top: 4rpx solid $forum-primary;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20rpx;
    }
  }
}

/* 内联帖子卡片样式 (兜底使用) */
.post-card-inline {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  box-shadow: $forum-card-shadow;
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  
  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      background: #f5f5f5;
      border: 4rpx solid #ffffff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
    }
    
    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .name-row {
        display: flex;
        align-items: center;
      }
      
      .nickname {
        font-size: 30rpx;
        font-weight: 600;
        color: $forum-text-main;
        margin-right: 12rpx;
      }
      
      .post-tag {
        font-size: 20rpx;
        color: $forum-primary;
        background: $forum-primary-light;
        padding: 4rpx 14rpx;
        border-radius: 8rpx;
        font-weight: 600;
      }
      
      .time {
        font-size: 22rpx;
        color: $forum-text-light;
        margin-top: 6rpx;
      }
    }
  }
  
  .post-content {
    margin-bottom: 28rpx;
    
    .post-title {
      font-size: 34rpx;
      font-weight: bold;
      color: $forum-text-main;
      margin-bottom: 14rpx;
      display: block;
      line-height: 1.5;
    }
    
    .post-text {
      font-size: 29rpx;
      color: $forum-text-sub;
      line-height: 1.6;
      display: block;
      word-break: break-all;
    }
  }
  
  .post-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 2rpx solid #fafafa;
    padding-top: 24rpx;
    
    .action-group {
      display: flex;
    }
    
    .action-item {
      display: flex;
      align-items: center;
      margin-right: 56rpx;
      
      .action-icon {
        font-size: 38rpx;
        margin-right: 10rpx;
      }
      
      .action-count {
        font-size: 26rpx;
        color: $forum-text-sub;
        font-weight: 500;
      }
      
      &.active .action-count {
        color: #ff4d4f;
        font-weight: 600;
      }
    }
    
    .view-count {
      font-size: 22rpx;
      color: $forum-text-light;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.publish-btn {
  position: fixed;
  right: 50rpx;
  bottom: 80rpx;
  width: 116rpx;
  height: 116rpx;
  background: $forum-primary-gradient;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(7, 193, 96, 0.4);
  z-index: 99;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  .plus-icon {
    font-size: 68rpx;
    color: #fff;
    font-weight: 300;
    margin-bottom: 6rpx;
  }
  
  &:active {
    transform: scale(0.85) rotate(90deg);
    box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.2);
  }
}
</style>
