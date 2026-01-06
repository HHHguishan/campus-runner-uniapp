"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      recentOrders: [
        // 示例数据，后续从接口获取
        {
          id: 1,
          typeText: "帮买",
          status: 1,
          statusText: "待接单",
          address: "奶茶店 → 5号楼302",
          time: "10分钟前",
          price: "8.00"
        }
      ]
    };
  },
  methods: {
    // 跳转到发布订单页面
    navigateToPublish(type) {
      common_vendor.index.showToast({
        title: "发布订单功能开发中...",
        icon: "none"
      });
    },
    // 跳转到订单列表
    goToOrders() {
      common_vendor.index.switchTab({
        url: "/pages/orders/orders"
      });
    },
    // 跳转到订单详情
    goToOrderDetail(orderId) {
      common_vendor.index.showToast({
        title: "订单详情功能开发中...",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o(($event) => $options.navigateToPublish("buy")),
    b: common_vendor.o(($event) => $options.navigateToPublish("send")),
    c: common_vendor.o(($event) => $options.navigateToPublish("fetch")),
    d: common_vendor.o(($event) => $options.navigateToPublish("all")),
    e: common_vendor.o(($event) => $options.navigateToPublish("all")),
    f: $data.recentOrders.length > 0
  }, $data.recentOrders.length > 0 ? {
    g: common_vendor.o((...args) => $options.goToOrders && $options.goToOrders(...args)),
    h: common_vendor.f($data.recentOrders, (order, k0, i0) => {
      return {
        a: common_vendor.t(order.typeText),
        b: common_vendor.t(order.statusText),
        c: common_vendor.n("status-" + order.status),
        d: common_vendor.t(order.address),
        e: common_vendor.t(order.time),
        f: common_vendor.t(order.price),
        g: order.id,
        h: common_vendor.o(($event) => $options.goToOrderDetail(order.id), order.id)
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
