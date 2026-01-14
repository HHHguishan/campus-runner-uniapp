<template>
  <view class="my-posts-container">
    <view class="status-bar"></view>
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">我的帖子</view>
      <view class="nav-right"></view>
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
        <post-card 
          v-for="post in posts" 
          :key="post.id"
          :post="post"
          :is-my-post="true"
          @click="goToDetail"
          @delete="handleDelete"
          @like="onLike"
        />
        
        <!-- 加载状态 -->
        <view class="loading-status">
          <view v-if="loading" class="loading-spinner"></view>
          <text v-if="loading">正在加载...</text>
          <block v-else>
            <text v-if="posts.length === 0">还没有发布过帖子哦</text>
            <text v-else-if="noMore">没有更多了</text>
          </block>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import PostCard from '../../components/post-card/post-card.vue'
import { getMyPosts, deletePost, likePost } from '../../api/forum.js'

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
      refreshing: false
    }
  },
  onLoad() {
    this.loadPosts()
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
          size: this.pageSize
        }
        
        const res = await getMyPosts(params)
        
        if (res.code === 200) {
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
            this.noMore = (list.length < this.pageSize) || (total > 0 && this.posts.length >= total)
          }
        } else {
          if (isRefresh) this.posts = []
          this.noMore = true
        }
      } catch (error) {
        console.error('❌ 加载我的帖子失败:', error)
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
    handleDelete(postId) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这条帖子吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await deletePost(postId)
              if (delRes.code === 200) {
                uni.showToast({ title: '已删除' })
                // 从列表中移除
                this.posts = this.posts.filter(p => p.id !== postId)
                // 通知广场刷新
                uni.$emit('refreshForum')
              }
            } catch (error) {
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
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
.my-posts-container {
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
