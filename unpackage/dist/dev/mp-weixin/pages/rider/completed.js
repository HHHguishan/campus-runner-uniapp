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
      activeTab: "all",
      // all, rated, unrated
      orderList: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10
    };
  },
  onLoad() {
    this.loadOrders();
  },
  onShow() {
    if (this.orderList.length > 0) {
      this.refreshList();
    }
  },
  methods: {
    /**
     * 切换标签
     */
    switchTab(tab) {
      this.activeTab = tab;
      this.currentPage = 1;
      this.orderList = [];
      this.hasMore = true;
      this.loadOrders();
    },
    /**
     * 加载订单列表
     */
    async loadOrders() {
      if (this.loading)
        return;
      try {
        this.loading = true;
        const currentMode = common_vendor.index.getStorageSync("currentMode") || 1;
        common_vendor.index.__f__("log", "at pages/rider/completed.vue:203", "🔍 当前模式:", currentMode, "(1=用户模式, 2=骑手模式)");
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          status: 3
          // 已完成
        };
        if (this.activeTab === "rated") {
          params.hasRating = true;
        } else if (this.activeTab === "unrated") {
          params.hasRating = false;
        }
        common_vendor.index.__f__("log", "at pages/rider/completed.vue:221", "📋 请求参数:", params);
        const result = await api_rider.getRiderOrders(params);
        if (result.data && result.data.records) {
          const newOrders = result.data.records.map((order) => ({
            id: order.orderId || order.id,
            orderNo: order.orderNo,
            type: order.serviceType || order.type,
            goodsDesc: order.goodsDesc,
            pickupAddr: order.pickupAddr,
            deliveryAddr: order.deliveryAddr,
            runnerFee: order.runnerFee || order.totalAmount,
            finishTime: order.finishTime || order.completeTime,
            rating: order.rating,
            feedback: order.feedback,
            riderReply: order.riderReply
          }));
          if (this.currentPage === 1) {
            this.orderList = newOrders;
          } else {
            this.orderList = [...this.orderList, ...newOrders];
          }
          this.hasMore = newOrders.length >= this.pageSize;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/rider/completed.vue:251", "获取订单列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading)
        return;
      this.currentPage++;
      this.loadOrders();
    },
    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true;
      this.currentPage = 1;
      this.loadOrders();
    },
    /**
     * 刷新列表
     */
    refreshList() {
      this.currentPage = 1;
      this.loadOrders();
    },
    /**
     * 获取订单类型图标
     */
    getTypeIcon(type) {
      const icons = {
        1: "🛒",
        2: "📦",
        3: "📬",
        4: "🚀"
      };
      return icons[type] || "📦";
    },
    /**
     * 获取订单类型名称
     */
    getTypeName(type) {
      const names = {
        1: "帮买",
        2: "帮送",
        3: "帮取",
        4: "全能"
      };
      return names[type] || "未知";
    },
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time)
        return "-";
      const date = new Date(time);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    },
    /**
     * 从评价内容中提取标签
     */
    getTags(feedback) {
      if (!feedback)
        return [];
      const tagMatch = feedback.match(/\[(.*?)\]/);
      if (tagMatch && tagMatch[1]) {
        return tagMatch[1].split(",").map((tag) => tag.trim()).filter((tag) => tag);
      }
      return [];
    },
    /**
     * 获取纯文本评价内容
     */
    getFeedbackText(feedback) {
      if (!feedback)
        return "";
      return feedback.replace(/\[.*?\]\s*/, "").trim();
    },
    /**
     * 查看订单详情
     */
    goToDetail(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    },
    /**
     * 回复评价
     */
    replyEvaluation(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/rider/reply?orderId=${orderId}`
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
      ["current-page"]: "completed"
    }),
    b: $data.activeTab === "all" ? 1 : "",
    c: common_vendor.o(($event) => $options.switchTab("all")),
    d: $data.activeTab === "rated" ? 1 : "",
    e: common_vendor.o(($event) => $options.switchTab("rated")),
    f: $data.activeTab === "unrated" ? 1 : "",
    g: common_vendor.o(($event) => $options.switchTab("unrated")),
    h: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? {
    i: common_vendor.f($data.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
        b: common_vendor.t($options.getTypeIcon(order.type)),
        c: common_vendor.t($options.getTypeName(order.type)),
        d: common_vendor.t(order.goodsDesc),
        e: common_vendor.t(order.pickupAddr),
        f: common_vendor.t(order.deliveryAddr),
        g: common_vendor.t($options.formatTime(order.finishTime)),
        h: common_vendor.t(order.runnerFee),
        i: order.rating
      }, order.rating ? common_vendor.e({
        j: common_vendor.f(5, (star, index, i1) => {
          return {
            a: common_vendor.t(index < order.rating ? "★" : "☆"),
            b: index
          };
        }),
        k: order.feedback
      }, order.feedback ? {
        l: common_vendor.t($options.getFeedbackText(order.feedback))
      } : {}, {
        m: $options.getTags(order.feedback).length > 0
      }, $options.getTags(order.feedback).length > 0 ? {
        n: common_vendor.f($options.getTags(order.feedback), (tag, index, i1) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        o: order.riderReply
      }, order.riderReply ? {
        p: common_vendor.t(order.riderReply)
      } : {}, {
        q: !order.riderReply
      }, !order.riderReply ? {
        r: common_vendor.o(($event) => $options.replyEvaluation(order.id), order.id)
      } : {}) : {}, {
        s: order.id,
        t: common_vendor.o(($event) => $options.goToDetail(order.id), order.id)
      });
    })
  } : {}, {
    j: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? common_vendor.e({
    k: $data.loading
  }, $data.loading ? {} : $data.hasMore ? {} : {}, {
    l: $data.hasMore
  }) : {}, {
    m: $data.orderList.length === 0 && !$data.loading
  }, $data.orderList.length === 0 && !$data.loading ? {} : {}, {
    n: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    o: $data.refreshing,
    p: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-456eccc7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/rider/completed.js.map
