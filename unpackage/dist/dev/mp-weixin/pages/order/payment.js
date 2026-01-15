"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_wallet = require("../../api/wallet.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      totalAmount: "0.00",
      orderInfo: null,
      payType: "BALANCE",
      // BALANCE-余额支付, ALIPAY-支付宝
      balance: 0,
      // 余额
      paying: false,
      // 支付中
      countdown: -1,
      // 倒计时秒数, -1表示未初始化
      countdownTimer: null
      // 倒计时定时器
    };
  },
  onLoad(options) {
    common_vendor.index.__f__("log", "at pages/order/payment.vue:146", "📝 支付页面参数:", options);
    if (options.orderId) {
      this.orderId = options.orderId;
      common_vendor.index.__f__("log", "at pages/order/payment.vue:150", "✅ 订单ID:", this.orderId);
    } else {
      common_vendor.index.__f__("error", "at pages/order/payment.vue:152", "❌ 缺少订单ID参数");
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
      return;
    }
    if (options.totalAmount) {
      this.totalAmount = Number(options.totalAmount).toFixed(2);
      common_vendor.index.__f__("log", "at pages/order/payment.vue:165", "✅ 支付金额:", this.totalAmount);
    }
    this.loadOrderDetail();
    this.loadBalance();
  },
  onUnload() {
    this.stopCountdown();
  },
  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      if (!this.orderId) {
        common_vendor.index.__f__("error", "at pages/order/payment.vue:186", "❌ 订单ID为空，无法加载订单详情");
        return;
      }
      try {
        common_vendor.index.__f__("log", "at pages/order/payment.vue:191", "📥 加载订单详情, orderId:", this.orderId);
        const res = await api_order.getOrderDetail(this.orderId);
        common_vendor.index.__f__("log", "at pages/order/payment.vue:193", "📥 订单详情响应:", JSON.stringify(res, null, 2));
        if (res.code === 200 && res.data) {
          this.orderInfo = res.data;
          if (res.data.totalFee) {
            this.totalAmount = Number(res.data.totalFee).toFixed(2);
            common_vendor.index.__f__("log", "at pages/order/payment.vue:200", "✅ 更新支付金额:", this.totalAmount);
          }
          if (res.data.countdown && res.data.countdown > 0) {
            this.startCountdown(res.data.countdown);
          } else if (res.data.status === 0) {
            this.startCountdown(30 * 60);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/payment.vue:211", "❌ 加载订单详情失败:", error);
        common_vendor.index.showToast({
          title: "加载订单详情失败",
          icon: "none"
        });
      }
    },
    /**
     * 加载余额
     */
    async loadBalance() {
      try {
        common_vendor.index.__f__("log", "at pages/order/payment.vue:224", "📥 加载钱包余额...");
        const res = await api_wallet.getWalletBalance();
        common_vendor.index.__f__("log", "at pages/order/payment.vue:226", "📥 余额响应:", JSON.stringify(res, null, 2));
        if (res.code === 200) {
          const balanceValue = res.data !== null ? res.data : 0;
          this.balance = Number(balanceValue).toFixed(2);
          common_vendor.index.__f__("log", "at pages/order/payment.vue:232", "✅ 当前余额:", this.balance);
        } else {
          common_vendor.index.__f__("error", "at pages/order/payment.vue:234", "❌ 获取余额失败:", res.message);
          common_vendor.index.showToast({
            title: res.message || "获取余额失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/payment.vue:241", "❌ 加载余额失败:", error);
        common_vendor.index.showToast({
          title: "加载余额失败",
          icon: "none"
        });
      }
    },
    /**
     * 选择支付方式
     */
    selectPayType(type) {
      this.payType = type === 1 ? "BALANCE" : "ALIPAY";
    },
    /**
     * 获取服务类型名称
     */
    getServiceTypeName(type) {
      const types = {
        1: "帮我买",
        2: "帮我送",
        3: "帮我取",
        4: "全能"
      };
      return types[type] || "-";
    },
    /**
     * 确认支付
     */
    async confirmPay() {
      if (this.payType === 1 && Number(this.balance) < Number(this.totalAmount)) {
        common_vendor.index.showModal({
          title: "余额不足",
          content: `当前余额：¥${this.balance}
支付金额：¥${this.totalAmount}

请先充值`,
          confirmText: "去充值",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/wallet/recharge"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认支付",
        content: `确定支付 ¥${this.totalAmount} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.doPay();
          }
        }
      });
    },
    /**
     * 执行支付
     */
    async doPay() {
      if (this.paying)
        return;
      try {
        this.paying = true;
        common_vendor.index.showLoading({ title: "正在发起支付..." });
        if (this.payType === "BALANCE") {
          const res = await api_order.payOrder({
            orderId: this.orderId,
            payType: "BALANCE"
          });
          common_vendor.index.hideLoading();
          this.paying = false;
          if (res.code === 200) {
            common_vendor.index.showToast({
              title: "支付成功",
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              common_vendor.index.redirectTo({
                url: `/pages/order/detail?id=${this.orderId}`
              });
            }, 1500);
          } else {
            common_vendor.index.showToast({
              title: res.message || "支付失败",
              icon: "none"
            });
          }
        } else if (this.payType === "ALIPAY") {
          const res = await api_order.alipayPayOrder({
            orderId: this.orderId
          });
          common_vendor.index.hideLoading();
          this.paying = false;
          if (res.code === 200 && res.data) {
            common_vendor.index.setStorageSync("alipay_form", res.data);
            common_vendor.index.navigateTo({
              url: `/pages/wallet/alipay-pay?orderId=${this.orderId}&amount=${this.totalAmount}&type=order`
            });
          } else {
            common_vendor.index.showToast({
              title: res.message || "发起支付宝支付失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        this.paying = false;
        common_vendor.index.__f__("error", "at pages/order/payment.vue:368", "❌ 支付失败:", error);
        common_vendor.index.showToast({
          title: "支付失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 返回上一页
     */
    goBack() {
      common_vendor.index.navigateBack();
    },
    /**
     * 启动倒计时
     */
    startCountdown(seconds) {
      this.countdown = seconds;
      this.stopCountdown();
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.stopCountdown();
          common_vendor.index.showModal({
            title: "订单已超时",
            content: "该订单已超过支付时限，请重新下单",
            showCancel: false,
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        }
      }, 1e3);
    },
    /**
     * 停止倒计时
     */
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },
    /**
     * 格式化倒计时显示
     */
    formatCountdown(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.totalAmount),
    c: $data.countdown > 0
  }, $data.countdown > 0 ? {
    d: common_vendor.t($options.formatCountdown($data.countdown))
  } : $data.countdown === 0 ? {} : {}, {
    e: $data.countdown === 0,
    f: $data.orderInfo
  }, $data.orderInfo ? {
    g: common_vendor.t($data.orderInfo.orderNo || "-"),
    h: common_vendor.t($options.getServiceTypeName($data.orderInfo.type)),
    i: common_vendor.t($data.orderInfo.goodsDesc || "-")
  } : {}, {
    j: common_vendor.t($data.balance),
    k: $data.payType === "BALANCE"
  }, $data.payType === "BALANCE" ? {} : {}, {
    l: $data.payType === "BALANCE" ? 1 : "",
    m: common_vendor.o(($event) => $options.selectPayType(1)),
    n: $data.payType === "ALIPAY"
  }, $data.payType === "ALIPAY" ? {} : {}, {
    o: $data.payType === "ALIPAY" ? 1 : "",
    p: common_vendor.o(($event) => $options.selectPayType(2)),
    q: common_vendor.t($data.totalAmount),
    r: common_vendor.t($data.paying ? "支付中..." : "确认支付"),
    s: common_vendor.o((...args) => $options.confirmPay && $options.confirmPay(...args)),
    t: $data.paying
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-13c3fb22"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/payment.js.map
