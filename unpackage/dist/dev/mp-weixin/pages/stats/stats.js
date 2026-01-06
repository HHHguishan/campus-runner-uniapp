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
      totalIncome: "0.00",
      balance: "0.00",
      todayIncome: "0.00",
      totalOrders: 0,
      todayOrders: 0,
      rating: "5.0",
      completeRate: 100,
      overallRating: "5.0",
      totalEvaluations: 0,
      positiveRate: 100,
      records: [
        // 示例数据
        {
          id: 1,
          typeText: "订单收入",
          time: "10:30",
          amount: "8.00",
          income: true
        },
        {
          id: 2,
          typeText: "订单收入",
          time: "09:15",
          amount: "6.50",
          income: true
        }
      ]
    };
  },
  onLoad() {
    this.loadStats();
  },
  methods: {
    // 加载统计数据
    async loadStats() {
      try {
        const dashboardResult = await api_rider.getRiderDashboard();
        if (dashboardResult.data) {
          this.totalIncome = dashboardResult.data.monthlyIncome || "0.00";
          this.balance = dashboardResult.data.currentBalance || "0.00";
          this.todayIncome = dashboardResult.data.todayIncome || "0.00";
          this.totalOrders = dashboardResult.data.totalCompletedOrders || 0;
          this.todayOrders = dashboardResult.data.todayCompletedOrders || 0;
          this.rating = dashboardResult.data.averageRating || "5.0";
        }
        const orderStatsResult = await api_rider.getRiderOrderStats();
        if (orderStatsResult.data) {
          this.completeRate = orderStatsResult.data.completionRate || 100;
        }
        const evalResult = await api_rider.getRiderEvaluationStats();
        if (evalResult.data) {
          this.overallRating = evalResult.data.averageRating || "5.0";
          this.totalEvaluations = evalResult.data.totalEvaluations || 0;
          this.positiveRate = evalResult.data.positiveRate || 100;
        }
        this.records = [
          {
            id: 1,
            typeText: "订单收入",
            time: "10:30",
            amount: "8.00",
            income: true
          },
          {
            id: 2,
            typeText: "订单收入",
            time: "09:15",
            amount: "6.50",
            income: true
          }
        ];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/stats/stats.vue:203", "获取统计数据失败:", error);
      }
    },
    // 提现
    withdraw() {
      common_vendor.index.showToast({
        title: "提现功能开发中...",
        icon: "none"
      });
    },
    // 查看钱包
    goToWallet() {
      common_vendor.index.navigateTo({
        url: "/pages/wallet/wallet"
      });
    },
    // 查看评价
    goToEvaluations() {
      common_vendor.index.navigateTo({
        url: "/pages/evaluation/evaluation"
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
      ["current-page"]: "stats"
    }),
    b: common_vendor.o((...args) => $options.withdraw && $options.withdraw(...args)),
    c: common_vendor.t($data.totalIncome),
    d: common_vendor.t($data.balance),
    e: common_vendor.t($data.todayIncome),
    f: common_vendor.t($data.totalOrders),
    g: common_vendor.t($data.todayOrders),
    h: common_vendor.t($data.rating),
    i: common_vendor.t($data.completeRate),
    j: common_vendor.o((...args) => $options.goToWallet && $options.goToWallet(...args)),
    k: $data.records.length > 0
  }, $data.records.length > 0 ? {
    l: common_vendor.f($data.records, (record, k0, i0) => {
      return {
        a: common_vendor.t(record.typeText),
        b: common_vendor.t(record.time),
        c: common_vendor.t(record.income ? "+" : "-"),
        d: common_vendor.t(record.amount),
        e: common_vendor.n(record.income ? "income" : "expense"),
        f: record.id
      };
    })
  } : {}, {
    m: common_vendor.t($data.overallRating),
    n: common_vendor.t($data.totalEvaluations),
    o: common_vendor.t($data.positiveRate),
    p: common_vendor.o((...args) => $options.goToEvaluations && $options.goToEvaluations(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3598459f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/stats/stats.js.map
