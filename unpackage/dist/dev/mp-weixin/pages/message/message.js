"use strict";
const common_vendor = require("../../common/vendor.js");
const api_notice = require("../../api/notice.js");
const _sfc_main = {
  data() {
    return {
      latestNotice: null,
      unreadCount: 0
    };
  },
  onLoad() {
    this.loadLatestNotice();
  },
  methods: {
    // 加载最新公告
    async loadLatestNotice() {
      try {
        common_vendor.index.__f__("log", "at pages/message/message.vue:88", "=== 开始加载最新公告 ===");
        const res = await api_notice.getNoticeList({ type: 1 });
        common_vendor.index.__f__("log", "at pages/message/message.vue:92", "最新公告API响应:", res);
        common_vendor.index.__f__("log", "at pages/message/message.vue:93", "响应数据:", res.data);
        if (res.code === 200 && res.data) {
          const noticeData = Array.isArray(res.data) ? res.data : [];
          common_vendor.index.__f__("log", "at pages/message/message.vue:98", "公告数量:", noticeData.length);
          if (noticeData.length > 0) {
            this.latestNotice = noticeData[0];
            common_vendor.index.__f__("log", "at pages/message/message.vue:103", "最新公告:", this.latestNotice);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:107", "=== 加载最新公告失败 ===");
        common_vendor.index.__f__("error", "at pages/message/message.vue:108", "错误信息:", error);
      }
    },
    // 跳转到公告页面
    goToNotice() {
      common_vendor.index.navigateTo({
        url: "/pages/notice/notice"
      });
    },
    // 跳转到订单页面
    goToOrders() {
      common_vendor.index.switchTab({
        url: "/pages/orders/orders"
      });
    },
    // 格式化时间
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 36e5) {
        return Math.floor(diff / 6e4) + "分钟前";
      }
      if (diff < 864e5) {
        return Math.floor(diff / 36e5) + "小时前";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goToNotice && $options.goToNotice(...args)),
    b: $data.unreadCount > 0
  }, $data.unreadCount > 0 ? {
    c: common_vendor.t($data.unreadCount)
  } : {}, {
    d: common_vendor.o((...args) => $options.goToOrders && $options.goToOrders(...args)),
    e: $data.latestNotice
  }, $data.latestNotice ? {
    f: common_vendor.t($data.latestNotice.title),
    g: common_vendor.t($options.formatTime($data.latestNotice.createTime)),
    h: common_vendor.o((...args) => $options.goToNotice && $options.goToNotice(...args))
  } : {}, {
    i: !$data.latestNotice
  }, !$data.latestNotice ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
