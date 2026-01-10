"use strict";
const common_vendor = require("../../common/vendor.js");
const api_rider = require("../../api/rider.js");
const RiderNav = () => "../../components/rider-nav/rider-nav.js";
const _sfc_main = {
  components: {
    RiderNav
  },
  data() {
    return {
      filterType: "distance",
      // distance, price, all
      orderList: [],
      loading: false
    };
  },
  onLoad() {
    this.loadOrders();
  },
  onPullDownRefresh() {
    this.loadOrders();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    // 加载订单列表
    async loadOrders() {
      if (this.loading)
        return;
      try {
        this.loading = true;
        const result = await api_rider.getRiderOrders({
          page: 1,
          size: 20,
          status: 1
          // 待接单
        });
        if (result.data && result.data.records) {
          this.orderList = result.data.records.map((order) => ({
            id: order.orderId || order.id,
            type: order.serviceType || order.type,
            typeText: this.getTypeText(order.serviceType || order.type),
            pickupAddr: order.pickupAddr || order.addressInfo && order.addressInfo.pickupAddress || "",
            deliveryAddr: order.deliveryAddr || order.addressInfo && order.addressInfo.deliveryAddress || "",
            distance: order.distance || 0,
            runnerFee: order.runnerFee || order.totalAmount,
            goodsDesc: order.goodsDesc || order.goodsInfo,
            createTime: this.formatTime(order.createTime)
          }));
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/hall/hall.vue:148", "获取订单列表失败:", error);
        this.orderList = [];
      } finally {
        this.loading = false;
      }
    },
    // 获取订单类型文本
    getTypeText(type) {
      const typeMap = {
        1: "帮买",
        2: "帮送",
        3: "帮取",
        4: "全能"
      };
      return typeMap[type] || "未知";
    },
    // 格式化时间
    formatTime(time) {
      if (!time)
        return "";
      const now = /* @__PURE__ */ new Date();
      const createTime = new Date(time);
      const diff = Math.floor((now - createTime) / 1e3 / 60);
      if (diff < 1)
        return "刚刚";
      if (diff < 60)
        return `${diff}分钟前`;
      if (diff < 1440)
        return `${Math.floor(diff / 60)}小时前`;
      return `${Math.floor(diff / 1440)}天前`;
    },
    // 设置筛选类型
    setFilter(type) {
      this.filterType = type;
      this.loadOrders();
    },
    // 接单
    async grabOrder(orderId) {
      common_vendor.index.showModal({
        title: "确认接单",
        content: "确定要接这个订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "接单中...", mask: true });
              await api_rider.grabOrder(orderId);
              common_vendor.index.hideLoading();
              common_vendor.index.showToast({
                title: "接单成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.redirectTo({
                  url: "/pages/running/running"
                });
              }, 1500);
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/hall/hall.vue:215", "接单失败:", error);
            }
          }
        }
      });
    },
    // 查看订单详情
    goToOrderDetail(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    }
  }
};
if (!Array) {
  const _easycom_rider_nav2 = common_vendor.resolveComponent("rider-nav");
  _easycom_rider_nav2();
}
const _easycom_rider_nav = () => "../../components/rider-nav/rider-nav.js";
if (!Math) {
  _easycom_rider_nav();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      ["current-page"]: "hall"
    }),
    b: $data.filterType === "distance" ? 1 : "",
    c: common_vendor.o(($event) => $options.setFilter("distance")),
    d: $data.filterType === "price" ? 1 : "",
    e: common_vendor.o(($event) => $options.setFilter("price")),
    f: $data.filterType === "all" ? 1 : "",
    g: common_vendor.o(($event) => $options.setFilter("all")),
    h: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? {
    i: common_vendor.f($data.orderList, (order, k0, i0) => {
      return {
        a: common_vendor.t(order.typeText),
        b: common_vendor.n("type-" + order.type),
        c: common_vendor.t(order.runnerFee),
        d: common_vendor.t(order.pickupAddr),
        e: common_vendor.t(order.deliveryAddr),
        f: common_vendor.t(order.distance),
        g: common_vendor.t(order.createTime),
        h: common_vendor.t(order.goodsDesc),
        i: common_vendor.o(($event) => $options.grabOrder(order.id), order.id),
        j: order.id,
        k: common_vendor.o(($event) => $options.goToOrderDetail(order.id), order.id)
      };
    })
  } : {}, {
    j: common_vendor.o((...args) => $options.loadOrders && $options.loadOrders(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3c9f9764"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/hall/hall.js.map
