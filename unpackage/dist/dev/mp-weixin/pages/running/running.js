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
      currentOrder: null,
      // 当前配送订单
      todayStats: {
        completedOrders: 8,
        todayEarnings: "125.50",
        rating: 4.9
      }
    };
  },
  onLoad() {
    this.loadCurrentOrder();
    this.loadTodayStats();
  },
  onShow() {
    this.loadCurrentOrder();
  },
  methods: {
    // 加载当前配送订单
    async loadCurrentOrder() {
      try {
        const result = await api_rider.getRiderOrders({
          page: 1,
          size: 1,
          status: 2
          // 配送中
        });
        if (result.data && result.data.records && result.data.records.length > 0) {
          const order = result.data.records[0];
          this.currentOrder = {
            id: order.id,
            pickupAddr: order.pickupAddr,
            deliveryAddr: order.deliveryAddr,
            contactName: order.contactName,
            contactPhone: order.contactPhone,
            goodsDesc: order.goodsDesc
          };
        } else {
          this.currentOrder = null;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/running/running.vue:159", "获取当前订单失败:", error);
        this.currentOrder = null;
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
        common_vendor.index.__f__("error", "at pages/running/running.vue:179", "获取统计数据失败:", error);
      }
    },
    // 拨打电话
    makeCall() {
      if (!this.currentOrder)
        return;
      common_vendor.index.makePhoneCall({
        phoneNumber: this.currentOrder.contactPhone
      });
    },
    // 完成配送
    async handleFinish() {
      if (!this.currentOrder)
        return;
      common_vendor.index.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.confirmFinish(tempFilePath);
        }
      });
    },
    // 确认完成
    async confirmFinish(imagePath) {
      try {
        common_vendor.index.showLoading({ title: "上传中...", mask: true });
        const finishImg = imagePath;
        await api_rider.finishOrder({
          orderId: this.currentOrder.id,
          finishImg
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "配送完成",
          icon: "success"
        });
        setTimeout(() => {
          this.loadCurrentOrder();
          this.loadTodayStats();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/running/running.vue:234", "完成配送失败:", error);
      }
    },
    // 完成订单（跳转到上传图片页面）
    finishOrder() {
      if (!this.currentOrder)
        return;
      const orderInfo = encodeURIComponent(JSON.stringify({
        deliveryAddr: this.currentOrder.deliveryAddr
      }));
      common_vendor.index.navigateTo({
        url: `/pages/upload-finish/upload-finish?orderId=${this.currentOrder.id}&orderInfo=${orderInfo}`
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
    b: $data.currentOrder
  }, $data.currentOrder ? {
    c: common_vendor.t($data.currentOrder.pickupAddr),
    d: common_vendor.t($data.currentOrder.deliveryAddr),
    e: common_vendor.t($data.currentOrder.contactName),
    f: common_vendor.t($data.currentOrder.contactPhone),
    g: common_vendor.o((...args) => $options.makeCall && $options.makeCall(...args)),
    h: common_vendor.o((...args) => $options.finishOrder && $options.finishOrder(...args))
  } : {
    i: common_vendor.o((...args) => $options.goToHall && $options.goToHall(...args))
  }, {
    j: common_vendor.t($data.todayStats.completedOrders || 0),
    k: common_vendor.t($data.todayStats.todayEarnings || 0),
    l: common_vendor.t($data.todayStats.rating || 5)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f47c4c53"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/running/running.js.map
