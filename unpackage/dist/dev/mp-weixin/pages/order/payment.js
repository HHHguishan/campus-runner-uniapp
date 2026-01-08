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
      payType: 1,
      // 1-余额支付
      balance: 0,
      // 余额
      paying: false
      // 支付中
    };
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
    }
    if (options.totalAmount) {
      this.totalAmount = Number(options.totalAmount).toFixed(2);
    }
    if (this.orderId) {
      this.loadOrderDetail();
    }
    this.loadBalance();
  },
  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        const res = await api_order.getOrderDetail(this.orderId);
        if (res.code === 200 && res.data) {
          this.orderInfo = res.data;
          if (res.data.totalAmount) {
            this.totalAmount = Number(res.data.totalAmount).toFixed(2);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/payment.vue:150", "❌ 加载订单详情失败:", error);
      }
    },
    /**
     * 加载余额
     */
    async loadBalance() {
      try {
        const res = await api_wallet.getWalletBalance();
        if (res.code === 200) {
          this.balance = Number(res.data || 0).toFixed(2);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/payment.vue:164", "❌ 加载余额失败:", error);
      }
    },
    /**
     * 选择支付方式
     */
    selectPayType(type) {
      this.payType = type;
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
        common_vendor.index.showLoading({ title: "支付中..." });
        const res = await api_order.payOrder({
          orderId: this.orderId,
          payType: this.payType
          // payPassword: '123456' // 如果需要支付密码
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
      } catch (error) {
        common_vendor.index.hideLoading();
        this.paying = false;
        common_vendor.index.__f__("error", "at pages/order/payment.vue:263", "❌ 支付失败:", error);
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.totalAmount),
    c: $data.orderInfo
  }, $data.orderInfo ? {
    d: common_vendor.t($data.orderInfo.orderNo || "-"),
    e: common_vendor.t($options.getServiceTypeName($data.orderInfo.serviceType)),
    f: common_vendor.t($data.orderInfo.goodsInfo || "-")
  } : {}, {
    g: common_vendor.t($data.balance),
    h: $data.payType === 1
  }, $data.payType === 1 ? {} : {}, {
    i: $data.payType === 1 ? 1 : "",
    j: common_vendor.o(($event) => $options.selectPayType(1)),
    k: common_vendor.t($data.totalAmount),
    l: common_vendor.t($data.paying ? "支付中..." : "确认支付"),
    m: common_vendor.o((...args) => $options.confirmPay && $options.confirmPay(...args)),
    n: $data.paying
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-13c3fb22"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/payment.js.map
