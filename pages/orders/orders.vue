<template>
  <view class="orders-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-title">我的订单</view>
    </view>

    <!-- 订单状态标签 -->
    <view class="tabs-wrapper">
      <view class="tabs-list">
        <view
          class="tab-item"
          :class="{ active: activeTab === item.value }"
          v-for="item in statusTabs"
          :key="item.value"
          @click="switchTab(item.value)"
        >
          <text class="tab-text">{{ item.label }}</text>
          <view class="tab-badge" v-if="item.count > 0">{{ item.count }}</view>
        </view>
      </view>
    </view>

    <!-- 订单列表内容 -->
    <scroll-view
      class="orders-scroll"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 订单列表 -->
      <view class="order-list">
        <view
          class="order-card"
          v-for="order in orderList"
          :key="order.id"
          @click="goToDetail(order.id)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-no">订单号：{{ order.orderNo }}</view>
            <view class="order-status" :class="'status-' + order.status">
              {{ order.statusDesc }}
            </view>
          </view>

          <!-- 订单内容 -->
          <view class="order-content">
            <view class="service-type">
              <text class="type-icon">{{ getTypeIcon(order.type) }}</text>
              <text class="type-name">{{ getTypeName(order.type) }}</text>
            </view>

            <view class="goods-info">
              <text class="goods-label">物品：</text>
              <text class="goods-text">{{ order.goodsDesc }}</text>
            </view>

            <view class="address-info">
              <view class="address-item">
                <text class="address-label">取</text>
                <text class="address-text">{{ order.pickupAddr }}</text>
              </view>
              <view class="address-item">
                <text class="address-label">送</text>
                <text class="address-text">{{ order.deliveryAddr }}</text>
              </view>
            </view>

            <view class="order-footer">
              <view class="order-time">
                <text>{{ formatTime(order.createTime) }}</text>
              </view>
              <view class="order-amount">
                <text class="amount-label">订单金额：</text>
                <text class="amount-value">¥{{ order.totalFee }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="order-actions">
            <!-- 待支付 -->
            <template v-if="order.status === 0">
              <button class="btn-action btn-cancel" @click.stop="cancelOrder(order.id)">取消订单</button>
              <button class="btn-action btn-primary" @click.stop="goToPay(order.id, order.totalFee)">去支付</button>
            </template>

            <!-- 待接单 -->
            <template v-if="order.status === 1">
              <button class="btn-action btn-cancel" @click.stop="cancelOrder(order.id)">取消订单</button>
            </template>

            <!-- 进行中 -->
            <template v-if="order.status === 2 || order.status === 3">
              <button class="btn-action btn-primary" @click.stop="contactRider(order)">联系骑手</button>
            </template>

            <!-- 待评价 -->
            <template v-if="order.status === 4">
              <button class="btn-action btn-primary" @click.stop="evaluateOrder(order.id)">评价订单</button>
            </template>

            <!-- 已完成 -->
            <template v-if="order.status === 5">
              <button class="btn-action btn-default" @click.stop="deleteOrder(order.id)">删除订单</button>
            </template>

            <!-- 已取消 -->
            <template v-if="order.status === 6">
              <button class="btn-action btn-default" @click.stop="deleteOrder(order.id)">删除订单</button>
            </template>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="orderList.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="hasMore">上拉加载更多</text>
        <text v-else>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="orderList.length === 0 && !loading">
        <text class="empty-icon">📦</text>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">快去发布第一个订单吧~</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrderList, cancelOrder } from '@/api/order.js'

export default {
  data() {
    return {
      // 状态标签（与后端OrderStatusEnum保持一致）
      statusTabs: [
        { label: '全部', value: null, count: 0 },
        { label: '待支付', value: 0, count: 0 },
        { label: '待接单', value: 1, count: 0 },
        { label: '配送中', value: 2, count: 0 },
        { label: '已完成', value: 3, count: 0 },
        { label: '已取消', value: 4, count: 0 }
      ],

      activeTab: null, // 当前激活的标签
      orderList: [], // 订单列表
      loading: false, // 加载状态
      refreshing: false, // 刷新状态
      hasMore: true, // 是否有更多数据

      // 分页参数
      page: 1,
      size: 10
    }
  },

  onLoad(options) {
    // 如果从其他页面跳转过来，带有状态参数
    if (options.status !== undefined) {
      this.activeTab = Number(options.status)
    }

    // 加载订单列表
    this.loadOrderList()
  },

  onShow() {
    // 从订单详情或支付页返回时刷新列表
    this.refreshList()
  },

  methods: {
    /**
     * 切换标签
     */
    switchTab(status) {
      this.activeTab = status
      this.page = 1
      this.orderList = []
      this.hasMore = true
      this.loadOrderList()
    },

    /**
     * 加载订单列表
     */
    async loadOrderList() {
      if (this.loading) return

      try {
        this.loading = true
        console.log('📥 开始加载订单列表')
        console.log('   - 页码:', this.page)
        console.log('   - 每页数量:', this.size)
        console.log('   - 状态筛选:', this.activeTab)

        const params = {
          page: this.page,
          size: this.size
        }

        // 如果选择了特定状态，添加状态参数
        if (this.activeTab !== null) {
          params.status = this.activeTab
        }

        console.log('   - 请求参数:', JSON.stringify(params))

        const res = await getOrderList(params)

        console.log('📥 订单列表API响应:')
        console.log('   - 响应码:', res.code)
        console.log('   - 响应消息:', res.message)
        console.log('   - 响应数据:', JSON.stringify(res.data, null, 2))

        if (res.code === 200 && res.data) {
          const newList = res.data.records || []

          console.log('📊 解析订单列表:')
          console.log('   - 记录总数:', res.data.total)
          console.log('   - 当前页记录数:', newList.length)
          console.log('   - 记录详情:', JSON.stringify(newList, null, 2))

          if (this.page === 1) {
            this.orderList = newList
          } else {
            this.orderList = [...this.orderList, ...newList]
          }

          // 判断是否还有更多数据
          this.hasMore = newList.length >= this.size

          console.log('✅ 订单列表加载成功，当前列表共', this.orderList.length, '条')
        } else {
          console.error('❌ API返回错误:', res.code, res.message)
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('❌ 加载订单列表异常:', error)
        console.error('   - 错误信息:', error.message)
        console.error('   - 错误堆栈:', error.stack)
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
        this.refreshing = false
        console.log('🔄 加载状态已重置')
      }
    },

    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true
      this.page = 1
      await this.loadOrderList()
    },

    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1
      this.loadOrderList()
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading) return

      this.page++
      this.loadOrderList()
    },

    /**
     * 跳转到订单详情
     */
    goToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      })
    },

    /**
     * 跳转到支付页面
     */
    goToPay(orderId, totalFee) {
      uni.navigateTo({
        url: `/pages/order/payment?orderId=${orderId}&totalAmount=${totalFee}`
      })
    },

    /**
     * 取消订单
     */
    cancelOrder(orderId) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '取消中...' })

              const cancelRes = await cancelOrder({
                orderId: orderId,
                cancelReason: '用户主动取消'
              })

              uni.hideLoading()

              if (cancelRes.code === 200) {
                uni.showToast({
                  title: '订单已取消',
                  icon: 'success'
                })
                // 刷新列表
                this.refreshList()
              } else {
                uni.showToast({
                  title: cancelRes.message || '取消失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('❌ 取消订单失败:', error)
              uni.showToast({
                title: '取消失败，请稍后重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 删除订单
     */
    deleteOrder(orderId) {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用删除订单接口
            uni.showToast({
              title: '功能开发中',
              icon: 'none'
            })
          }
        }
      })
    },

    /**
     * 联系骑手
     */
    contactRider(order) {
      // TODO: 实现联系骑手功能
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 评价订单
     */
    evaluateOrder(orderId) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 获取服务类型图标
     */
    getTypeIcon(type) {
      const icons = {
        1: '🛒',
        2: '📦',
        3: '🔑',
        4: '🌟'
      }
      return icons[type] || '📦'
    },

    /**
     * 获取服务类型名称
     */
    getTypeName(type) {
      const names = {
        1: '帮我买',
        2: '帮我送',
        3: '帮我取',
        4: '全能'
      }
      return names[type] || '未知'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''

      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      // 小于1分钟
      if (diff < 60000) {
        return '刚刚'
      }

      // 小于1小时
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      }

      // 小于1天
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      }

      // 大于1天，显示具体日期
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')

      return `${year}-${month}-${day} ${hour}:${minute}`
    }
  }
}
</script>

