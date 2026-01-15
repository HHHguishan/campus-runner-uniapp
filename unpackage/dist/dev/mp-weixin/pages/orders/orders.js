"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const _sfc_main = {
  data() {
    return {
      // 状态标签（与后端OrderStatusEnum保持一致）
      statusTabs: [
        { label: "全部", value: null, count: 0 },
        { label: "待支付", value: 0, count: 0 },
        { label: "待接单", value: 1, count: 0 },
        { label: "配送中", value: 2, count: 0 },
        { label: "已完成", value: 3, count: 0 },
        { label: "已取消", value: 4, count: 0 }
      ],
      activeTab: null,
      // 当前激活的标签
      orderList: [],
      // 订单列表
      loading: false,
      // 加载状态
      refreshing: false,
      // 刷新状态
      hasMore: true,
      // 是否有更多数据
      // 分页参数
      page: 1,
      size: 10
    };
  },
  onLoad(options) {
    common_vendor.index.setStorageSync("currentMode", 1);
    if (options.status !== void 0) {
      this.activeTab = Number(options.status);
    }
    this.loadOrderList();
  },
  onShow() {
    this.refreshList();
  },
  methods: {
    /**
     * 切换标签
     */
    switchTab(status) {
      this.activeTab = status;
      this.page = 1;
      this.orderList = [];
      this.hasMore = true;
      this.loadOrderList();
    },
    /**
     * 加载订单列表
     */
    async loadOrderList() {
      if (this.loading)
        return;
      try {
        this.loading = true;
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:203", "📥 开始加载订单列表");
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:204", "   - 页码:", this.page);
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:205", "   - 每页数量:", this.size);
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:206", "   - 状态筛选:", this.activeTab);
        const params = {
          page: this.page,
          size: this.size
        };
        if (this.activeTab !== null) {
          params.status = this.activeTab;
        }
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:218", "   - 请求参数:", JSON.stringify(params));
        const res = await api_order.getOrderList(params);
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:222", "📥 订单列表API响应:");
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:223", "   - 响应码:", res.code);
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:224", "   - 响应消息:", res.message);
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:225", "   - 响应数据:", JSON.stringify(res.data, null, 2));
        if (res.code === 200 && res.data) {
          const newList = res.data.records || [];
          common_vendor.index.__f__("log", "at pages/orders/orders.vue:230", "📊 解析订单列表:");
          common_vendor.index.__f__("log", "at pages/orders/orders.vue:231", "   - 记录总数:", res.data.total);
          common_vendor.index.__f__("log", "at pages/orders/orders.vue:232", "   - 当前页记录数:", newList.length);
          common_vendor.index.__f__("log", "at pages/orders/orders.vue:233", "   - 记录详情:", JSON.stringify(newList, null, 2));
          if (this.page === 1) {
            this.orderList = newList;
          } else {
            this.orderList = [...this.orderList, ...newList];
          }
          this.hasMore = newList.length >= this.size;
          common_vendor.index.__f__("log", "at pages/orders/orders.vue:244", "✅ 订单列表加载成功，当前列表共", this.orderList.length, "条");
        } else {
          common_vendor.index.__f__("error", "at pages/orders/orders.vue:246", "❌ API返回错误:", res.code, res.message);
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/orders/orders.vue:253", "❌ 加载订单列表异常:", error);
        common_vendor.index.__f__("error", "at pages/orders/orders.vue:254", "   - 错误信息:", error.message);
        common_vendor.index.__f__("error", "at pages/orders/orders.vue:255", "   - 错误堆栈:", error.stack);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
        this.refreshing = false;
        common_vendor.index.__f__("log", "at pages/orders/orders.vue:263", "🔄 加载状态已重置");
      }
    },
    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true;
      this.page = 1;
      await this.loadOrderList();
    },
    /**
     * 刷新列表
     */
    refreshList() {
      this.page = 1;
      this.loadOrderList();
    },
    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading)
        return;
      this.page++;
      this.loadOrderList();
    },
    /**
     * 跳转到订单详情
     */
    goToDetail(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    },
    /**
     * 跳转到支付页面
     */
    goToPay(orderId, totalFee) {
      common_vendor.index.navigateTo({
        url: `/pages/order/payment?orderId=${orderId}&totalAmount=${totalFee}`
      });
    },
    /**
     * 取消订单
     */
    cancelOrder(orderId) {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "确定要取消这个订单吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "取消中..." });
              const cancelRes = await api_order.cancelOrder({
                orderId,
                cancelReason: "用户主动取消"
              });
              common_vendor.index.hideLoading();
              if (cancelRes.code === 200) {
                common_vendor.index.showToast({
                  title: "订单已取消",
                  icon: "success"
                });
                this.refreshList();
              } else {
                common_vendor.index.showToast({
                  title: cancelRes.message || "取消失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.hideLoading();
              common_vendor.index.__f__("error", "at pages/orders/orders.vue:346", "❌ 取消订单失败:", error);
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
     * 删除订单
     */
    deleteOrder(orderId) {
      common_vendor.index.showModal({
        title: "删除订单",
        content: "确定要删除这个订单吗？",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "功能开发中",
              icon: "none"
            });
          }
        }
      });
    },
    /**
     * 联系骑手
     */
    contactRider(order) {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
      });
    },
    /**
     * 评价订单
     */
    evaluateOrder(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/evaluation/create?orderId=${orderId}`
      });
    },
    /**
     * 查看评价
     */
    viewEvaluation(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/evaluation/detail?orderId=${orderId}`
      });
    },
    /**
     * 再来一单
     */
    reorder(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/order/create?orderId=${orderId}`
      });
    },
    /**
     * 获取服务类型图标
     */
    getTypeIcon(type) {
      const icons = {
        1: "🛒",
        2: "📦",
        3: "🔑",
        4: "🌟"
      };
      return icons[type] || "📦";
    },
    /**
     * 获取服务类型名称
     */
    getTypeName(type) {
      const names = {
        1: "帮我买",
        2: "帮我送",
        3: "帮我取",
        4: "全能"
      };
      return names[type] || "未知";
    },
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 6e4) {
        return "刚刚";
      }
      if (diff < 36e5) {
        return Math.floor(diff / 6e4) + "分钟前";
      }
      if (diff < 864e5) {
        return Math.floor(diff / 36e5) + "小时前";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.statusTabs, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.label),
        b: item.count > 0
      }, item.count > 0 ? {
        c: common_vendor.t(item.count)
      } : {}, {
        d: $data.activeTab === item.value ? 1 : "",
        e: item.value,
        f: common_vendor.o(($event) => $options.switchTab(item.value), item.value)
      });
    }),
    b: common_vendor.f($data.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
        b: common_vendor.t(order.statusDesc),
        c: common_vendor.n("status-" + order.status),
        d: common_vendor.t($options.getTypeIcon(order.type)),
        e: common_vendor.t($options.getTypeName(order.type)),
        f: common_vendor.t(order.goodsDesc),
        g: common_vendor.t(order.pickupAddr),
        h: common_vendor.t(order.deliveryAddr),
        i: common_vendor.t($options.formatTime(order.createTime)),
        j: common_vendor.t(order.totalFee),
        k: order.status === 0
      }, order.status === 0 ? {
        l: common_vendor.o(($event) => $options.cancelOrder(order.id), order.id),
        m: common_vendor.o(($event) => $options.goToPay(order.id, order.totalFee), order.id)
      } : {}, {
        n: order.status === 1
      }, order.status === 1 ? {
        o: common_vendor.o(($event) => $options.cancelOrder(order.id), order.id)
      } : {}, {
        p: order.status === 2
      }, order.status === 2 ? {
        q: common_vendor.o(($event) => $options.contactRider(order), order.id)
      } : {}, {
        r: order.status === 3 && (order.rating === null || order.rating === void 0)
      }, order.status === 3 && (order.rating === null || order.rating === void 0) ? {
        s: common_vendor.o(($event) => $options.evaluateOrder(order.id), order.id)
      } : {}, {
        t: order.status === 3 && order.rating !== null && order.rating !== void 0
      }, order.status === 3 && order.rating !== null && order.rating !== void 0 ? {
        v: common_vendor.o(($event) => $options.viewEvaluation(order.id), order.id)
      } : {}, {
        w: order.status === 4
      }, order.status === 4 ? {
        x: common_vendor.o(($event) => $options.deleteOrder(order.id), order.id),
        y: common_vendor.o(($event) => $options.reorder(order.id), order.id)
      } : {}, {
        z: order.id,
        A: common_vendor.o(($event) => $options.goToDetail(order.id), order.id)
      });
    }),
    c: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? common_vendor.e({
    d: $data.loading
  }, $data.loading ? {} : $data.hasMore ? {} : {}, {
    e: $data.hasMore
  }) : {}, {
    f: $data.orderList.length === 0 && !$data.loading
  }, $data.orderList.length === 0 && !$data.loading ? {} : {}, {
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    h: $data.refreshing,
    i: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1acc51a1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/orders/orders.js.map
