"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      riderInfo: null,
      rating: 5,
      // 默认5星
      comment: "",
      selectedTags: [],
      evaluationTags: [
        "配送速度快",
        "服务态度好",
        "物品完好",
        "沟通顺畅",
        "准时送达",
        "包装仔细",
        "值得信赖",
        "下次还会找你"
      ]
    };
  },
  computed: {
    canSubmit() {
      return this.rating > 0 && this.comment.trim().length > 0;
    }
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
      this.loadOrderDetail();
    }
  },
  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_order.getOrderDetail(this.orderId);
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data) {
          this.orderInfo = res.data;
          if (res.data.runnerInfo) {
            this.riderInfo = res.data.runnerInfo;
          }
          common_vendor.index.__f__("log", "at pages/evaluation/create.vue:146", "✅ 订单详情加载成功:", this.orderInfo);
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/evaluation/create.vue:155", "❌ 加载订单详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 选择评分
     */
    selectStar(star) {
      this.rating = star;
    },
    /**
     * 获取评分文字
     */
    getRatingText() {
      const texts = {
        1: "非常不满意",
        2: "不满意",
        3: "一般",
        4: "满意",
        5: "非常满意"
      };
      return texts[this.rating] || "";
    },
    /**
     * 切换标签
     */
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        if (this.selectedTags.length < 5) {
          this.selectedTags.push(tag);
        } else {
          common_vendor.index.showToast({
            title: "最多选择5个标签",
            icon: "none"
          });
        }
      }
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
     * 提交评价
     */
    async submitEvaluation() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "请完善评价内容",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        let feedback = this.comment.trim();
        if (this.selectedTags.length > 0) {
          feedback = `[${this.selectedTags.join(", ")}] ${feedback}`;
        }
        const data = {
          orderId: Number(this.orderId),
          rating: this.rating,
          feedback,
          evaluationImgs: [],
          anonymous: false
        };
        common_vendor.index.__f__("log", "at pages/evaluation/create.vue:245", "提交评价数据:", data);
        const res = await api_order.submitEvaluation(data);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "评价成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: `/pages/evaluation/detail?orderId=${this.orderId}`
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || "提交失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/evaluation/create.vue:271", "❌ 提交评价失败:", error);
        common_vendor.index.showToast({
          title: "提交失败，请稍后重试",
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
    b: $data.orderInfo
  }, $data.orderInfo ? {
    c: common_vendor.t($data.orderInfo.orderNo || "-"),
    d: common_vendor.t($options.getServiceTypeName($data.orderInfo.serviceType))
  } : {}, {
    e: $data.riderInfo
  }, $data.riderInfo ? {
    f: common_vendor.t($data.riderInfo.realName ? $data.riderInfo.realName.substring(0, 1) : "骑"),
    g: common_vendor.t($data.riderInfo.realName || "骑手")
  } : {}, {
    h: common_vendor.f(5, (star, index, i0) => {
      return {
        a: common_vendor.t(index < $data.rating ? "★" : "☆"),
        b: index,
        c: common_vendor.o(($event) => $options.selectStar(index + 1), index)
      };
    }),
    i: common_vendor.t($options.getRatingText()),
    j: common_vendor.f($data.evaluationTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: $data.selectedTags.includes(tag) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag(tag), index)
      };
    }),
    k: $data.comment,
    l: common_vendor.o(($event) => $data.comment = $event.detail.value),
    m: common_vendor.t($data.comment.length),
    n: common_vendor.o((...args) => $options.submitEvaluation && $options.submitEvaluation(...args)),
    o: !$options.canSubmit
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d86b04fa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/evaluation/create.js.map
