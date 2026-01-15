<template>
  <view class="index-container">
    <view class="status-bar"></view>
    <view class="page-header">
      <text class="page-title">首页</text>
    </view>
    <!-- 下拉刷新 -->
    <scroll-view
      class="scroll-container"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
    <!-- 顶部定位栏 -->
    <view class="location-bar" @tap="getUserLocation">
      <text class="location-icon">📍</text>
      <text class="location-text">{{ locationText }}</text>
    </view>

    <!-- 轮播图区域 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        indicator-dots
        indicator-color="rgba(255, 255, 255, 0.5)"
        indicator-active-color="#fff"
        autoplay
        circular
        interval="3000"
        duration="500"
      >
        <swiper-item v-for="banner in displayBanners" :key="banner.id" @tap="onBannerClick(banner)">
          <image v-if="banner.imgUrl" :src="banner.imgUrl" class="banner-image" mode="aspectFill"></image>
          <view v-else class="banner-item" :style="{background: banner.gradient}">
            <text class="banner-text">{{ banner.title }}</text>
            <text v-if="banner.subtitle" class="banner-subtitle">{{ banner.subtitle }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 金刚区图标导航 -->
    <view class="nav-grid">
      <view class="nav-item" @tap="navigateToPublish('buy')">
        <view class="nav-icon nav-icon-1">🛒</view>
        <text class="nav-label">帮买</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('send')">
        <view class="nav-icon nav-icon-2">📦</view>
        <text class="nav-label">帮送</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('fetch')">
        <view class="nav-icon nav-icon-3">📬</view>
        <text class="nav-label">帮取</text>
      </view>
      <view class="nav-item" @tap="navigateToPublish('all')">
        <view class="nav-icon nav-icon-4">🚀</view>
        <text class="nav-label">全能</text>
      </view>
    </view>

    <!-- 快捷发布卡片 -->
    <view class="publish-card" @tap="navigateToPublish('all')">
      <view class="publish-header">
        <text class="publish-title">🚀 快速发布订单</text>
        <text class="publish-subtitle">支持帮买、帮送、帮取</text>
      </view>
      <view class="publish-btn">
        <text>立即发布</text>
        <text class="btn-arrow">›</text>
      </view>
    </view>
    
    <!-- 计费规则入口 -->
    <view class="billing-rules-link" @tap="showConfigModal">
      <text>计费规则</text>
    </view>

    <!-- 校园圈子预览 -->
    <view class="forum-section">
      <view class="section-header-modern">
        <view class="left">
          <text class="title">校园圈子</text>
          <text class="subtitle">有趣的事都在这里</text>
        </view>
        <text class="more-btn" @tap="goToForum">发现更多</text>
      </view>
      
      <view class="forum-preview-list">
        <post-card 
          v-for="post in forumPosts" 
          :key="post.id" 
          :post="post"
          @click="goToPostDetail"
          @like="onPostLike"
        ></post-card>
        
        <view v-if="forumPosts.length === 0" class="empty-forum">
          <image class="empty-img" src="/static/images/empty-forum.png" mode="aspectFit"></image>
          <text>还没有精彩动态，去发布一条吧~</text>
        </view>
      </view>
    </view>
    </scroll-view>

    <!-- 配置弹窗 -->
    <view class="config-modal" v-if="showModal" @tap="hideConfigModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">系统配置</text>
          <view class="header-right">
            <view class="info-icon" @tap="toggleConfigInfo">
              <text class="info-text">i</text>
            </view>
            <text class="close-btn" @tap="hideConfigModal">✕</text>
          </view>
        </view>

        <!-- 配置说明区域 -->
        <view class="config-info" v-if="showConfigInfo">
          <view class="info-section">
            <view class="info-item">
              <text class="info-title">💰 起步价</text>
              <text class="info-desc">订单的基础起送费用</text>
            </view>
            <view class="info-item">
              <text class="info-title">📏 里程费</text>
              <text class="info-desc">每公里增加的配送费，系统会自动计算距离</text>
            </view>
            <view class="info-item">
              <text class="info-title">🌤️ 天气加价</text>
              <text class="info-desc">用于雨雪天气，直接附加在订单总额上，激励骑手接单</text>
            </view>
            <view class="info-item">
              <text class="info-title">💳 抽成比例</text>
              <text class="info-desc">例如设置为10%，则10元运费中平台收取1元，骑手得9元</text>
            </view>
          </view>
        </view>

        <scroll-view class="modal-body" scroll-y>
          <view class="config-list">
            <view class="config-list-item" v-for="(config, index) in configList" :key="index">
              <view class="item-icon">📋</view>
              <view class="item-info">
                <text class="item-label">{{ config.remark || config.paramKey }}</text>
                <text class="item-value">{{ config.displayValue }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="modal-btn" @tap="hideConfigModal">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBannerList } from '../../api/notice.js'
import { getConfigs } from '../../api/config.js'
import { getPostList, likePost } from '../../api/forum.js'
import { getBaiduLocation } from '../../utils/location.js'
import { get } from '../../utils/request.js'

export default {
  data() {
    return {
      refreshing: false,  // 是否正在刷新
      showModal: false,   // 是否显示配置弹窗
      showConfigInfo: false,  // 是否显示配置说明
      bannerList: [],
      configList: [],
      // 默认轮播图数据
      defaultBanners: [
        {
          id: 'default-1',
          title: '新用户首单立减¥5',
          subtitle: '快来体验吧',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          imgUrl: '',
          content: '新用户专享优惠'
        },
        {
          id: 'default-2',
          title: '成为骑手 轻松赚钱',
          subtitle: '时间自由 · 多劳多得',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          imgUrl: '',
          content: 'join_rider'
        },
        {
          id: 'default-3',
          title: '校园跑腿 随叫随到',
          subtitle: '帮买 · 帮送 · 帮取',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          imgUrl: '',
          content: 'service_intro'
        },
        {
          id: 'default-4',
          title: '邀请好友 双方得奖励',
          subtitle: '一起省钱 一起赚钱',
          gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          imgUrl: '',
          content: 'invite_friends'
        }
      ],
      recentOrders: [
        // 示例数据，后续从接口获取
        {
          id: 1,
          typeText: '帮买',
          status: 1,
          statusText: '待接单',
          address: '奶茶店 → 5号楼302',
          time: '10分钟前',
          price: '8.00'
        }
      ],
      forumPosts: [], // 圈子动态
      locationText: '正在定位...',
      latitude: null,  // 当前经度
      longitude: null  // 当前纬度
    };
  },

  computed: {
    // 显示的轮播图：优先显示API加载的，没有则显示默认的
    displayBanners() {
      return this.bannerList.length > 0 ? this.bannerList : this.defaultBanners
    }
  },

  onLoad() {
    this.loadBanners()
    this.loadConfigs()
    this.loadForumPosts()
    this.getUserLocation()
    // 监听发布成功，自动刷新首页预览
    uni.$on('refreshForum', this.loadForumPosts)
  },
  onUnload() {
    uni.$off('refreshForum', this.loadForumPosts)
  },

  onShow() {
    // 页面显示时也刷新数据（从其他页面返回时）
    console.log('=== 首页显示，刷新数据 ===')
    this.loadForumPosts()
  },

  methods: {
    // 加载轮播图
    async loadBanners() {
      try {
        console.log('=== 开始加载轮播图 ===')
        const res = await getBannerList()

        console.log('轮播图API响应:', res)
        console.log('响应码:', res.code)
        console.log('响应数据:', res.data)
        console.log('数据类型:', typeof res.data)
        console.log('是否为数组:', Array.isArray(res.data))

        if (res.code === 200 && res.data) {
          // 确保data是数组
          const bannerData = Array.isArray(res.data) ? res.data : []

          console.log('处理后的轮播图数据:', bannerData)
          console.log('轮播图数量:', bannerData.length)

          if (bannerData.length > 0) {
            // 为后端数据添加渐变色（如果没有图片）
            this.bannerList = bannerData.map((item, index) => {
              console.log(`处理轮播图 ${index}:`, item)

              // 确保item有必要的字段
              const banner = {
                id: item.id,
                title: item.title || '轮播图',
                content: item.content,
                imgUrl: item.imgUrl || item.imageUrl || '',
                gradient: item.gradient,
                subtitle: item.subtitle || '',
                sort: item.sort || 0
              }

              // 如果没有渐变色且没有图片，添加默认渐变色
              if (!banner.gradient && !banner.imgUrl) {
                const gradients = [
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                ]
                banner.gradient = gradients[index % gradients.length]
              }

              return banner
            })

            console.log('最终轮播图列表:', this.bannerList)
          } else {
            console.log('后端返回空数组，使用默认轮播图')
            this.bannerList = []
          }
        } else {
          console.log('响应码不是200或没有数据，使用默认轮播图')
          this.bannerList = []
        }
      } catch (error) {
        console.error('=== 加载轮播图失败 ===')
        console.error('错误信息:', error)
        console.error('错误详情:', JSON.stringify(error))
        // 失败时使用默认轮播图
        this.bannerList = []
      }
    },

    // 加载系统配置
    async loadConfigs() {
      try {
        console.log('=== 开始加载系统配置 ===')

        // 获取所有配置（不传keys参数）
        const res = await getConfigs()

        console.log('系统配置API响应完整数据:', JSON.stringify(res))
        console.log('响应码:', res.code)
        console.log('响应数据:', res.data)
        console.log('数据类型:', typeof res.data)

        if (res.code === 200 && res.data) {
          const configs = []

          // 将配置对象转换为数组格式
          if (typeof res.data === 'object' && !Array.isArray(res.data)) {
            const keys = Object.keys(res.data)
            console.log('配置键列表:', keys)

            keys.forEach(key => {
              const value = res.data[key]
              console.log(`处理配置项: ${key} = ${value}`)

              configs.push({
                paramKey: key,
                paramValue: String(value),  // 确保值是字符串
                displayValue: this.formatConfigValue(key, value),
                remark: this.getConfigRemark(key)
              })
            })
          } else if (Array.isArray(res.data)) {
            // 如果返回的是数组，可能是后端返回了ConfigVO列表
            console.log('后端返回数组格式，转换处理')
            this.configList = res.data.map(item => ({
              paramKey: item.paramKey,
              paramValue: item.paramValue,
              displayValue: this.formatConfigValue(item.paramKey, item.paramValue),
              remark: item.remark || item.paramKey
            }))
            console.log(`✅ 配置加载成功，共${this.configList.length}个配置项`)
            return
          }

          console.log('最终配置列表数量:', configs.length)
          console.log('最终配置列表:', JSON.stringify(configs))

          this.configList = configs

          console.log(`✅ 配置加载成功，共${configs.length}个配置项`)

          // 显示提示
          if (configs.length > 0) {
            uni.showToast({
              title: `配置已更新`,
              icon: 'success',
              duration: 1500
            })
          }
        } else {
          console.log('响应码不是200或没有数据')
          uni.showToast({
            title: '配置为空',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('=== 加载系统配置失败 ===')
        console.error('错误信息:', error)
        console.error('错误详情:', JSON.stringify(error))

        uni.showToast({
          title: '加载配置失败',
          icon: 'none'
        })

        // 失败时创建空配置列表
        this.configList = []
      }
    },

    // 显示配置弹窗
    showConfigModal() {
      console.log('点击配置按钮，当前配置数量:', this.configList.length)

      if (this.configList.length === 0) {
        uni.showToast({
          title: '正在加载配置...',
          icon: 'loading'
        })
        // 重新加载配置
        this.loadConfigs().then(() => {
          setTimeout(() => {
            this.showModal = true
          }, 500)
        })
      } else {
        this.showModal = true
      }
    },

    // 隐藏配置弹窗
    hideConfigModal() {
      this.showModal = false
      // 关闭弹窗时重置说明显示状态
      this.showConfigInfo = false
    },

    // 切换配置说明显示
    toggleConfigInfo() {
      this.showConfigInfo = !this.showConfigInfo
      console.log('配置说明显示状态:', this.showConfigInfo)
    },

    // 格式化配置值的显示
    formatConfigValue(key, value) {
      // 根据不同的配置键格式化显示
      const formatMap = {
        'base_price': `¥${value}元`,
        'per_km_price': `¥${value}元/公里`,
        'weather_rate': `${value}倍`,
        'platform_rate': `${value}%`,
        'min_delivery_fee': `¥${value}元`,
        'max_delivery_distance': `${value}公里`,
        'service_time': `${value}小时`
      }

      return formatMap[key] || value
    },

    // 获取配置的备注名称
    getConfigRemark(key) {
      const remarkMap = {
        'base_price': '起步价',
        'per_km_price': '公里单价',
        'weather_rate': '天气系数',
        'platform_rate': '平台费率',
        'min_delivery_fee': '最低配送费',
        'max_delivery_distance': '最大配送距离',
        'service_time': '服务时间'
      }

      return remarkMap[key] || key
    },

    // 下拉刷新
    async onRefresh() {
      console.log('=== 开始刷新首页数据 ===')

      this.refreshing = true

      try {
        // 同时刷新轮播图、配置和圈子动态
        await Promise.all([
          this.loadBanners(),
          this.loadConfigs(),
          this.loadForumPosts()
        ])

        uni.showToast({
          title: '刷新成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('刷新失败:', error)
        uni.showToast({
          title: '刷新失败',
          icon: 'none'
        })
      } finally {
        // 延迟重置刷新状态，确保动画完成
        setTimeout(() => {
          this.refreshing = false
        }, 500)
      }
    },

    // 轮播图点击事件
    onBannerClick(banner) {
      if (banner.content) {
        // 根据content类型执行不同操作
        if (banner.content === 'join_rider') {
          // 跳转到骑手认证页面
          uni.navigateTo({
            url: '/pages/rider/auth'
          })
        } else {
          uni.showToast({
            title: banner.title,
            icon: 'none'
          })
        }
      } else {
        uni.showToast({
          title: banner.title,
          icon: 'none'
        })
      }
    },

    // 跳转到发布订单页面
    navigateToPublish(type) {
      // 将类型转换为服务类型ID
      const typeMap = {
        'buy': 1,    // 帮买
        'send': 2,   // 帮送
        'fetch': 3,  // 帮取
        'all': 4     // 全能
      };

      const serviceType = typeMap[type] || 1;

      uni.navigateTo({
        url: `/pages/order/create?serviceType=${serviceType}`
      });
    },

    // 跳转到订单列表
    goToOrders() {
      uni.switchTab({
        url: '/pages/orders/orders'
      });
    },

    // 跳转到订单详情
    goToOrderDetail(orderId) {
      uni.showToast({
        title: '订单详情功能开发中...',
        icon: 'none'
      });
      // TODO: 跳转到订单详情页面
      // uni.navigateTo({
      //   url: `/pages/order/detail?id=${orderId}`
      // });
    },

    // 加载圈子动态
    async loadForumPosts() {
      try {
        const res = await getPostList({
          page: 1,
          size: 3,
          orderBy: 'createTime,desc'
        })
        console.log('🔍 首页圈子响应:', res)
        if (res.code === 200) {
           let list = []
           if (res.data) {
              if (Array.isArray(res.data)) {
                  list = res.data
              } else if (Array.isArray(res.data.records)) {
                  list = res.data.records
              }
           }
            // 数据预处理：解析图片 JSON 字符串
            list = list.map(item => {
              if (item.images && typeof item.images === 'string') {
                try {
                  item.images = JSON.parse(item.images)
                } catch (e) {
                  console.error('首页解析图片失败:', e)
                  item.images = []
                }
              }
              return item
            })
          this.forumPosts = list
          console.log('✅ 首页圈子加载成功:', this.forumPosts.length)
        }
      } catch (error) {
        console.error('❌ 加载首页圈子失败:', error)
      }
    },

    // 跳转到圈子列表
    goToForum() {
      uni.navigateTo({
        url: '/pages/forum/index'
      })
    },

    // 跳转到帖子详情
    goToPostDetail(postId) {
      uni.navigateTo({
        url: `/pages/forum/detail?id=${postId}`
      })
    },

    // 点赞处理
    async onPostLike(postId) {
      try {
        const res = await likePost(postId)
        if (res.code === 200) {
          // 适配文档中的返回结果：data.liked, data.likeCount
          const index = this.forumPosts.findIndex(p => p.id === postId)
          if (index !== -1) {
            const post = this.forumPosts[index]
            post.liked = res.data.liked
            post.likeCount = res.data.likeCount
            this.forumPosts[index] = post
          }
        }
      } catch (error) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    // 获取用户定位 (改用百度高精度 SDK)
    async getUserLocation() {
      console.log('=== 开始获取用户地理位置 (百度 SDK) ===')
      this.locationText = '正在定位...'
      
      try {
        const res = await getBaiduLocation()
        console.log('📍 百度定位获取成功:', res)
        
        // 保存经纬度到组件状态，供后续计费等逻辑使用
        this.latitude = res.latitude
        this.longitude = res.longitude
        this.locationText = res.displayName || res.address
        
        console.log(`📌 位置已同步到状态: Lat=${this.latitude}, Lon=${this.longitude}`)
        
      } catch (err) {
        console.error('❌ 获取经纬度失败:', err)
        this.locationText = '定位失败'
        uni.showToast({
          title: '定位失败，请检查GPS权限或AK设置',
          icon: 'none'
        })
      }
    },

    // 逆地理编码：经纬度转地址 (通过后端代理)
    async getLocationName(latitude, longitude) {
      try {
        const res = await get('/common/reverse-geocode', {
          lat: latitude,
          lon: longitude
        })
        if (res.code === 200) {
          this.locationText = res.data || '位置获取成功'
          console.log('后端逆地理编码成功:', this.locationText)
        } else {
          this.locationText = '解析地址失败'
        }
      } catch (error) {
        console.error('请求后端定位接口异常:', error)
        this.locationText = '定位解析失败'
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.index-container {
  min-height: 100vh;
  background-color: #f8fcf9;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 640rpx;
    background: $forum-primary-gradient;
    border-radius: 0 0 80rpx 80rpx;
    z-index: 0;
  }
}

.status-bar {
  height: var(--status-bar-height);
  background: transparent;
  position: relative;
  z-index: 10;
}

.page-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
  z-index: 10;
  
  .page-title {
    font-size: 38rpx;
    font-weight: 800;
    color: #fff;
    letter-spacing: 2rpx;
    text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  }
}

.scroll-container {
  height: 100vh;
  position: relative;
  z-index: 1;
}

/* 定位栏 */
.location-bar {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  background: transparent;
  
  .location-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }

  .location-text {
    flex: 1;
    font-size: 30rpx;
    color: #fff;
    font-weight: 600;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  }
}

/* 轮播图 */
.banner-section {
  padding: 0 30rpx 20rpx;
}

.banner-swiper {
  height: 320rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.15);
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;
}

.banner-text {
  color: #fff;
  font-size: 44rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
  text-align: center;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  text-align: center;
  background: rgba(0,0,0,0.1);
  padding: 4rpx 24rpx;
  border-radius: 20rpx;
}

/* 金刚区 */
.nav-grid {
  display: flex;
  background: #fff;
  padding: 40rpx 10rpx;
  margin: 20rpx 30rpx 30rpx;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.08);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:active { transform: scale(0.95); }
}

.nav-icon {
  width: 110rpx;
  height: 110rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 54rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.nav-icon-1 { background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%); }
.nav-icon-2 { background: linear-gradient(135deg, #e6f7ef 0%, #c4ebd1 100%); }
.nav-icon-3 { background: linear-gradient(135deg, #fff5e6 0%, #ffe0b3 100%); }
.nav-icon-4 { background: linear-gradient(135deg, #ebf4ff 0%, #d1e6ff 100%); }

.nav-label {
  font-size: 28rpx;
  color: $forum-text-main;
  font-weight: 600;
}

/* 发布卡片 */
.publish-card {
  margin: 0 30rpx 40rpx;
  background: $forum-primary-gradient;
  border-radius: 32rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16rpx 40rpx rgba(7, 193, 96, 0.3);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '🚀';
    position: absolute;
    right: -20rpx;
    bottom: -20rpx;
    font-size: 160rpx;
    opacity: 0.1;
    transform: rotate(-15deg);
  }
}

.publish-header {
  flex: 1;
}

.publish-title {
  display: block;
  color: #fff;
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 12rpx;
}

.publish-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
}

.publish-btn {
  background: #fff;
  padding: 18rpx 36rpx;
  border-radius: 40rpx;
  color: $forum-primary;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.1);
  
  &:active { opacity: 0.8; transform: scale(0.95); }
}

.btn-arrow {
  font-size: 32rpx;
  margin-left: 8rpx;
  font-weight: bold;
}

/* 最近订单 */
.recent-orders {
  margin: 0 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #07c160;
}

.order-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-item {
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-type {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.order-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.status-0 {
  background: #fff7e6;
  color: #fa8c16;
}

.status-1 {
  background: #e6f7ff;
  color: #1890ff;
}

.status-2 {
  background: #f6ffed;
  color: #52c41a;
}

.status-3 {
  background: #f5f5f5;
  color: #999;
}

.order-content {
  margin-bottom: 16rpx;
}

.order-address {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
}

.order-price {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: bold;
}

/* 空状态 */
.empty-tips {
  margin: 100rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 计费规则入口 */
.billing-rules-link {
  padding: 0 30rpx 40rpx;
  text-align: center;
  color: $forum-text-light;
  font-size: 24rpx;
  text-decoration: underline;
}

/* 校园圈子 */
.forum-section {
  padding: 50rpx 30rpx;
  background-color: #fff;
  border-radius: 60rpx 60rpx 0 0;
  margin-top: 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 -12rpx 32rpx rgba(0,0,0,0.02);
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40rpx;
  padding: 0 10rpx;
}

.section-header-modern .left {
  display: flex;
  flex-direction: column;
}

.section-header-modern .left .title {
  font-size: 42rpx;
  font-weight: 800;
  color: $forum-text-main;
}

.section-header-modern .left .subtitle {
  font-size: 26rpx;
  color: $forum-text-light;
  margin-top: 8rpx;
}

.section-header-modern .more-btn {
  font-size: 26rpx;
  color: $forum-primary;
  font-weight: 700;
  padding: 12rpx 32rpx;
  background: $forum-primary-light;
  border-radius: 32rpx;
  transition: all 0.2s;
  
  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.empty-forum {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
}

.empty-forum .empty-img {
  width: 240rpx;
  height: 180rpx;
  margin-bottom: 30rpx;
}

.empty-forum text {
  color: #999;
  font-size: 28rpx;
}

/* 配置弹窗 */
.config-modal {
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
  z-index: 1000;
}

.modal-content {
  width: 620rpx;
  max-height: 900rpx;
  background: #fff;
  border-radius: 48rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: $forum-glass-shadow;
}

.modal-header {
  padding: 40rpx;
  border-bottom: 1rpx solid #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 38rpx;
  font-weight: 800;
  color: $forum-text-main;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.info-icon {
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.info-icon:active {
  transform: scale(0.9);
}

.info-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
  font-style: italic;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

/* 配置说明区域 */
.config-info {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 30rpx;
  border-bottom: 2rpx solid #e0e0e0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000rpx;
    opacity: 1;
  }
}

.info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-item {
  margin-bottom: 24rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.info-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  padding-left: 16rpx;
}

.modal-body {
  flex: 1;
  padding: 20rpx;
  max-height: 600rpx;
}

.config-list {
  background: #f8f8f8;
  border-radius: 16rpx;
  overflow: hidden;
}

.config-list-item {
  background: #fff;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
  display: flex;
  align-items: center;
}

.config-list-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-size: 28rpx;
  color: #666;
}

.item-value {
  font-size: 32rpx;
  color: $forum-primary;
  font-weight: bold;
}

.modal-footer {
  padding: 20rpx 30rpx;
  border-top: 2rpx solid #f5f5f5;
}

.modal-btn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: $forum-primary-gradient;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.2);
}

.modal-btn::after {
  border: none;
}
</style>
