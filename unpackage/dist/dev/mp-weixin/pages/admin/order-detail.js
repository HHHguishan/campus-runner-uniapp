"use strict";
const common_vendor = require("../../common/vendor.js");
const api_admin = require("../../api/admin.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderInfo: null
    };
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.loadOrderDetail();
    } else {
      common_vendor.index.showToast({
        title: "参数错误",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
  },
  methods: {
    /**
     * 加载订单详情
     */
    async loadOrderDetail() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        common_vendor.index.__f__("log", "at pages/admin/order-detail.vue:211", "📋 加载订单详情，订单ID：", this.orderId);
        const res = await api_admin.getAdminOrderDetail(this.orderId);
        common_vendor.index.__f__("log", "at pages/admin/order-detail.vue:214", "📋 订单详情响应：", res);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          this.orderInfo = res.data;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/admin/order-detail.vue:228", "❌ 加载订单详情失败：", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    },
    /**
     * 获取订单状态图标
     */
    getStatusIcon(status) {
      const iconMap = {
        0: "💰",
        1: "⏰",
        2: "🚚",
        3: "✅",
        4: "❌",
        5: "↩️"
      };
      return iconMap[status] || "📋";
    },
    /**
     * 获取订单状态文本
     */
    getStatusText(status) {
      const statusMap = {
        0: "待支付",
        1: "待接单",
        2: "配送中",
        3: "已完成",
        4: "已取消",
        5: "退款中"
      };
      return statusMap[status] || "未知状态";
    },
    /**
     * 获取订单状态描述
     */
    getStatusDesc(status) {
      const descMap = {
        0: "等待用户支付",
        1: "等待骑手接单",
        2: "骑手正在配送中",
        3: "订单已完成",
        4: "订单已取消",
        5: "正在处理退款"
      };
      return descMap[status] || "";
    },
    /**
     * 获取订单类型文本
     */
    getOrderTypeText(type) {
      const typeMap = {
        "buy": "帮买",
        "send": "帮送",
        "pick": "帮取",
        "all": "全能"
      };
      return typeMap[type] || type;
    },
    /**
     * 获取支付方式文本
     */
    getPayTypeText(payType) {
      if (!payType)
        return "-";
      const typeMap = {
        "BALANCE": "余额支付",
        "ALIPAY": "支付宝",
        "WECHAT": "微信支付"
      };
      return typeMap[payType] || payType;
    },
    /**
     * 格式化完整时间
     */
    formatFullTime(time) {
      if (!time)
        return "-";
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      const second = date.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    /**
     * 预览图片
     */
    previewImage(url) {
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
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
  }, $data.orderInfo ? common_vendor.e({
    c: common_vendor.t($options.getStatusIcon($data.orderInfo.status)),
    d: common_vendor.t($options.getStatusText($data.orderInfo.status)),
    e: common_vendor.t($options.getStatusDesc($data.orderInfo.status)),
    f: common_vendor.t($data.orderInfo.orderNo),
    g: common_vendor.t($options.getOrderTypeText($data.orderInfo.type)),
    h: common_vendor.n("type-" + $data.orderInfo.type),
    i: common_vendor.t($data.orderInfo.totalFee),
    j: common_vendor.t($data.orderInfo.deliveryFee),
    k: common_vendor.t($options.formatFullTime($data.orderInfo.createTime)),
    l: $data.orderInfo.payTime
  }, $data.orderInfo.payTime ? {
    m: common_vendor.t($options.formatFullTime($data.orderInfo.payTime))
  } : {}, {
    n: $data.orderInfo.grabTime
  }, $data.orderInfo.grabTime ? {
    o: common_vendor.t($options.formatFullTime($data.orderInfo.grabTime))
  } : {}, {
    p: $data.orderInfo.finishTime
  }, $data.orderInfo.finishTime ? {
    q: common_vendor.t($options.formatFullTime($data.orderInfo.finishTime))
  } : {}, {
    r: common_vendor.t($data.orderInfo.goodsDesc || "-"),
    s: common_vendor.t($data.orderInfo.goodsWeight || "-"),
    t: common_vendor.t($data.orderInfo.remark || "-"),
    v: common_vendor.t($data.orderInfo.userNickname || "-"),
    w: common_vendor.t($data.orderInfo.contactName || "-"),
    x: common_vendor.t($data.orderInfo.contactPhone || "-"),
    y: $data.orderInfo.runnerId
  }, $data.orderInfo.runnerId ? common_vendor.e({
    z: common_vendor.t($data.orderInfo.runnerNickname || "-"),
    A: common_vendor.t($data.orderInfo.runnerPhone || "-"),
    B: $data.orderInfo.evidenceImage
  }, $data.orderInfo.evidenceImage ? {
    C: $data.orderInfo.evidenceImage,
    D: common_vendor.o(($event) => $options.previewImage($data.orderInfo.evidenceImage))
  } : {}) : {}, {
    E: common_vendor.t($data.orderInfo.fetchAddress),
    F: common_vendor.t($data.orderInfo.deliveryAddress),
    G: $data.orderInfo.distance
  }, $data.orderInfo.distance ? {
    H: common_vendor.t($data.orderInfo.distance)
  } : {}, {
    I: $data.orderInfo.status > 0
  }, $data.orderInfo.status > 0 ? {
    J: common_vendor.t($options.getPayTypeText($data.orderInfo.payType)),
    K: common_vendor.t($data.orderInfo.totalFee)
  } : {}, {
    L: $data.orderInfo.status === 4 || $data.orderInfo.status === 5
  }, $data.orderInfo.status === 4 || $data.orderInfo.status === 5 ? {
    M: common_vendor.t($data.orderInfo.status === 4 ? "取消信息" : "退款信息"),
    N: common_vendor.t($data.orderInfo.status === 4 ? "取消原因" : "退款原因"),
    O: common_vendor.t($data.orderInfo.cancelReason || "-")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b6944249"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/order-detail.js.map
