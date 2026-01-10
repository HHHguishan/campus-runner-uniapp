<template>
  <view class="admin-order-list">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">订单管理</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 筛选条件区域 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">订单状态</text>
          <picker mode="selector" :range="statusOptions" range-key="label"
                  :value="statusIndex" @change="onStatusChange">
            <view class="picker-value">
              {{ statusOptions[statusIndex].label }}
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="filter-item">
          <text class="filter-label">订单类型</text>
          <picker mode="selector" :range="typeOptions" range-key="label"
                  :value="typeIndex" @change="onTypeChange">
            <view class="picker-value">
              {{ typeOptions[typeIndex].label }}
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">异常类型</text>
          <picker mode="selector" :range="abnormalOptions" range-key="label"
                  :value="abnormalIndex" @change="onAbnormalChange">
            <view class="picker-value">
              {{ abnormalOptions[abnormalIndex].label }}
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="filter-row">
        <view class="filter-item full-width">
          <text class="filter-label">时间范围</text>
          <view class="date-picker-group">
            <picker mode="date" :value="startTime" @change="onStartTimeChange">
              <view class="date-picker">
                {{ startTime || '开始日期' }}
              </view>
            </picker>
            <text class="date-separator">至</text>
            <picker mode="date" :value="endTime" @change="onEndTimeChange">
              <view class="date-picker">
                {{ endTime || '结束日期' }}
              </view>
            </picker>
          </view>
        </view>
      </view>

      <view class="filter-row search-row">
        <view class="search-box">
          <input class="search-input" v-model="keyword"
                 placeholder="搜索订单号/用户/骑手/商品" />
          <button class="search-btn" @click="handleSearch">搜索</button>
        </view>
        <button class="reset-btn" @click="handleReset">重置</button>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list-section">
      <view class="section-header">
        <text class="section-title">订单列表</text>
        <text class="section-count">共 {{ total }} 条</text>
      </view>

      <view class="order-list" v-if="orderList.length > 0">
        <view v-for="order in orderList" :key="order.id"
              class="order-item"
              @click="goToDetail(order.id)">
          <!-- 订单头部 -->
          <view class="order-header">
            <text class="order-no">订单号：{{ order.orderNo }}</text>
            <view class="order-status-badge"
                  :class="'status-' + order.status">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <!-- 订单内容 -->
          <view class="order-content">
            <view class="content-row">
              <text class="label">服务类型：</text>
              <text class="value">{{ getOrderTypeText(order.type) }}</text>
            </view>
            <view class="content-row">
              <text class="label">商品描述：</text>
              <text class="value">{{ order.goodsDesc }}</text>
            </view>
            <view class="content-row">
              <text class="label">用户信息：</text>
              <text class="value">{{ order.userNickname }}</text>
            </view>
            <view class="content-row" v-if="order.runnerNickname">
              <text class="label">骑手信息：</text>
              <text class="value">{{ order.runnerNickname }}</text>
            </view>
            <view class="content-row">
              <text class="label">创建时间：</text>
              <text class="value">{{ formatTime(order.createTime) }}</text>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="order-footer">
            <view class="order-amount">
              <text class="amount-label">订单金额：</text>
              <text class="amount-value">¥{{ order.totalFee }}</text>
            </view>
            <view class="order-action">
              <text class="action-text">查看详情 ›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单数据</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="orderList.length > 0 && hasMore">
        <text class="load-more-text">{{ loading ? '加载中...' : '上拉加载更多' }}</text>
      </view>

      <view class="no-more" v-if="orderList.length > 0 && !hasMore">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getAdminOrderList } from '@/api/admin.js'

