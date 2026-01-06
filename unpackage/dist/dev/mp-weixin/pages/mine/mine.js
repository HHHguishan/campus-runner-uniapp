"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_token = require("../../utils/token.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {}
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  onShow() {
    this.loadUserInfo();
  },
  methods: {
    // 获取骑手认证状态文本
    getRiderStatusText() {
      const { isRider, riderStatus } = this.userInfo;
      if (!isRider || isRider === 0) {
        return "未认证";
      }
      switch (riderStatus) {
        case 0:
          return "审核中";
        case 1:
          return "已认证";
        case 2:
          return "已驳回";
        default:
          return "未认证";
      }
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:156", "=== 开始加载用户信息 ===");
        const result = await api_user.getUserInfo();
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:160", "API返回结果:", result);
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:161", "result.data:", result.data);
        if (result.data) {
          this.userInfo = result.data;
          utils_token.setUserInfo(result.data);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:170", "=== 用户信息详情 ===");
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:171", "完整用户对象:", JSON.stringify(result.data, null, 2));
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:172", "isRider值:", result.data.isRider, "类型:", typeof result.data.isRider);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:173", "riderStatus值:", result.data.riderStatus, "类型:", typeof result.data.riderStatus);
          const isCertified = result.data.isRider === 1 && result.data.riderStatus === 1;
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:177", "是否已认证:", isCertified);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:178", "认证状态文本:", this.getRiderStatusText());
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:181", "=== 获取用户信息失败 ===");
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:182", "错误信息:", error);
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:183", "错误详情:", JSON.stringify(error));
        const userInfo = utils_token.getUserInfo();
        if (userInfo) {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:188", "使用本地缓存数据:", userInfo);
          this.userInfo = userInfo;
        } else {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:192", "未登录，跳转到登录页");
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
        }
      }
    },
    // 切换为骑手模式
    switchToRiderMode() {
      const isRiderCertified = this.userInfo.isRider === 1 && this.userInfo.riderStatus === 1;
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:205", "当前用户信息:", this.userInfo);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:206", "isRider:", this.userInfo.isRider);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:207", "riderStatus:", this.userInfo.riderStatus);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:208", "是否已认证:", isRiderCertified);
      if (!isRiderCertified) {
        common_vendor.index.showModal({
          title: "提示",
          content: "您还未通过骑手认证，是否前往认证？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/pages/rider/auth"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.redirectTo({
        url: "/pages/hall/hall"
      });
    },
    // 退出登录
    handleLogout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            utils_token.removeToken();
            utils_token.removeUserInfo();
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }, 1e3);
          }
        }
      });
    },
    // 页面跳转
    navigateTo(url) {
      common_vendor.index.navigateTo({
        url,
        fail: () => {
          common_vendor.index.showToast({
            title: "页面开发中...",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar || "https://via.placeholder.com/120",
    b: common_vendor.t($data.userInfo.nickname || "未登录"),
    c: common_vendor.t($data.userInfo.mobile || ""),
    d: common_vendor.o((...args) => $options.loadUserInfo && $options.loadUserInfo(...args)),
    e: common_vendor.t($data.userInfo.balance || 0),
    f: common_vendor.t($data.userInfo.creditScore || 100),
    g: common_vendor.t($options.getRiderStatusText()),
    h: common_vendor.o((...args) => $options.switchToRiderMode && $options.switchToRiderMode(...args)),
    i: common_vendor.o(($event) => $options.navigateTo("/pages/address/address")),
    j: common_vendor.o(($event) => $options.navigateTo("/pages/wallet/wallet")),
    k: common_vendor.t($options.getRiderStatusText()),
    l: common_vendor.o(($event) => $options.navigateTo("/pages/rider/auth")),
    m: common_vendor.o(($event) => $options.navigateTo("/pages/evaluation/evaluation")),
    n: common_vendor.o(($event) => $options.navigateTo("/pages/settings/settings")),
    o: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
