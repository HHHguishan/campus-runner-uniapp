"use strict";
const common_vendor = require("../../common/vendor.js");
const api_wallet = require("../../api/wallet.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  data() {
    return {
      alipayForm: "",
      amount: "0.00",
      orderId: "",
      type: "recharge",
      // recharge 或 order
      statusText: "正在准备支付...",
      isPaid: false,
      timer: null,
      oldBalance: 0
    };
  },
  async onLoad(options) {
    this.amount = options.amount || "0.00";
    this.orderId = options.orderId || "";
    this.type = options.type || "recharge";
    if (this.type === "recharge") {
      await this.getInitialBalance();
    }
    const form = common_vendor.index.getStorageSync("alipay_form");
    common_vendor.index.__f__("log", "at pages/wallet/alipay-pay.vue:69", "📦 获取到支付表单内容:", form);
    if (form) {
      this.alipayForm = typeof form === "string" ? form.trim() : form;
      this.statusText = "请复制链接支付";
      this.startPolling();
    } else {
      common_vendor.index.showToast({
        title: "支付信息丢失",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
  },
  onUnload() {
    this.stopPolling();
  },
  methods: {
    async getInitialBalance() {
      try {
        const res = await api_wallet.getWalletBalance();
        if (res.code === 200) {
          this.oldBalance = Number(res.data || 0);
        }
      } catch (e) {
      }
    },
    startPolling() {
      this.stopPolling();
      this.timer = setInterval(() => {
        this.checkPayStatus(true);
      }, 3e3);
    },
    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    /**
     * 检查支付状态
     * @param {Boolean} isAuto 是否为自动轮询
     */
    async checkPayStatus(isAuto = false) {
      if (this.isPaid)
        return;
      const outTradeNo = this.getOutTradeNo();
      if (outTradeNo) {
        common_vendor.index.__f__("log", "at pages/wallet/alipay-pay.vue:133", "🔄 触发后端状态同步:", outTradeNo);
        try {
          await api_wallet.syncAlipayStatus(outTradeNo);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/wallet/alipay-pay.vue:137", "同步状态接口异常:", e);
        }
      }
      try {
        if (this.type === "recharge") {
          const res = await api_wallet.getWalletBalance();
          if (res.code === 200) {
            const currentBalance = Number(res.data || 0);
            if (currentBalance > this.oldBalance) {
              this.handleSuccess();
            } else if (!isAuto) {
              common_vendor.index.showToast({ title: "尚未检测到充值到账", icon: "none" });
            }
          }
        } else {
          const res = await api_order.getOrderDetail(this.orderId);
          if (res.code === 200 && res.data) {
            const status = res.data.status;
            if (status >= 20 && status < 60) {
              this.handleSuccess();
            } else if (!isAuto) {
              common_vendor.index.showToast({ title: "订单尚未支付成功", icon: "none" });
            }
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/alipay-pay.vue:168", "检查支付状态异常:", e);
      }
    },
    handleSuccess() {
      this.isPaid = true;
      this.stopPolling();
      common_vendor.index.showToast({ title: "支付成功", icon: "success" });
      setTimeout(() => {
        if (this.type === "recharge") {
          common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        } else {
          common_vendor.index.redirectTo({ url: `/pages/order/detail?id=${this.orderId}` });
        }
      }, 1500);
    },
    /**
     * 提交支付（H5环境）
     */
    submitPay() {
      this.copyPayLink();
    },
    /**
     * 复制支付链接（小程序环境）
     */
    copyPayLink() {
      common_vendor.index.__f__("log", "at pages/wallet/alipay-pay.vue:209", "🔗 准备解析支付链接, 内容长度:", this.alipayForm.length);
      let payUrl = "";
      const trimmedForm = this.alipayForm.trim();
      if (trimmedForm.startsWith("http")) {
        payUrl = trimmedForm;
      } else {
        const actionMatch = trimmedForm.match(/action=["']([^"']+)["']/);
        if (actionMatch && actionMatch[1]) {
          payUrl = actionMatch[1];
          common_vendor.index.__f__("log", "at pages/wallet/alipay-pay.vue:221", "✅ 从表单解析出 URL:", payUrl);
        }
      }
      if (payUrl) {
        common_vendor.index.setClipboardData({
          data: payUrl,
          success: () => {
            common_vendor.index.__f__("log", "at pages/wallet/alipay-pay.vue:229", "✅ 链接已复制到剪贴板");
            common_vendor.index.showModal({
              title: "链接已复制",
              content: "支付链接已复制到剪贴板，请打开浏览器粘贴并支付。",
              showCancel: false,
              confirmText: "我知道了"
            });
          }
        });
      } else {
        common_vendor.index.__f__("error", "at pages/wallet/alipay-pay.vue:239", "❌ 解析支付链接失败, 原内容:", this.alipayForm);
        common_vendor.index.showToast({
          title: "解析支付链接失败",
          icon: "none"
        });
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    /**
     * 从表单或 URL 中提取商户订单号 (out_trade_no)
     */
    getOutTradeNo() {
      if (!this.alipayForm)
        return "";
      const trimmedForm = this.alipayForm.trim();
      const urlMatch = trimmedForm.match(/[?&]out_trade_no=([^&]+)/);
      if (urlMatch && urlMatch[1])
        return urlMatch[1];
      const inputMatch = trimmedForm.match(/name=["']out_trade_no["']\s+value=["']([^"']+)["']/);
      if (inputMatch && inputMatch[1])
        return inputMatch[1];
      const altMatch = trimmedForm.match(/value=["']([^"']+)["']\s+name=["']out_trade_no["']/);
      if (altMatch && altMatch[1])
        return altMatch[1];
      return "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.statusText),
    b: common_vendor.t($data.amount),
    c: common_vendor.o((...args) => $options.copyPayLink && $options.copyPayLink(...args)),
    d: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    e: $data.orderId
  }, $data.orderId ? {} : {}, {
    f: $data.isPaid
  }, $data.isPaid ? {} : $data.alipayForm ? {
    h: common_vendor.o((...args) => $options.checkPayStatus && $options.checkPayStatus(...args))
  } : {}, {
    g: $data.alipayForm
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a0de8758"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/alipay-pay.js.map
