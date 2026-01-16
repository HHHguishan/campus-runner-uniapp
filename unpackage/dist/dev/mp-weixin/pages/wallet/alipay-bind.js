"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      formData: {
        alipayAccount: "",
        alipayName: ""
      }
    };
  },
  onLoad() {
    this.loadCurrentInfo();
  },
  methods: {
    async loadCurrentInfo() {
      try {
        const res = await this.$request({
          url: "/user/info",
          method: "GET"
        });
        if (res.code === 200) {
          this.formData.alipayAccount = res.data.alipayAccount || "";
          this.formData.alipayName = res.data.alipayName || "";
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/alipay-bind.vue:70", "获取信息失败", e);
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    async handleSave() {
      if (!this.formData.alipayAccount) {
        return common_vendor.index.showToast({ title: "请输入支付宝账号", icon: "none" });
      }
      if (!this.formData.alipayName) {
        return common_vendor.index.showToast({ title: "请输入收款人姓名", icon: "none" });
      }
      this.loading = true;
      try {
        const res = await this.$request({
          url: "/user/update",
          method: "PUT",
          data: this.formData
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/alipay-bind.vue:98", "更新失败", e);
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.formData.alipayAccount,
    c: common_vendor.o(($event) => $data.formData.alipayAccount = $event.detail.value),
    d: $data.formData.alipayName,
    e: common_vendor.o(($event) => $data.formData.alipayName = $event.detail.value),
    f: $data.loading,
    g: common_vendor.o((...args) => $options.handleSave && $options.handleSave(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-11a69657"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/alipay-bind.js.map
