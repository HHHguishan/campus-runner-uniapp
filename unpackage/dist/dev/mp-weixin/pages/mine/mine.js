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
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:165", "=== 开始加载用户信息 ===");
        const result = await api_user.getUserInfo();
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:169", "API返回结果:", result);
        common_vendor.index.__f__("log", "at pages/mine/mine.vue:170", "result.data:", result.data);
        if (result.data) {
          this.userInfo = result.data;
          utils_token.setUserInfo(result.data);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:179", "=== 用户信息详情 ===");
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:180", "完整用户对象:", JSON.stringify(result.data, null, 2));
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:181", "isRider值:", result.data.isRider, "类型:", typeof result.data.isRider);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:182", "riderStatus值:", result.data.riderStatus, "类型:", typeof result.data.riderStatus);
          const isCertified = result.data.isRider === 1 && result.data.riderStatus === 1;
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:186", "是否已认证:", isCertified);
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:187", "认证状态文本:", this.getRiderStatusText());
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:190", "=== 获取用户信息失败 ===");
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:191", "错误信息:", error);
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:192", "错误详情:", JSON.stringify(error));
        const userInfo = utils_token.getUserInfo();
        if (userInfo) {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:197", "使用本地缓存数据:", userInfo);
          this.userInfo = userInfo;
        } else {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:201", "未登录，跳转到登录页");
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
        }
      }
    },
    // 切换为骑手模式
    switchToRiderMode() {
      const isRiderCertified = this.userInfo.isRider === 1 && this.userInfo.riderStatus === 1;
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:214", "当前用户信息:", this.userInfo);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:215", "isRider:", this.userInfo.isRider);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:216", "riderStatus:", this.userInfo.riderStatus);
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:217", "是否已认证:", isRiderCertified);
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
    },
    // 跳转到地址列表
    goToAddressList() {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:283", "🚀 准备跳转到地址列表页");
      common_vendor.index.navigateTo({
        url: "/pages/address/list",
        success: () => {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:288", "✅ 地址列表页跳转成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/mine/mine.vue:291", "❌ 地址列表页跳转失败:", err);
          common_vendor.index.__f__("error", "at pages/mine/mine.vue:292", "错误详情:", JSON.stringify(err));
          common_vendor.index.showModal({
            title: "跳转失败",
            content: "地址管理页面未找到，请重新编译项目。\n\n步骤：\n1. 删除unpackage文件夹\n2. 重新运行项目",
            confirmText: "我知道了",
            showCancel: false
          });
        }
      });
    },
    // 跳转到钱包页面
    goToWallet() {
      common_vendor.index.__f__("log", "at pages/mine/mine.vue:307", "🚀 准备跳转到钱包页面");
      common_vendor.index.navigateTo({
        url: "/pages/wallet/wallet",
        success: () => {
          common_vendor.index.__f__("log", "at pages/mine/mine.vue:312", "✅ 钱包页面跳转成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/mine/mine.vue:315", "❌ 钱包页面跳转失败:", err);
          common_vendor.index.__f__("error", "at pages/mine/mine.vue:316", "错误详情:", JSON.stringify(err));
          common_vendor.index.showModal({
            title: "跳转失败",
            content: "钱包页面未找到，请重新编译项目。\n\n步骤：\n1. 删除unpackage文件夹\n2. 重新运行项目",
            confirmText: "我知道了",
            showCancel: false
          });
        }
      });
    },
    // 编辑个人资料
    editProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/profile/edit"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatar || "https://via.placeholder.com/120",
    b: common_vendor.t($data.userInfo.nickname || "未登录"),
    c: common_vendor.t($data.userInfo.mobile || ""),
    d: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args)),
    e: common_vendor.t($data.userInfo.balance || 0),
    f: common_vendor.t($data.userInfo.creditScore || 100),
    g: common_vendor.t($options.getRiderStatusText()),
    h: common_vendor.o((...args) => $options.switchToRiderMode && $options.switchToRiderMode(...args)),
    i: common_vendor.o((...args) => $options.goToAddressList && $options.goToAddressList(...args)),
    j: common_vendor.o((...args) => $options.goToWallet && $options.goToWallet(...args)),
    k: common_vendor.t($options.getRiderStatusText()),
    l: common_vendor.o(($event) => $options.navigateTo("/pages/rider/auth")),
    m: common_vendor.o(($event) => $options.navigateTo("/pages/evaluation/evaluation")),
    n: common_vendor.o(($event) => $options.navigateTo("/pages/settings/settings")),
    o: common_vendor.o(($event) => $options.navigateTo("/pages/debug/api")),
    p: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
