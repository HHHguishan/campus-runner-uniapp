"use strict";
const common_vendor = require("../../common/vendor.js");
const api_wallet = require("../../api/wallet.js");
const _sfc_main = {
  data() {
    return {
      presetAmounts: [10, 50, 100, 200, 500, 1e3],
      // 预设金额
      selectedAmount: null,
      // 选中的预设金额
      customAmount: "",
      // 自定义金额
      currentAmount: 0
      // 当前充值金额
    };
  },
  computed: {
    // 最终充值金额
    finalAmount() {
      return Number(this.currentAmount || 0).toFixed(2);
    },
    // 是否可以充值
    canRecharge() {
      const amount = Number(this.currentAmount);
      return amount >= 1 && amount <= 1e4;
    }
  },
  methods: {
    /**
     * 选择预设金额
     */
    selectAmount(amount) {
      this.selectedAmount = amount;
      this.customAmount = "";
      this.currentAmount = amount;
    },
    /**
     * 自定义金额输入
     */
    onCustomAmountInput(e) {
      const value = e.detail.value;
      this.customAmount = value;
      if (value.includes(".")) {
        const parts = value.split(".");
        if (parts[1] && parts[1].length > 2) {
          this.customAmount = parts[0] + "." + parts[1].substring(0, 2);
        }
      }
      this.selectedAmount = null;
      this.currentAmount = Number(this.customAmount);
    },
    /**
     * 充值
     */
    async handleRecharge() {
      const amount = Number(this.currentAmount);
      if (amount < 1) {
        common_vendor.index.showToast({
          title: "充值金额不能低于1元",
          icon: "none"
        });
        return;
      }
      if (amount > 1e4) {
        common_vendor.index.showToast({
          title: "单笔充值不能超过10000元",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认充值",
        content: `确定要充值 ¥${amount.toFixed(2)} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.doRecharge(amount);
          }
        }
      });
    },
    /**
     * 执行充值
     */
    async doRecharge(amount) {
      try {
        common_vendor.index.showLoading({ title: "正在发起支付..." });
        const res = await api_wallet.alipayRecharge({ amount });
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data) {
          common_vendor.index.setStorageSync("alipay_form", res.data);
          common_vendor.index.navigateTo({
            url: `/pages/wallet/alipay-pay?amount=${amount.toFixed(2)}`
          });
        } else {
          common_vendor.index.showToast({
            title: res.message || "发起支付失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/wallet/recharge.vue:209", "❌ 充值失败:", error);
        common_vendor.index.showToast({
          title: "发起支付失败，请稍后重试",
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
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.f($data.presetAmounts, (amount, k0, i0) => {
      return {
        a: common_vendor.t(amount),
        b: $data.selectedAmount === amount ? 1 : "",
        c: amount,
        d: common_vendor.o(($event) => $options.selectAmount(amount), amount)
      };
    }),
    c: common_vendor.o([($event) => $data.customAmount = $event.detail.value, (...args) => $options.onCustomAmountInput && $options.onCustomAmountInput(...args)]),
    d: $data.customAmount,
    e: common_vendor.t($options.finalAmount),
    f: common_vendor.o((...args) => $options.handleRecharge && $options.handleRecharge(...args)),
    g: !$options.canRecharge
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456d4d33"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/recharge.js.map
