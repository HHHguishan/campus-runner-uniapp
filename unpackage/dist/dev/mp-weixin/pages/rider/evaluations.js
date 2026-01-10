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
      activeRating: null,
      // null=全部, 1-5星
      evaluationList: [],
      loading: false,
      refreshing: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10
    };
  },
  onLoad() {
    this.loadEvaluations();
  },
  methods: {
    /**
     * 切换评分筛选
     */
    switchRating(rating) {
      this.activeRating = rating;
      this.currentPage = 1;
      this.evaluationList = [];
      this.hasMore = true;
      this.loadEvaluations();
    },
    /**
     * 加载评价列表
     */
    async loadEvaluations() {
      if (this.loading)
        return;
      try {
        this.loading = true;
        const params = {
          type: "received",
          // 收到的评价
          page: this.currentPage,
          size: this.pageSize
        };
        if (this.activeRating !== null) {
          params.rating = this.activeRating;
        }
        const result = await api_rider.getRiderEvaluations(params);
        if (result.code === 200 && result.data) {
          const newEvaluations = result.data.records || [];
          if (this.currentPage === 1) {
            this.evaluationList = newEvaluations;
          } else {
            this.evaluationList = [...this.evaluationList, ...newEvaluations];
          }
          this.hasMore = newEvaluations.length >= this.pageSize;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/rider/evaluations.vue:228", "获取评价列表失败:", error);
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
      this.loadEvaluations();
    },
    /**
     * 下拉刷新
     */
    onRefresh() {
      this.refreshing = true;
      this.currentPage = 1;
      this.loadEvaluations();
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
     * 获取服务类型名称
     */
    getServiceTypeName(type) {
      const types = {
        1: "帮买",
        2: "帮送",
        3: "帮取",
        4: "全能"
      };
      return types[type] || "未知";
    },
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time)
        return "-";
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
      ["current-page"]: "evaluations"
    }),
    b: $data.activeRating === null ? 1 : "",
    c: common_vendor.o(($event) => $options.switchRating(null)),
    d: $data.activeRating === 5 ? 1 : "",
    e: common_vendor.o(($event) => $options.switchRating(5)),
    f: $data.activeRating === 4 ? 1 : "",
    g: common_vendor.o(($event) => $options.switchRating(4)),
    h: $data.activeRating === 3 ? 1 : "",
    i: common_vendor.o(($event) => $options.switchRating(3)),
    j: $data.activeRating === 2 ? 1 : "",
    k: common_vendor.o(($event) => $options.switchRating(2)),
    l: $data.activeRating === 1 ? 1 : "",
    m: common_vendor.o(($event) => $options.switchRating(1)),
    n: $data.evaluationList.length > 0
  }, $data.evaluationList.length > 0 ? {
    o: common_vendor.f($data.evaluationList, (evaluation, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(evaluation.userName ? evaluation.userName.substring(0, 1) : "用"),
        b: common_vendor.t(evaluation.userName || "用户"),
        c: common_vendor.t($options.formatTime(evaluation.evaluationTime)),
        d: common_vendor.f(5, (star, index, i1) => {
          return {
            a: common_vendor.t(index < evaluation.rating ? "★" : "☆"),
            b: index
          };
        }),
        e: common_vendor.t(evaluation.rating),
        f: $options.getTags(evaluation.feedback).length > 0
      }, $options.getTags(evaluation.feedback).length > 0 ? {
        g: common_vendor.f($options.getTags(evaluation.feedback), (tag, index, i1) => {
          return {
            a: common_vendor.t(tag),
            b: index
          };
        })
      } : {}, {
        h: common_vendor.t($options.getFeedbackText(evaluation.feedback)),
        i: common_vendor.t(evaluation.orderNo),
        j: common_vendor.t($options.getServiceTypeName(evaluation.serviceType)),
        k: evaluation.riderReply
      }, evaluation.riderReply ? {
        l: common_vendor.t($options.formatTime(evaluation.replyTime)),
        m: common_vendor.t(evaluation.riderReply)
      } : {
        n: common_vendor.o(($event) => $options.replyEvaluation(evaluation.orderId), evaluation.orderId)
      }, {
        o: evaluation.orderId
      });
    })
  } : {}, {
    p: $data.evaluationList.length > 0
  }, $data.evaluationList.length > 0 ? common_vendor.e({
    q: $data.loading
  }, $data.loading ? {} : $data.hasMore ? {} : {}, {
    r: $data.hasMore
  }) : {}, {
    s: $data.evaluationList.length === 0 && !$data.loading
  }, $data.evaluationList.length === 0 && !$data.loading ? {} : {}, {
    t: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    v: $data.refreshing,
    w: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd3c76e6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/rider/evaluations.js.map
