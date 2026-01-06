"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const utils_token = require("../../utils/token.js");
const _sfc_main = {
  props: {
    currentPage: {
      type: String,
      default: "hall"
    }
  },
  methods: {
    switchPage(page) {
      if (page === this.currentPage)
        return;
      common_vendor.index.redirectTo({
        url: `/pages/${page}/${page}`
      });
    },
    // 切换为用户模式
    async switchToUser() {
      try {
        common_vendor.index.showModal({
          title: "切换身份",
          content: "确定切换为用户模式吗？",
          success: async (res) => {
            if (res.confirm) {
              common_vendor.index.showLoading({ title: "切换中...", mask: true });
              const result = await api_user.switchMode({ targetMode: 1 });
              common_vendor.index.hideLoading();
              if (result.data) {
                utils_token.setUserInfo(result.data);
              }
              common_vendor.index.showToast({
                title: "切换成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.switchTab({
                  url: "/pages/index/index"
                });
              }, 1e3);
            }
          }
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at components/rider-nav/rider-nav.vue:78", "切换失败:", error);
        common_vendor.index.showToast({
          title: "切换失败，请重试",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.currentPage === "hall" ? 1 : "",
    b: common_vendor.o(($event) => $options.switchPage("hall")),
    c: $props.currentPage === "running" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchPage("running")),
    e: $props.currentPage === "stats" ? 1 : "",
    f: common_vendor.o(($event) => $options.switchPage("stats")),
    g: common_vendor.o((...args) => $options.switchToUser && $options.switchToUser(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0e2515c0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/rider-nav/rider-nav.js.map
