"use strict";
const common_vendor = require("../../common/vendor.js");
const api_rider = require("../../api/rider.js");
const utils_tracker = require("../../utils/tracker.js");
const RiderNav = () => "../../components/rider-nav/rider-nav.js";
const _sfc_main = {
  components: {
    RiderNav
  },
  data() {
    return {
      orderList: [],
      // 配送中的订单列表
      todayStats: {
        completedOrders: 0,
        todayEarnings: "0.00",
        rating: 5
      }
    };
  },
  onLoad() {
    this.loadOrderList();
    this.loadTodayStats();
  },
  onShow() {
    this.loadOrderList();
  },
  methods: {
    // 加载当前配送订单列表
    async loadOrderList() {
      try {
        const result = await api_rider.getRiderOrders({
          page: 1,
          size: 20,
          // 获取更多订单
          status: 2
          // 配送中
        });
        if (result.data && result.data.records) {
          this.orderList = result.data.records.map((order) => ({
            id: order.id,
            userId: order.userId,
            // 新增：用于聊天
            userName: order.userName,
            // 新增：用户名称
            userAvatar: order.userAvatar,
            // 新增：用于聊天
            pickupAddr: order.pickupAddr,
            deliveryAddr: order.deliveryAddr,
            contactName: order.contactName,
            contactPhone: order.contactPhone,
            goodsDesc: order.goodsDesc
          }));
          if (this.orderList.length > 0) {
            utils_tracker.riderTracker.checkAndStart();
          }
        } else {
          this.orderList = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/running/running.vue:173", "获取订单列表失败:", error);
        this.orderList = [];
      }
    },
    // 加载今日统计
    async loadTodayStats() {
      try {
        const result = await api_rider.getRiderDashboard();
        if (result.data) {
          this.todayStats = {
            completedOrders: result.data.todayCompletedOrders || 0,
            todayEarnings: result.data.todayIncome || "0.00",
            rating: result.data.averageRating || "5.0"
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/running/running.vue:193", "获取统计数据失败:", error);
      }
    },
    // 拨打电话
    makeCall(order) {
      if (!order)
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: order.contactPhone
      });
    },
    // 进入聊天页面
    goToChat(order) {
      if (!order || !order.userId) {
        common_vendor.index.showToast({ title: "无法获取用户信息", icon: "none" });
        return;
      }
      common_vendor.index.navigateTo({
        url: `/pages/chat/index?orderId=${order.id}&receiverId=${order.userId}&role=user&nickname=${encodeURIComponent(order.userName || "用户")}&avatar=${encodeURIComponent(order.userAvatar || "")}`
      });
    },
    // 完成订单（跳转到上传图片页面）
    finishOrder(order) {
      if (!order)
        return;
      const orderInfo = encodeURIComponent(JSON.stringify({
        deliveryAddr: order.deliveryAddr
      }));
      common_vendor.index.navigateTo({
        url: `/pages/upload-finish/upload-finish?orderId=${order.id}&orderInfo=${orderInfo}`
      });
    },
    // 前往接单大厅
    goToHall() {
      common_vendor.index.switchTab({
        url: "/pages/hall/hall"
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
      ["current-page"]: "running"
    }),
    b: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? {
    c: common_vendor.f($data.orderList, (order, k0, i0) => {
      return {
        a: common_vendor.t(order.id),
        b: common_vendor.t(order.pickupAddr),
        c: common_vendor.t(order.deliveryAddr),
        d: common_vendor.t(order.contactName),
        e: common_vendor.t(order.contactPhone),
        f: common_vendor.o(($event) => $options.makeCall(order), order.id),
        g: common_vendor.o(($event) => $options.goToChat(order), order.id),
        h: common_vendor.o(($event) => $options.finishOrder(order), order.id),
        i: order.id
      };
    })
  } : {
    d: common_vendor.o((...args) => $options.goToHall && $options.goToHall(...args))
  }, {
    e: common_vendor.t($data.todayStats.completedOrders || 0),
    f: common_vendor.t($data.todayStats.todayEarnings || 0),
    g: common_vendor.t($data.todayStats.rating || 5)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f47c4c53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/running/running.js.map