<style lang="scss" scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

/* 标签栏 */
.tabs-wrapper {
  background-color: #fff;
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  z-index: 99;
  border-bottom: 1px solid #eee;
}

.tabs-list {
  display: flex;
  padding: 0 15px;
}

.tab-item {
  position: relative;
  padding: 12px 16px;
  margin-right: 8px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.tab-item.active {
  color: #667eea;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #667eea;
  border-radius: 2px;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动区域 */
.orders-scroll {
  flex: 1;
  margin-top: 98px;
  height: calc(100vh - 98px);
}

/* 订单列表 */
.order-list {
  padding: 10px 15px;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 订单头部 */
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  font-size: 13px;
  color: #999;
}

.order-status {
  font-size: 13px;
  font-weight: 600;
}

.order-status.status-0 {
  color: #ff9800;
}

.order-status.status-1 {
  color: #2196f3;
}

.order-status.status-2 {
  color: #9c27b0;
}

.order-status.status-3 {
  color: #4caf50;
}

.order-status.status-4 {
  color: #ff5722;
}

.order-status.status-5 {
  color: #999;
}

.order-status.status-6 {
  color: #999;
}

/* 订单内容 */
.order-content {
  padding: 15px;
}

.service-type {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.type-icon {
  font-size: 20px;
  margin-right: 8px;
}

.type-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.goods-info {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.goods-label {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

.goods-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  flex: 1;
}

.address-info {
  margin-bottom: 12px;
}

.address-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.address-item:last-child {
  margin-bottom: 0;
}

.address-label {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #667eea;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.address-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-amount {
  display: flex;
  align-items: baseline;
}

.amount-label {
  font-size: 12px;
  color: #999;
}

.amount-value {
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 4px;
}

/* 操作按钮 */
.order-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 15px;
  background-color: #fafafa;
  border-top: 1px solid #f5f5f5;
  gap: 10px;
}

.btn-action {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 4px;
  border: none;
  line-height: 1.8;
}

.btn-default {
  background-color: #f5f5f5;
  color: #666;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-cancel {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

/* 加载更多 */
.load-more {
  padding: 15px;
  text-align: center;
  font-size: 13px;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 13px;
  color: #999;
}
</style>
