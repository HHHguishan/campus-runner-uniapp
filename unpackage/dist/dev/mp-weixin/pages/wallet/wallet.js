"use strict";
const common_vendor = require("../../common/vendor.js");
const api_wallet = require("../../api/wallet.js");
const _sfc_main = {
  data() {
    return {
      balance: 0,
      // 余额
      transactions: [],
      // 交易记录
      loading: false,
      quickAmounts: [10, 50, 100, 200, 500, 1e3],
      // 快捷充值金额
      page: 1,
      size: 10,
      hasMore: true
    };
  },
  computed: {
    // 余额整数部分
    balanceInteger() {
      return Math.floor(this.balance).toString();
    },
    // 余额小数部分
    balanceDecimal() {
      const decimal = (this.balance % 1).toFixed(2);
      return decimal.substring(2);
    }
  },
  onLoad() {
    this.loadWalletBalance();
    this.loadTransactions();
  },
  onShow() {
    this.loadWalletBalance();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.hasMore = true;
    Promise.all([this.loadWalletBalance(), this.loadTransactions()]).then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  methods: {
    /**
     * 加载钱包余额
     */
    async loadWalletBalance() {
      try {
        const res = await api_wallet.getWalletBalance();
        if (res.code === 200) {
          this.balance = res.data || 0;
          common_vendor.index.__f__("log", "at pages/wallet/wallet.vue:152", "✅ 钱包余额:", this.balance);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/wallet/wallet.vue:155", "❌ 获取余额失败:", error);
      }
    },
    /**
     * 加载交易记录
     */
    async loadTransactions() {
      if (this.loading || !this.hasMore)
        return;
      try {
        this.loading = true;
        const res = await api_wallet.getTransactions({
          page: this.page,
          size: this.size
        });
        if (res.code === 200) {
          const records = res.data.records || [];
          if (this.page === 1) {
            this.transactions = records;
          } else {
            this.transactions = [...this.transactions, ...records];
          }
          this.hasMore = records.length >= this.size;
          this.page++;
          common_vendor.index.__f__("log", "at pages/wallet/wallet.vue:186", "✅ 交易记录:", this.transactions);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/wallet/wallet.vue:189", "❌ 获取交易记录失败:", error);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 加载更多
     */
    loadMore() {
      if (this.hasMore) {
        this.loadTransactions();
      } else {
        common_vendor.index.showToast({
          title: "没有更多数据了",
          icon: "none"
        });
      }
    },
    /**
     * 跳转到充值页面
     */
    goToRecharge() {
      common_vendor.index.navigateTo({
        url: "/pages/wallet/recharge"
      });
    },
    /**
     * 快捷充值
     */
    quickRecharge(amount) {
      common_vendor.index.showModal({
        title: "确认充值",
        content: `确定要充值 ${amount} 元吗？`,
        success: (res) => {
          if (res.confirm) {
            this.doRecharge(amount);
          }
        }
      });
    },
    /**
     * 执行充值
     */
    async doRecharge(amount) {
      try {
        common_vendor.index.showLoading({ title: "充值中..." });
        const res = await api_wallet.recharge({ amount });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "充值成功",
            icon: "success"
          });
          await this.loadWalletBalance();
          this.page = 1;
          await this.loadTransactions();
        } else {
          common_vendor.index.showToast({
            title: res.message || "充值失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/wallet/wallet.vue:262", "❌ 充值失败:", error);
        common_vendor.index.showToast({
          title: "充值失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 提现功能（开发中）
     */
    handleWithdraw() {
      common_vendor.index.showModal({
        title: "提示",
        content: "提现功能开发中，敬请期待",
        showCancel: false
      });
    },
    /**
     * 获取交易图标
     */
    getTransactionIcon(type) {
      return type === 1 ? "💰" : "💸";
    },
    /**
     * 获取金额样式类名
     */
    getAmountClass(type) {
      return type === 1 ? "amount-income" : "amount-expense";
    },
    /**
     * 获取金额前缀
     */
    getAmountPrefix(type) {
      return type === 1 ? "+" : "-";
    },
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 24 * 60 * 60 * 1e3 && date.getDate() === now.getDate()) {
        return "今天 " + this.formatHourMinute(time);
      }
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.getDate() === yesterday.getDate()) {
        return "昨天 " + this.formatHourMinute(time);
      }
      return this.formatDate(time);
    },
    /**
     * 格式化时分
     */
    formatHourMinute(time) {
      const date = new Date(time);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    /**
     * 格式化日期
     */
    formatDate(time) {
      const date = new Date(time);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    },
    /**
     * 返回上一页
     */
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($options.balanceInteger),
    c: common_vendor.t($options.balanceDecimal),
    d: common_vendor.o((...args) => $options.goToRecharge && $options.goToRecharge(...args)),
    e: common_vendor.o((...args) => $options.handleWithdraw && $options.handleWithdraw(...args)),
    f: common_vendor.f($data.quickAmounts, (amount, k0, i0) => {
      return {
        a: common_vendor.t(amount),
        b: amount,
        c: common_vendor.o(($event) => $options.quickRecharge(amount), amount)
      };
    }),
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    h: $data.transactions.length > 0
  }, $data.transactions.length > 0 ? {
    i: common_vendor.f($data.transactions, (item, k0, i0) => {
      return {
        a: common_vendor.t($options.getTransactionIcon(item.type)),
        b: common_vendor.t(item.typeName),
        c: common_vendor.t($options.formatTime(item.createTime)),
        d: common_vendor.t($options.getAmountPrefix(item.type)),
        e: common_vendor.t(item.amount),
        f: common_vendor.n($options.getAmountClass(item.type)),
        g: item.id
      };
    }),
    j: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  } : {}, {
    k: $data.transactions.length === 0 && !$data.loading
  }, $data.transactions.length === 0 && !$data.loading ? {} : {}, {
    l: $data.loading
  }, $data.loading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4c380209"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/wallet.js.map