export default {
  data() {
    return {
      // 筛选条件
      statusOptions: [
        { label: '全部状态', value: null },
        { label: '待支付', value: 0 },
        { label: '待接单', value: 1 },
        { label: '配送中', value: 2 },
        { label: '已完成', value: 3 },
        { label: '已取消', value: 4 },
        { label: '退款中', value: 5 }
      ],
      statusIndex: 0,
      statusValue: null,

      typeOptions: [
        { label: '全部类型', value: '' },
        { label: '帮买', value: 'buy' },
        { label: '帮送', value: 'send' },
        { label: '帮取', value: 'pick' },
        { label: '全能', value: 'all' }
      ],
      typeIndex: 0,
      typeValue: '',

      abnormalOptions: [
        { label: '全部订单', value: '' },
        { label: '超时未接单', value: 'timeout_not_taken' },
        { label: '配送超时', value: 'timeout_delivery' },
        { label: '支付异常', value: 'abnormal_payment' }
      ],
      abnormalIndex: 0,
      abnormalValue: '',

      startTime: '',
      endTime: '',
      keyword: '',

      // 订单列表
      orderList: [],
      total: 0,
      current: 1,
      size: 10,
      loading: false,
      hasMore: true
    }
  },

  onLoad() {
    // 加载订单列表
    this.loadOrderList()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.current = 1
    this.loadOrderList(() => {
      uni.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.current++
      this.loadOrderList()
    }
  },

  methods: {
    /**
     * 加载订单列表
     */
    async loadOrderList(callback) {
      if (this.loading) return

      try {
        this.loading = true

        const params = {
          status: this.statusValue,
          orderType: this.typeValue,
          abnormalType: this.abnormalValue,
          startTime: this.startTime,
          endTime: this.endTime,
          keyword: this.keyword,
          current: this.current,
          size: this.size
        }

        console.log('📋 查询订单列表，参数：', params)

        const res = await getAdminOrderList(params)
        console.log('📋 订单列表响应：', res)

        if (res.code === 200) {
          const { records, total } = res.data

          if (this.current === 1) {
            this.orderList = records
          } else {
            this.orderList = [...this.orderList, ...records]
          }

          this.total = total
          this.hasMore = this.orderList.length < total
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('❌ 加载订单列表失败：', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        callback && callback()
      }
    },

    /**
     * 搜索
     */
    handleSearch() {
      this.current = 1
      this.loadOrderList()
    },

    /**
     * 重置筛选条件
     */
    handleReset() {
      this.statusIndex = 0
      this.statusValue = null
      this.typeIndex = 0
      this.typeValue = ''
      this.abnormalIndex = 0
      this.abnormalValue = ''
      this.startTime = ''
      this.endTime = ''
      this.keyword = ''
      this.current = 1
      this.loadOrderList()
    },

    /**
     * 订单状态变更
     */
    onStatusChange(e) {
      this.statusIndex = e.detail.value
      this.statusValue = this.statusOptions[e.detail.value].value
    },

    /**
     * 订单类型变更
     */
    onTypeChange(e) {
      this.typeIndex = e.detail.value
      this.typeValue = this.typeOptions[e.detail.value].value
    },

    /**
     * 异常类型变更
     */
    onAbnormalChange(e) {
      this.abnormalIndex = e.detail.value
      this.abnormalValue = this.abnormalOptions[e.detail.value].value
    },

    /**
     * 开始时间变更
     */
    onStartTimeChange(e) {
      this.startTime = e.detail.value
    },

    /**
     * 结束时间变更
     */
    onEndTimeChange(e) {
      this.endTime = e.detail.value
    },

    /**
     * 跳转到订单详情
     */
    goToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/admin/order-detail?id=${orderId}`
      })
    },

    /**
     * 获取订单状态文本
     */
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '待接单',
        2: '配送中',
        3: '已完成',
        4: '已取消',
        5: '退款中'
      }
      return statusMap[status] || '未知'
    },

    /**
     * 获取订单类型文本
     */
    getOrderTypeText(type) {
      const typeMap = {
        'buy': '帮买',
        'send': '帮送',
        'pick': '帮取',
        'all': '全能'
      }
      return typeMap[type] || type
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hour}:${minute}`
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-order-list {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 40px;
}

/* 筛选条件区域 */
.filter-section {
  margin-top: 54px;
  background-color: #fff;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.filter-row {
  display: flex;
  margin-bottom: 12px;
  gap: 10px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item.full-width {
  flex: none;
  width: 100%;
}

.filter-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
}

.arrow {
  font-size: 12px;
  color: #999;
}

.date-picker-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-picker {
  flex: 1;
  padding: 10px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  text-align: center;
}

.date-separator {
  font-size: 14px;
  color: #999;
}

.search-row {
  flex-direction: column;
  gap: 10px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  border-radius: 6px;
  border: none;
}

.reset-btn {
  padding: 10px 20px;
  background-color: #f5f7fa;
  color: #666;
  font-size: 14px;
  border-radius: 6px;
  border: none;
}

/* 订单列表区域 */
.order-list-section {
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-count {
  font-size: 13px;
  color: #999;
}

.order-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 12px;
}

.order-no {
  font-size: 13px;
  color: #666;
}

.order-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-0 {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-1 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-2 {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.status-3 {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-4 {
  background-color: #ffebee;
  color: #d32f2f;
}

.status-5 {
  background-color: #fff3e0;
  color: #f57c00;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.content-row {
  display: flex;
  font-size: 14px;
}

.label {
  color: #666;
  min-width: 80px;
}

.value {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.order-amount {
  display: flex;
  align-items: baseline;
}

.amount-label {
  font-size: 13px;
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 4px;
}

.order-action {
  font-size: 14px;
  color: #667eea;
}

.action-text {
  color: #667eea;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 加载更多 */
.load-more,
.no-more {
  padding: 20px 0;
  text-align: center;
}

.load-more-text,
.no-more-text {
  font-size: 13px;
  color: #999;
}
</style>
