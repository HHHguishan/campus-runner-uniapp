"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_rider = require("../../api/rider.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      evaluationInfo: null,
      replyContent: "",
      quickReplies: [
        "感谢您的好评，期待再次为您服务！",
        "谢谢您的认可，我会继续努力的！",
        "感谢您的评价，祝您生活愉快！",
        "非常感谢您的理解与支持！",
        "您的满意就是我们最大的动力！"
      ]
    };
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
      this.loadEvaluation();
    }
  },
  methods: {
    /**
     * 加载评价信息
     */
    async loadEvaluation() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_order.getEvaluationDetail(this.orderId);
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data) {
          this.evaluationInfo = res.data;
        } else {
          common_vendor.index.showToast({
            title: "评价信息不存在",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/rider/reply.vue:140", "加载评价失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      }
    },
    /**
     * 从评价内容中提取标签
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
     * 获取纯文本评价内容
     */
    getFeedbackText() {
      if (!this.evaluationInfo || !this.evaluationInfo.feedback)
        return "";
      let feedback = this.evaluationInfo.feedback;
      feedback = feedback.replace(/\[.*?\]\s*/, "");
      return feedback.trim();
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
     * 选择快捷回复
     */
    selectQuickReply(quick) {
      this.replyContent = quick;
    },
    /**
     * 提交回复
     */
    async submitReply() {
      const content = this.replyContent.trim();
      if (!content) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中...", mask: true });
        await api_rider.submitRiderReply({
          orderId: Number(this.orderId),
          riderReply: content
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/rider/reply.vue:232", "回复失败:", error);
        common_vendor.index.showToast({
          title: error.message || "回复失败，请重试",
          icon: "none"
        });
      }
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
    b: $data.evaluationInfo
  }, $data.evaluationInfo ? common_vendor.e({
    c: common_vendor.f(5, (star, index, i0) => {
      return {
        a: common_vendor.t(index < $data.evaluationInfo.rating ? "★" : "☆"),
        b: index
      };
    }),
    d: $options.getTags().length > 0
  }, $options.getTags().length > 0 ? {
    e: common_vendor.f($options.getTags(), (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {}, {
    f: common_vendor.t($options.getFeedbackText()),
    g: common_vendor.t($options.formatTime($data.evaluationInfo.evaluationTime))
  }) : {}, {
    h: common_vendor.t($data.replyContent.length),
    i: $data.replyContent,
    j: common_vendor.o(($event) => $data.replyContent = $event.detail.value),
    k: common_vendor.f($data.quickReplies, (quick, index, i0) => {
      return {
        a: common_vendor.t(quick),
        b: index,
        c: common_vendor.o(($event) => $options.selectQuickReply(quick), index)
      };
    }),
    l: common_vendor.o((...args) => $options.submitReply && $options.submitReply(...args)),
    m: !$data.replyContent.trim()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1021cc0b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/rider/reply.js.map
