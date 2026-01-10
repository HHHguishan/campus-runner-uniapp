"use strict";
const common_vendor = require("../../common/vendor.js");
const api_admin = require("../../api/admin.js");
const _sfc_main = {
  data() {
    return {
      // 筛选条件
      statusOptions: [
        { label: "全部状态", value: null },
        { label: "待支付", value: 0 },
        { label: "待接单", value: 1 },
        { label: "配送中", value: 2 },
        { label: "已完成", value: 3 },
        { label: "已取消", value: 4 },
        { label: "退款中", value: 5 }
      ],
      statusIndex: 0,
      statusValue: null,
      typeOptions: [
        { label: "全部类型", value: "" },
        { label: "帮买", value: "buy" },
        { label: "帮送", value: "send" },
        { label: "帮取", value: "pick" },
        { label: "全能", value: "all" }
      ],
      typeIndex: 0,
      typeValue: "",
      abnormalOptions: [
        { label: "全部订单", value: "" },
        { label: "超时未接单", value: "timeout_not_taken" },
        { label: "配送超时", value: "timeout_delivery" },
        { label: "支付异常", value: "abnormal_payment" }
      ],
      abnormalIndex: 0,
      abnormalValue: "",
      startTime: "",
      endTime: "",
      keyword: "",
      // 订单列表
      orderList: [],
      total: 0,
      current: 1,
      size: 10,
      loading: false,
      hasMore: true
    };
  },
  onLoad() {
    this.loadOrderList();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.current = 1;
    this.loadOrderList(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  // 上拉加载更多
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.current++;
      this.loadOrderList();
    }
  },
  methods: {
    /**
     * 加载订单列表
     */
    async loadOrderList(callback) {
      if (this.loading)
        return;
      try {
        this.loading = true;
        const params = {
          status: this.statusValue,
          orderType: this.typeValue,
          abnormalType: this.abnormalValue,
          startTime: this.startTime,
          endTime: this.endTime,
          keyword: this.keyword,
          current: this.current,
          size: this.size
        };
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:249", "📋 查询订单列表，参数：", params);
        const res = await api_admin.getAdminOrderList(params);
        common_vendor.index.__f__("log", "at pages/admin/order-list.vue:252", "📋 订单列表响应：", res);
        if (res.code === 200) {
          const { records, total } = res.data;
          if (this.current === 1) {
            this.orderList = records;
          } else {
            this.orderList = [...this.orderList, ...records];
          }
          this.total = total;
          this.hasMore = this.orderList.length < total;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/order-list.vue:272", "❌ 加载订单列表失败：", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        this.loading = false;
        callback && callback();
      }
    },
    /**
     * 搜索
     */
    handleSearch() {
      this.current = 1;
      this.loadOrderList();
    },
    /**
     * 重置筛选条件
     */
    handleReset() {
      this.statusIndex = 0;
      this.statusValue = null;
      this.typeIndex = 0;
      this.typeValue = "";
      this.abnormalIndex = 0;
      this.abnormalValue = "";
      this.startTime = "";
      this.endTime = "";
      this.keyword = "";
      this.current = 1;
      this.loadOrderList();
    },
    /**
     * 订单状态变更
     */
    onStatusChange(e) {
      this.statusIndex = e.detail.value;
      this.statusValue = this.statusOptions[e.detail.value].value;
    },
    /**
     * 订单类型变更
     */
    onTypeChange(e) {
      this.typeIndex = e.detail.value;
      this.typeValue = this.typeOptions[e.detail.value].value;
    },
    /**
     * 异常类型变更
     */
    onAbnormalChange(e) {
      this.abnormalIndex = e.detail.value;
      this.abnormalValue = this.abnormalOptions[e.detail.value].value;
    },
    /**
     * 开始时间变更
     */
    onStartTimeChange(e) {
      this.startTime = e.detail.value;
    },
    /**
     * 结束时间变更
     */
    onEndTimeChange(e) {
      this.endTime = e.detail.value;
    },
    /**
     * 跳转到订单详情
     */
    goToDetail(orderId) {
      common_vendor.index.navigateTo({
        url: `/pages/admin/order-detail?id=${orderId}`
      });
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
      return statusMap[status] || "未知";
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
     * 格式化时间
     */
    formatTime(time) {
      if (!time)
        return "-";
      const date = new Date(time);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      return `${month}-${day} ${hour}:${minute}`;
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
    b: common_vendor.t($data.statusOptions[$data.statusIndex].label),
    c: $data.statusOptions,
    d: $data.statusIndex,
    e: common_vendor.o((...args) => $options.onStatusChange && $options.onStatusChange(...args)),
    f: common_vendor.t($data.typeOptions[$data.typeIndex].label),
    g: $data.typeOptions,
    h: $data.typeIndex,
    i: common_vendor.o((...args) => $options.onTypeChange && $options.onTypeChange(...args)),
    j: common_vendor.t($data.abnormalOptions[$data.abnormalIndex].label),
    k: $data.abnormalOptions,
    l: $data.abnormalIndex,
    m: common_vendor.o((...args) => $options.onAbnormalChange && $options.onAbnormalChange(...args)),
    n: common_vendor.t($data.startTime || "开始日期"),
    o: $data.startTime,
    p: common_vendor.o((...args) => $options.onStartTimeChange && $options.onStartTimeChange(...args)),
    q: common_vendor.t($data.endTime || "结束日期"),
    r: $data.endTime,
    s: common_vendor.o((...args) => $options.onEndTimeChange && $options.onEndTimeChange(...args)),
    t: $data.keyword,
    v: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    w: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    x: common_vendor.o((...args) => $options.handleReset && $options.handleReset(...args)),
    y: common_vendor.t($data.total),
    z: $data.orderList.length > 0
  }, $data.orderList.length > 0 ? {
    A: common_vendor.f($data.orderList, (order, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(order.orderNo),
        b: common_vendor.t($options.getStatusText(order.status)),
        c: common_vendor.n("status-" + order.status),
        d: common_vendor.t($options.getOrderTypeText(order.type)),
        e: common_vendor.t(order.goodsDesc),
        f: common_vendor.t(order.userNickname),
        g: order.runnerNickname
      }, order.runnerNickname ? {
        h: common_vendor.t(order.runnerNickname)
      } : {}, {
        i: common_vendor.t($options.formatTime(order.createTime)),
        j: common_vendor.t(order.totalFee),
        k: order.id,
        l: common_vendor.o(($event) => $options.goToDetail(order.id), order.id)
      });
    })
  } : {}, {
    B: $data.orderList.length > 0 && $data.hasMore
  }, $data.orderList.length > 0 && $data.hasMore ? {
    C: common_vendor.t($data.loading ? "加载中..." : "上拉加载更多")
  } : {}, {
    D: $data.orderList.length > 0 && !$data.hasMore
  }, $data.orderList.length > 0 && !$data.hasMore ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-87421435"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/order-list.js.map
