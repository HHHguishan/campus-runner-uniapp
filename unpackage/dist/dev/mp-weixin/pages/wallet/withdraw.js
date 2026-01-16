"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      balance: "0.00",
      submitting: false,
      formData: {
        amount: "",
        accountType: "alipay",
        accountNo: "",
        realName: ""
      },
      accountTypes: [
        { name: "支付宝", value: "alipay" },
        { name: "微信支付", value: "wechat" },
        { name: "银行卡", value: "bank" }
      ]
    };
  },
  computed: {
    getAccountTypeName() {
      const type = this.accountTypes.find((t) => t.value === this.formData.accountType);
      return type ? type.name : "";
    }
  },
  onShow() {
    this.loadBalance();
  },
  methods: {
    async loadBalance() {
      try {
        const res = await this.$request({
          url: "/wallet/balance",
          method: "GET"
        });
        if (res.code === 200) {
          this.balance = (res.data || 0).toFixed(2);
        }
        this.loadUserInfo();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/withdraw.vue:118", "加载余额失败", e);
      }
    },
    async loadUserInfo() {
      try {
        const res = await this.$request({
          url: "/user/info",
          method: "GET"
        });
        if (res.code === 200 && res.data) {
          if (res.data.alipayAccount && !this.formData.accountNo) {
            this.formData.accountNo = res.data.alipayAccount;
          }
          if (res.data.alipayName && !this.formData.realName) {
            this.formData.realName = res.data.alipayName;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/withdraw.vue:137", "加载用户信息失败", e);
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    onTypeChange(e) {
      this.formData.accountType = e.detail.value;
    },
    withdrawAll() {
      this.formData.amount = this.balance;
    },
    goToHistory() {
      common_vendor.index.navigateTo({
        url: "/pages/wallet/withdraw-records"
      });
    },
    async submitWithdraw() {
      if (!this.formData.amount || parseFloat(this.formData.amount) < 1) {
        return common_vendor.index.showToast({ title: "提现金额需不小于1元", icon: "none" });
      }
      if (parseFloat(this.formData.amount) > parseFloat(this.balance)) {
        return common_vendor.index.showToast({ title: "余额不足", icon: "none" });
      }
      if (!this.formData.accountNo) {
        return common_vendor.index.showToast({ title: "请填写收款账号", icon: "none" });
      }
      if (!this.formData.realName) {
        return common_vendor.index.showToast({ title: "请填写真实姓名", icon: "none" });
      }
      common_vendor.index.showModal({
        title: "提现确认",
        content: `申请提现 ¥${this.formData.amount} 到 ${this.getAccountTypeName}？
审核期间该笔金额将被锁定。`,
        success: async (res) => {
          if (res.confirm) {
            this.executeSubmit();
          }
        }
      });
    },
    async executeSubmit() {
      this.submitting = true;
      try {
        const res = await this.$request({
          url: "/withdraw/apply",
          method: "POST",
          data: this.formData
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "申请已提交", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "申请失败", icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/withdraw.vue:195", "提现申请失败", e);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      } finally {
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.balance),
    c: $data.formData.amount,
    d: common_vendor.o(($event) => $data.formData.amount = $event.detail.value),
    e: common_vendor.o((...args) => $options.withdrawAll && $options.withdrawAll(...args)),
    f: common_vendor.f($data.accountTypes, (item, k0, i0) => {
      return {
        a: item.value,
        b: $data.formData.accountType === item.value,
        c: common_vendor.t(item.name),
        d: item.value
      };
    }),
    g: common_vendor.o((...args) => $options.onTypeChange && $options.onTypeChange(...args)),
    h: "请输入" + $options.getAccountTypeName + "账号",
    i: $data.formData.accountNo,
    j: common_vendor.o(($event) => $data.formData.accountNo = $event.detail.value),
    k: $data.formData.realName,
    l: common_vendor.o(($event) => $data.formData.realName = $event.detail.value),
    m: $data.submitting,
    n: common_vendor.o((...args) => $options.submitWithdraw && $options.submitWithdraw(...args)),
    o: common_vendor.o((...args) => $options.goToHistory && $options.goToHistory(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9be921b8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/withdraw.js.map
