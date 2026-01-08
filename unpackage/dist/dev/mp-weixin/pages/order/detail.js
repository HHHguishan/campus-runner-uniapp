"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      riderInfo: null,
      orderStatus: 0
      // 0-待支付, 1-待接单, 2-配送中, 3-已完成, 4-已取消
    };
  },
  onLoad(options) {
    if (options.id) {
      this.orderId = options.id;
      this.loadOrderDetail();
    }
  },
  onShow() {
    if (this.orderId) {
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
          this.orderStatus = res.data.status || 0;
          if (res.data.runnerInfo) {
            this.riderInfo = res.data.runnerInfo;
          }
          common_vendor.index.__f__("log", "at pages/order/detail.vue:244", "✅ 订单详情加载成功:", this.orderInfo);
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/order/detail.vue:253", "❌ 加载订单详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 获取状态图标
     */
    getStatusIcon(status) {
      const icons = {
        0: "💳",
        // 待支付
        1: "⏰",
        // 待接单
        2: "🚚",
        // 配送中
        3: "✅",
        // 已完成
        4: "❌"
        // 已取消
      };
      return icons[status] || "📦";
    },
    /**
     * 获取状态标题
     */
    getStatusTitle(status) {
      const titles = {
        0: "待支付",
        1: "等待接单",
        2: "配送中",
        3: "已完成",
        4: "已取消"
      };
      return titles[status] || "未知状态";
    },
    /**
     * 获取状态描述
     */
    getStatusDesc(status) {
      const descs = {
        0: "请在30分钟内完成支付",
        1: "正在为您匹配合适的骑手",
        2: "骑手正在火速配送中",
        3: "订单已完成",
        4: "订单已取消"
      };
      return descs[status] || "";
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
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    },
    /**
     * 复制订单号
     */
    copyOrderNo() {
      if (!this.orderInfo || !this.orderInfo.orderNo)
        return;
      common_vendor.index.setClipboardData({
        data: this.orderInfo.orderNo,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        }
      });
    },
    /**
     * 联系骑手
     */
    contactRider() {
      if (!this.riderInfo)
        return;
      common_vendor.index.showActionSheet({
        itemList: ["拨打电话"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.callRider();
          }
        }
      });
    },
    /**
     * 拨打骑手电话
     */
    callRider() {
      if (!this.riderInfo || !this.riderInfo.phone) {
        common_vendor.index.showToast({
          title: "暂无联系方式",
          icon: "none"
        });
        return;
      }
      common_vendor.index.makePhoneCall({
        phoneNumber: this.riderInfo.phone
      });
    },
    /**
     * 取消订单
     */
    cancelOrder() {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消这个订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "取消中..." });
              const result = await api_order.cancelOrder({
                orderId: this.orderId,
                cancelReason: "用户主动取消"
              });
              common_vendor.index.hideLoading();
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                this.loadOrderDetail();
              } else {
                common_vendor.index.showToast({
                  title: result.message || "取消失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/order/detail.vue:413", "❌ 取消订单失败:", error);
              common_vendor.index.showToast({
                title: "取消失败，请稍后重试",
                icon: "none"
              });
            }
          }
        }
      });
    },
    /**
     * 去支付
     */
    goToPay() {
      common_vendor.index.navigateTo({
        url: `/pages/order/payment?orderId=${this.orderId}&totalAmount=${this.orderInfo.totalAmount}`
      });
    },
    /**
     * 去评价
     */
    goToEvaluate() {
      common_vendor.index.navigateTo({
        url: `/pages/evaluation/create?orderId=${this.orderId}`
      });
    },
    /**
     * 查看评价
     */
    viewEvaluation() {
      common_vendor.index.showToast({
        title: "查看评价功能开发中",
        icon: "none"
      });
    },
    /**
     * 更多菜单
     */
    showMoreMenu() {
      common_vendor.index.showActionSheet({
        itemList: ["复制订单号", "联系客服"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.copyOrderNo();
          } else if (res.tapIndex === 1) {
            common_vendor.index.showToast({
              title: "客服功能开发中",
              icon: "none"
            });
          }
        }
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
  var _a;
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.o((...args) => $options.showMoreMenu && $options.showMoreMenu(...args)),
    c: common_vendor.t($options.getStatusIcon($data.orderStatus)),
    d: common_vendor.t($options.getStatusTitle($data.orderStatus)),
    e: common_vendor.t($options.getStatusDesc($data.orderStatus)),
    f: common_vendor.n("status-" + $data.orderStatus),
    g: $data.orderInfo && $data.orderInfo.serviceType
  }, $data.orderInfo && $data.orderInfo.serviceType ? {
    h: common_vendor.t($options.formatTime($data.orderInfo.createTime)),
    i: $data.orderStatus >= 1 ? 1 : "",
    j: common_vendor.t($data.orderInfo.acceptTime ? $options.formatTime($data.orderInfo.acceptTime) : "等待接单"),
    k: $data.orderStatus >= 2 ? 1 : "",
    l: common_vendor.t($data.orderInfo.deliveryTime ? $options.formatTime($data.orderInfo.deliveryTime) : "配送中"),
    m: $data.orderStatus >= 3 ? 1 : "",
    n: common_vendor.t($data.orderInfo.completeTime ? $options.formatTime($data.orderInfo.completeTime) : "等待完成"),
    o: $data.orderStatus >= 4 ? 1 : ""
  } : {}, {
    p: $data.orderInfo
  }, $data.orderInfo ? common_vendor.e({
    q: common_vendor.t($data.orderInfo.orderNo || "-"),
    r: common_vendor.o((...args) => $options.copyOrderNo && $options.copyOrderNo(...args)),
    s: common_vendor.t($options.getServiceTypeName($data.orderInfo.serviceType)),
    t: common_vendor.t($data.orderInfo.goodsInfo || "-"),
    v: $data.orderInfo.remark
  }, $data.orderInfo.remark ? {
    w: common_vendor.t($data.orderInfo.remark)
  } : {}, {
    x: common_vendor.t($options.formatTime($data.orderInfo.createTime))
  }) : {}, {
    y: $data.orderInfo
  }, $data.orderInfo ? {
    z: common_vendor.t(((_a = $data.orderInfo.addressInfo) == null ? void 0 : _a.pickupAddress) || "-"),
    A: common_vendor.t($data.orderInfo.deliveryName),
    B: common_vendor.t($data.orderInfo.deliveryPhone),
    C: common_vendor.t($data.orderInfo.deliveryAddress || "-")
  } : {}, {
    D: $data.riderInfo
  }, $data.riderInfo ? common_vendor.e({
    E: common_vendor.t($data.riderInfo.realName ? $data.riderInfo.realName.substring(0, 1) : "骑"),
    F: common_vendor.t($data.riderInfo.realName || "骑手"),
    G: $data.riderInfo.averageRating
  }, $data.riderInfo.averageRating ? {
    H: common_vendor.t($data.riderInfo.averageRating.toFixed(1))
  } : {}, {
    I: common_vendor.o((...args) => $options.callRider && $options.callRider(...args))
  }) : {}, {
    J: $data.orderInfo
  }, $data.orderInfo ? {
    K: common_vendor.t($data.orderInfo.goodsAmount || "0.00"),
    L: common_vendor.t($data.orderInfo.deliveryFee || "0.00"),
    M: common_vendor.t($data.orderInfo.totalAmount || "0.00")
  } : {}, {
    N: $data.orderInfo
  }, $data.orderInfo ? common_vendor.e({
    O: $data.orderStatus === 0
  }, $data.orderStatus === 0 ? {
    P: common_vendor.o((...args) => $options.cancelOrder && $options.cancelOrder(...args)),
    Q: common_vendor.o((...args) => $options.goToPay && $options.goToPay(...args))
  } : {}, {
    R: $data.orderStatus === 1
  }, $data.orderStatus === 1 ? {
    S: common_vendor.o((...args) => $options.cancelOrder && $options.cancelOrder(...args))
  } : {}, {
    T: $data.orderStatus === 2
  }, $data.orderStatus === 2 ? {
    U: common_vendor.o((...args) => $options.contactRider && $options.contactRider(...args))
  } : {}, {
    V: $data.orderStatus === 3 && !$data.orderInfo.hasEvaluated
  }, $data.orderStatus === 3 && !$data.orderInfo.hasEvaluated ? {
    W: common_vendor.o((...args) => $options.goToEvaluate && $options.goToEvaluate(...args))
  } : {}, {
    X: $data.orderStatus === 3 && $data.orderInfo.hasEvaluated
  }, $data.orderStatus === 3 && $data.orderInfo.hasEvaluated ? {
    Y: common_vendor.o((...args) => $options.viewEvaluation && $options.viewEvaluation(...args))
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
