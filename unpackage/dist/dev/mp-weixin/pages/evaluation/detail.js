"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      evaluationInfo: null,
      orderInfo: null,
      userInfo: {},
      loading: true
    };
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
      this.loadEvaluationDetail();
    }
  },
  methods: {
    /**
     * 加载评价详情
     */
    async loadEvaluationDetail() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const [evalRes, orderRes] = await Promise.all([
          api_order.getEvaluationDetail(this.orderId),
          api_order.getOrderDetail(this.orderId)
        ]);
        common_vendor.index.hideLoading();
        this.loading = false;
        if (evalRes.code === 200 && evalRes.data) {
          this.evaluationInfo = evalRes.data;
          this.userInfo = evalRes.data.userInfo || {};
          common_vendor.index.__f__("log", "at pages/evaluation/detail.vue:134", "✅ 评价详情加载成功:", this.evaluationInfo);
          common_vendor.index.__f__("log", "at pages/evaluation/detail.vue:135", "📝 评价内容:", this.getFeedbackText());
          common_vendor.index.__f__("log", "at pages/evaluation/detail.vue:136", "🏷️ 评价标签:", this.getTags());
        } else {
          this.evaluationInfo = null;
        }
        if (orderRes.code === 200 && orderRes.data) {
          this.orderInfo = orderRes.data;
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        this.loading = false;
        common_vendor.index.__f__("error", "at pages/evaluation/detail.vue:149", "❌ 加载评价详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 获取评分文字
     */
    getRatingText(rating) {
      const texts = {
        1: "非常不满意",
        2: "不满意",
        3: "一般",
        4: "满意",
        5: "非常满意"
      };
      return texts[rating] || "";
    },
    /**
     * 获取服务类型名称
     */
    getServiceTypeName(type) {
      const types = {
        1: "帮我买",
        2: "帮我送",
        3: "帮我取",
        4: "全能"
      };
      return types[type] || "-";
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
     * 从评价内容中提取标签
     * 评价格式: [标签1, 标签2] 评价内容
     */
    getTags() {
      if (!this.evaluationInfo || !this.evaluationInfo.feedback)
        return [];
      const feedback = this.evaluationInfo.feedback;
      const tagMatch = feedback.match(/\[(.*?)\]/);
      if (tagMatch && tagMatch[1]) {
        return tagMatch[1].split(",").map((tag) => tag.trim()).filter((tag) => tag);
      }
      return [];
    },
    /**
     * 获取纯文本评价内容（去除标签）
     */
    getFeedbackText() {
      if (!this.evaluationInfo || !this.evaluationInfo.feedback)
        return "";
      let feedback = this.evaluationInfo.feedback;
      feedback = feedback.replace(/\[.*?\]\s*/, "");
      return feedback.trim();
    },
    /**
     * 返回上一页
     */
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.loading
  }, $data.loading ? {} : !$data.evaluationInfo ? {} : common_vendor.e({
    d: common_vendor.t($data.userInfo.nickname ? $data.userInfo.nickname.substring(0, 1) : "用"),
    e: common_vendor.t($data.userInfo.nickname || "用户"),
    f: common_vendor.t($options.formatTime($data.evaluationInfo.evaluationTime)),
    g: common_vendor.f(5, (star, index, i0) => {
      return {
        a: common_vendor.t(index < $data.evaluationInfo.rating ? "★" : "☆"),
        b: index
      };
    }),
    h: common_vendor.t($options.getRatingText($data.evaluationInfo.rating)),
    i: $options.getTags().length > 0
  }, $options.getTags().length > 0 ? {
    j: common_vendor.f($options.getTags(), (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {}, {
    k: common_vendor.t($options.getFeedbackText()),
    l: $data.evaluationInfo.orderInfo
  }, $data.evaluationInfo.orderInfo ? {
    m: common_vendor.t($data.evaluationInfo.orderNo || "-"),
    n: common_vendor.t($options.getServiceTypeName($data.evaluationInfo.orderInfo.type)),
    o: common_vendor.t($options.formatTime($data.evaluationInfo.orderInfo.finishTime))
  } : {}), {
    c: !$data.evaluationInfo
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6aef4876"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/evaluation/detail.js.map
