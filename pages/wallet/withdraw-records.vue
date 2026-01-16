<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">提现记录</view>
      <view class="nav-placeholder"></view>
    </view>

    <view class="record-list" v-if="records.length > 0">
      <view class="record-card" v-for="item in records" :key="item.id">
        <view class="card-header">
          <view class="type-info">
            <text class="type-icon">{{ getIcon(item.accountType) }}</text>
            <text class="type-name">{{ getTypeName(item.accountType) }} 提现</text>
          </view>
          <view class="status" :class="'status-' + item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>

        <view class="card-body">
          <view class="amount-row">
            <text class="label">提现金额</text>
            <text class="amount">-¥{{ item.amount.toFixed(2) }}</text>
          </view>
          <view class="info-row">
            <text class="label">收款账号</text>
            <text class="value">{{ item.accountNo }} ({{ item.realName }})</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间</text>
            <text class="value">{{ formatDate(item.createTime) }}</text>
          </view>
          <view class="info-row reject-reason" v-if="item.status === 2">
            <text class="label">驳回原因</text>
            <text class="value">{{ item.auditMsg || '账号异常' }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more">
        <text v-if="hasMore" @tap="loadRecords">点击加载更多</text>
        <text v-else>没有更多了</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image src="/static/empty_data.png" mode="aspectFit" class="empty-img"></image>
      <text class="empty-text">暂无提现记录</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      records: [],
      hasMore: false,
      loading: false
    }
  },
  onLoad() {
    this.loadRecords(true)
  },
  onPullDownRefresh() {
    this.loadRecords(true)
  },
  methods: {
    async loadRecords(reset = false) {
      if (this.loading) return
      if (reset) {
        this.pageNum = 1
        this.records = []
      }
      
      this.loading = true
      try {
        const res = await this.$request({
          url: '/withdraw/list',
          params: {
            pageNum: this.pageNum,
            pageSize: this.pageSize
          }
        })
        if (res.code === 200) {
          const list = res.data.records
          this.records = this.records.concat(list)
          this.hasMore = list.length === this.pageSize
          this.pageNum++
        }
      } catch (e) {
        console.error('加载提现记录失败', e)
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },
    goBack() {
      uni.navigateBack()
    },
    getTypeName(type) {
      const map = { alipay: '支付宝', wechat: '微信', bank: '银行卡' }
      return map[type] || '其他'
    },
    getIcon(type) {
      const map = { alipay: '💙', wechat: '💚', bank: '💳' }
      return map[type] || '💰'
    },
    getStatusText(status) {
      const map = { 0: '审核中', 1: '已打款', 2: '已驳回' }
      return map[status]
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return dateStr.replace('T', ' ').substring(0, 16)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20rpx;
  padding-top: calc(var(--status-bar-height) + 110rpx);
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  padding-top: var(--status-bar-height);
  background: white; /* 记录页使用白色背景，黑色文字 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1rpx solid #eee;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #333;
  font-weight: 300;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
}

.record-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 24rpx;

  .type-info {
    display: flex;
    align-items: center;
    .type-icon { font-size: 32rpx; margin-right: 12rpx; }
    .type-name { font-size: 30rpx; font-weight: 600; color: #333; }
  }

  .status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
  }
  .status-0 { background-color: #fff7e6; color: #fa8c16; } // 审核中
  .status-1 { background-color: #f6ffed; color: #52c41a; } // 已打款
  .status-2 { background-color: #fff1f0; color: #f5222d; } // 已驳回
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  .label { color: #999; font-size: 28rpx; }
  .amount { font-size: 36rpx; font-weight: bold; color: #333; }
}

.info-row {
  display: flex;
  margin-bottom: 12rpx;
  font-size: 26rpx;
  .label { color: #999; width: 140rpx; flex-shrink: 0; }
  .value { color: #666; flex: 1; }
}

.reject-reason {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx dashed #eee;
  .value { color: #f5222d; }
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  .empty-img { width: 240rpx; height: 240rpx; margin-bottom: 30rpx; }
  .empty-text { font-size: 28rpx; color: #999; }
}
</style>
