<template>
  <view class="wallet-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">我的钱包</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 钱包卡片 -->
    <view class="wallet-card">
      <view class="card-header">
        <text class="card-title">账户余额</text>
        <text class="card-unit">元</text>
      </view>
      <view class="card-balance">
        <text class="balance-integer">{{ balanceInteger }}</text>
        <text class="balance-decimal">.{{ balanceDecimal }}</text>
      </view>
      <view class="card-actions">
        <button class="btn-recharge" @click="goToRecharge">
          <text class="btn-icon">💰</text>
          <text>充值</text>
        </button>
        <button class="btn-withdraw" @click="handleWithdraw">
          <text class="btn-icon">💸</text>
          <text>提现</text>
        </button>
      </view>
    </view>

    <!-- 快捷充值 -->
    <view class="quick-recharge-section">
      <view class="section-title">快捷充值</view>
      <view class="amount-grid">
        <view
          class="amount-item"
          v-for="amount in quickAmounts"
          :key="amount"
          @click="quickRecharge(amount)"
        >
          <text class="amount-value">{{ amount }}</text>
          <text class="amount-unit">元</text>
        </view>
      </view>
    </view>

    <!-- 交易记录 -->
    <view class="transactions-section">
      <view class="section-header">
        <text class="section-title">资金流水</text>
        <text class="section-more" @click="loadMore">查看全部 ›</text>
      </view>

      <!-- 交易列表 -->
      <scroll-view
        scroll-y
        class="transactions-list"
        @scrolltolower="loadMore"
        v-if="transactions.length > 0"
      >
        <view
          class="transaction-item"
          v-for="item in transactions"
          :key="item.id"
        >
          <view class="transaction-icon">
            <text>{{ getTransactionIcon(item.type) }}</text>
          </view>
          <view class="transaction-info">
            <text class="transaction-title">{{ item.typeName }}</text>
            <text class="transaction-time">{{ formatTime(item.createTime) }}</text>
          </view>
          <view class="transaction-amount" :class="getAmountClass(item.type)">
            <text>{{ getAmountPrefix(item.type) }}{{ item.amount }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="transactions.length === 0 && !loading">
        <text class="empty-icon">💳</text>
        <text class="empty-text">暂无交易记录</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getWalletBalance, getTransactions, recharge } from '@/api/wallet.js'

export default {
  data() {
    return {
      balance: 0, // 余额
      transactions: [], // 交易记录
      loading: false,
      quickAmounts: [10, 50, 100, 200, 500, 1000], // 快捷充值金额
      page: 1,
      size: 10,
      hasMore: true
    }
  },

  computed: {
    // 余额整数部分
    balanceInteger() {
      return Math.floor(this.balance).toString()
    },
    // 余额小数部分
    balanceDecimal() {
      const decimal = (this.balance % 1).toFixed(2)
      return decimal.substring(2) // 去掉"0."
    }
  },

  onLoad() {
    this.loadWalletBalance()
    this.loadTransactions()
  },

  onShow() {
    // 从充值页返回时刷新余额
    this.loadWalletBalance()
  },

  onPullDownRefresh() {
    this.page = 1
    this.hasMore = true
    Promise.all([this.loadWalletBalance(), this.loadTransactions()]).then(() => {
      uni.stopPullDownRefresh()
    })
  },

  methods: {
    /**
     * 加载钱包余额
     */
    async loadWalletBalance() {
      try {
        const res = await getWalletBalance()

        if (res.code === 200) {
          this.balance = res.data || 0
          console.log('✅ 钱包余额:', this.balance)
        }
      } catch (error) {
        console.error('❌ 获取余额失败:', error)
      }
    },

    /**
     * 加载交易记录
     */
    async loadTransactions() {
      if (this.loading || !this.hasMore) return

      try {
        this.loading = true

        const res = await getTransactions({
          page: this.page,
          size: this.size
        })

        if (res.code === 200) {
          const records = res.data.records || []

          if (this.page === 1) {
            this.transactions = records
          } else {
            this.transactions = [...this.transactions, ...records]
          }

          // 判断是否还有更多数据
          this.hasMore = records.length >= this.size
          this.page++

          console.log('✅ 交易记录:', this.transactions)
        }
      } catch (error) {
        console.error('❌ 获取交易记录失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (this.hasMore) {
        this.loadTransactions()
      } else {
        uni.showToast({
          title: '没有更多数据了',
          icon: 'none'
        })
      }
    },

    /**
     * 跳转到充值页面
     */
    goToRecharge() {
      uni.navigateTo({
        url: '/pages/wallet/recharge'
      })
    },

    /**
     * 快捷充值
     */
    quickRecharge(amount) {
      uni.showModal({
        title: '确认充值',
        content: `确定要充值 ${amount} 元吗？`,
        success: (res) => {
          if (res.confirm) {
            this.doRecharge(amount)
          }
        }
      })
    },

    /**
     * 执行充值
     */
    async doRecharge(amount) {
      try {
        uni.showLoading({ title: '充值中...' })

        const res = await recharge({ amount })

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({
            title: '充值成功',
            icon: 'success'
          })

          // 刷新余额和交易记录
          await this.loadWalletBalance()
          this.page = 1
          await this.loadTransactions()
        } else {
          uni.showToast({
            title: res.message || '充值失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 充值失败:', error)
        uni.showToast({
          title: '充值失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    /**
     * 提现功能（开发中）
     */
    handleWithdraw() {
      uni.showModal({
        title: '提示',
        content: '提现功能开发中，敬请期待',
        showCancel: false
      })
    },

    /**
     * 获取交易图标
     */
    getTransactionIcon(type) {
      // type: 1-收入, 2-支出
      return type === 1 ? '💰' : '💸'
    },

    /**
     * 获取金额样式类名
     */
    getAmountClass(type) {
      return type === 1 ? 'amount-income' : 'amount-expense'
    },

    /**
     * 获取金额前缀
     */
    getAmountPrefix(type) {
      return type === 1 ? '+' : '-'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''

      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()

      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return '今天 ' + this.formatHourMinute(time)
      }

      // 昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.getDate() === yesterday.getDate()) {
        return '昨天 ' + this.formatHourMinute(time)
      }

      // 其他日期
      return this.formatDate(time)
    },

    /**
     * 格式化时分
     */
    formatHourMinute(time) {
      const date = new Date(time)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },

    /**
     * 格式化日期
     */
    formatDate(time) {
      const date = new Date(time)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
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
.wallet-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #fff;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.nav-placeholder {
  width: 40px;
}

/* 钱包卡片 */
.wallet-card {
  margin: 54px 15px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px 20px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.card-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.card-balance {
  display: flex;
  align-items: baseline;
  margin-bottom: 30px;
}

.balance-integer {
  font-size: 48px;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.balance-decimal {
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 4px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.card-actions button {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-size: 15px;
  border: none;
}

.btn-recharge {
  background-color: #fff;
  color: #667eea;
  font-weight: 600;
}

.btn-withdraw {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 快捷充值 */
.quick-recharge-section {
  margin: 15px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-item:active {
  transform: scale(0.95);
}

.amount-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.amount-unit {
  font-size: 12px;
  color: #666;
}

/* 交易记录 */
.transactions-section {
  margin: 15px;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  max-height: 400px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.section-more {
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
}

.transactions-list {
  max-height: 320px;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 50%;
  font-size: 18px;
  margin-right: 12px;
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-size: 15px;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #999;
  display: block;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.amount-income {
  color: #07c160;
}

.amount-expense {
  color: #ff4d4f;
}

/* 空状态 */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 50px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #999;
}
</style>
