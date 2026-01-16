"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
require("../../libs/bmap-wx.js");
const utils_token = require("../../utils/token.js");
const utils_tracker = require("../../utils/tracker.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      riderInfo: null,
      orderStatus: 0,
      // 0-待支付, 1-待接单, 2-配送中, 3-已完成, 4-已取消
      countdown: -1,
      // 倒计时秒数
      countdownTimer: null,
      // 倒计时定时器
      // 地图相关数据
      mapCenter: { latitude: 22.817, longitude: 108.366 },
      // 默认南宁
      markers: [],
      polyline: [],
      trackingTimer: null
      // 位置追踪定时器 (拉取或报)
    };
  },
  computed: {
    /**
     * 是否显示底部操作栏
     */
    shouldShowBottomBar() {
      return this.orderStatus >= 0 && this.orderStatus <= 4;
    }
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
  onUnload() {
    this.stopCountdown();
    this.stopTracking();
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
          common_vendor.index.__f__("log", "at pages/order/detail.vue:297", "✅ 订单详情加载成功:", this.orderInfo);
          common_vendor.index.__f__("log", "at pages/order/detail.vue:298", "📊 评价状态检查:", {
            rating: this.orderInfo.rating,
            hasRating: !!this.orderInfo.rating,
            status: this.orderStatus
          });
          if (this.orderStatus === 0) {
            if (res.data.countdown && res.data.countdown > 0) {
              this.startCountdown(res.data.countdown);
            } else {
              this.countdown = 0;
            }
          }
          this.initMapMarkers();
          this.handleTracking();
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/order/detail.vue:327", "❌ 加载订单详情失败:", error);
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
              common_vendor.index.__f__("error", "at pages/order/detail.vue:487", "❌ 取消订单失败:", error);
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
      common_vendor.index.navigateTo({
        url: `/pages/evaluation/detail?orderId=${this.orderId}`
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
    },
    /**
     * 删除订单
     */
    deleteOrder() {
      common_vendor.index.showModal({
        title: "删除订单",
        content: "确定要删除这个订单吗？删除后将无法恢复",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "删除功能开发中",
              icon: "none"
            });
          }
        }
      });
    },
    /**
     * 再来一单
     */
    reorder() {
      if (!this.orderInfo)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/order/create?orderId=${this.orderId}`
      });
    },
    /**
     * 启动倒计时
     */
    startCountdown(seconds) {
      this.countdown = seconds;
      this.stopCountdown();
      this.countdownTimer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.stopCountdown();
          this.loadOrderDetail();
        }
      }, 1e3);
    },
    /**
     * 停止倒计时
     */
    stopCountdown() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    },
    /**
     * 格式化倒计时显示
     */
    formatCountdown(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    },
    /**
     * 初始化地图标记
     */
    initMapMarkers() {
      if (!this.orderInfo || !this.orderInfo.pickupLat)
        return;
      const markers = [
        {
          id: 1,
          latitude: this.orderInfo.pickupLat,
          longitude: this.orderInfo.pickupLng,
          title: "取件点",
          iconPath: "/static/icons/marker_pickup.png",
          width: 32,
          height: 32,
          anchor: { x: 0.5, y: 1 },
          label: { content: "取", color: "#667eea", bgColor: "#fff", padding: 4, borderRadius: 10, fontSize: 10 },
          callout: {
            content: this.orderInfo.pickupAddr || "取货地",
            color: "#333",
            fontSize: 12,
            borderRadius: 4,
            bgColor: "#fff",
            padding: 6,
            display: "ALWAYS"
          }
        },
        {
          id: 2,
          latitude: this.orderInfo.deliveryLat,
          longitude: this.orderInfo.deliveryLng,
          title: "送达点",
          iconPath: "/static/icons/marker_delivery.png",
          width: 32,
          height: 32,
          anchor: { x: 0.5, y: 1 },
          label: { content: "收", color: "#ff4d4f", bgColor: "#fff", padding: 4, borderRadius: 10, fontSize: 10 },
          callout: {
            content: this.orderInfo.deliveryAddr || "送货地",
            color: "#333",
            fontSize: 12,
            borderRadius: 4,
            bgColor: "#fff",
            padding: 6,
            display: "ALWAYS"
          }
        }
      ];
      this.markers = markers;
      this.mapCenter = {
        latitude: (this.orderInfo.pickupLat + this.orderInfo.deliveryLat) / 2,
        longitude: (this.orderInfo.pickupLng + this.orderInfo.deliveryLng) / 2
      };
      common_vendor.index.__f__("log", "at pages/order/detail.vue:675", "🗺️ [DETAIL] 地图标注初始化:", {
        markersCount: markers.length,
        pickup: [this.orderInfo.pickupLat, this.orderInfo.pickupLng],
        delivery: [this.orderInfo.deliveryLat, this.orderInfo.deliveryLng],
        center: this.mapCenter
      });
      this.polyline = [{
        points: [
          { latitude: this.orderInfo.pickupLat, longitude: this.orderInfo.pickupLng },
          { latitude: this.orderInfo.deliveryLat, longitude: this.orderInfo.deliveryLng }
        ],
        color: "#667eea",
        width: 4,
        dottedLine: true
      }];
      this.$nextTick(() => {
        const mapCtx = common_vendor.index.createMapContext("orderMap", this);
        mapCtx.includePoints({
          padding: [50, 50, 50, 50],
          points: this.markers
        });
      });
    },
    /**
     * 处理位置追踪逻辑
     */
    handleTracking() {
      this.stopTracking();
      const user = utils_token.getUserInfo();
      const currentUserId = user ? user.id : null;
      common_vendor.index.__f__("log", "at pages/order/detail.vue:712", "🧐 [DETAIL] 追踪权限检查:", {
        orderId: this.orderId,
        runnerId: this.orderInfo.runnerId,
        userId: this.orderInfo.userId,
        currentUserId,
        status: this.orderStatus
      });
      if (this.orderInfo.runnerId && this.orderInfo.runnerId == currentUserId) {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:721", "🏁 当前用户是骑手，开启追踪和拉取");
        utils_tracker.riderTracker.checkAndStart();
        this.startUserPolling();
      } else if (this.orderInfo.userId && this.orderInfo.userId == currentUserId) {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:727", "🏁 当前用户是客，开启拉取");
        if (this.orderStatus === 2 || this.orderStatus === 3) {
          this.startUserPolling();
        } else {
          common_vendor.index.__f__("log", "at pages/order/detail.vue:732", "⏭️ 订单非配送中/已完成状态，跳过拉取");
        }
      } else {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:735", "🚷 无权限开启位置追踪");
      }
    },
    /**
     * 用户端：拉取位置
     */
    startUserPolling() {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:742", "👀 用户端：开启轨迹拉取定时器");
      const doPoll = async () => {
        try {
          const res = await api_order.getRiderLocation(this.orderId);
          if (res.code === 200 && res.data) {
            common_vendor.index.__f__("log", "at pages/order/detail.vue:748", "🏎️ [POLL] 收到骑手位置数据:", JSON.stringify(res.data));
            this.updateRiderMarker(res.data.latitude, res.data.longitude);
          } else {
            common_vendor.index.__f__("log", "at pages/order/detail.vue:751", "🏎️ [POLL] 接口返回空或失败:", res);
          }
        } catch (err) {
          common_vendor.index.__f__("error", "at pages/order/detail.vue:754", "❌ 拉取轨迹失败:", err);
        }
      };
      doPoll();
      this.trackingTimer = setInterval(doPoll, 15e3);
    },
    updateRiderMarker(lat, lng) {
      if (!lat || !lng) {
        common_vendor.index.__f__("warn", "at pages/order/detail.vue:764", "⚠️ updateRiderMarker: 坐标无效", lat, lng);
        return;
      }
      const riderMarkerId = 999;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      common_vendor.index.__f__("log", "at pages/order/detail.vue:772", "📍 [DETAIL] 更新骑手标点:", latNum, lngNum);
      const existingIndex = this.markers.findIndex((m) => m.id === riderMarkerId);
      const riderMarker = {
        id: riderMarkerId,
        latitude: latNum,
        longitude: lngNum,
        title: "骑手位置",
        iconPath: "/static/icons/marker_rider.png",
        width: 36,
        height: 36,
        zIndex: 999,
        // 如果上面都不显示，尝试不加这些复杂配置看看
        anchor: { x: 0.5, y: 0.5 },
        // 添加文字标签，防止图片加载失败时看不见
        label: {
          content: "配送中",
          color: "#ffffff",
          fontSize: 10,
          bgColor: "#07c160",
          padding: 3,
          borderRadius: 5,
          anchorX: 0,
          anchorY: -40
        }
      };
      if (existingIndex > -1) {
        this.$set(this.markers, existingIndex, riderMarker);
        common_vendor.index.__f__("log", "at pages/order/detail.vue:802", "✅ 已使用 $set 更新现有骑手标点");
      } else {
        this.markers = [...this.markers, riderMarker];
        common_vendor.index.__f__("log", "at pages/order/detail.vue:805", "✅ 已使用解构赋值新增骑手标点，当前总标点数:", this.markers.length);
      }
      common_vendor.index.__f__("log", "at pages/order/detail.vue:808", "🔍 当前所有标记详情 (仅经纬度):", this.markers.map((m) => ({ id: m.id, lat: m.latitude, lng: m.longitude })));
      this.$nextTick(() => {
        const mapCtx = common_vendor.index.createMapContext("orderMap", this);
        mapCtx.includePoints({
          padding: [80, 80, 80, 80],
          points: this.markers
        });
      });
    },
    /**
     * 停止追踪
     */
    stopTracking() {
      if (this.trackingTimer) {
        clearInterval(this.trackingTimer);
        this.trackingTimer = null;
        common_vendor.index.__f__("log", "at pages/order/detail.vue:827", "⏹️ 位置追踪已停止");
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.o((...args) => $options.showMoreMenu && $options.showMoreMenu(...args)),
    c: $data.orderInfo && ($data.orderStatus === 1 || $data.orderStatus === 2 || $data.orderStatus === 3)
  }, $data.orderInfo && ($data.orderStatus === 1 || $data.orderStatus === 2 || $data.orderStatus === 3) ? {
    d: $data.mapCenter.latitude,
    e: $data.mapCenter.longitude,
    f: $data.markers,
    g: $data.polyline,
    h: $data.markers
  } : {}, {
    i: common_vendor.t($options.getStatusIcon($data.orderStatus)),
    j: common_vendor.t($options.getStatusTitle($data.orderStatus)),
    k: $data.orderStatus !== 0 || $data.countdown <= 0
  }, $data.orderStatus !== 0 || $data.countdown <= 0 ? {
    l: common_vendor.t($options.getStatusDesc($data.orderStatus))
  } : {}, {
    m: $data.orderStatus === 0 && $data.countdown > 0
  }, $data.orderStatus === 0 && $data.countdown > 0 ? {
    n: common_vendor.t($options.formatCountdown($data.countdown))
  } : {}, {
    o: $data.orderStatus === 0 && $data.countdown === 0
  }, $data.orderStatus === 0 && $data.countdown === 0 ? {} : {}, {
    p: common_vendor.n("status-" + $data.orderStatus),
    q: $data.orderInfo && $data.orderInfo.serviceType
  }, $data.orderInfo && $data.orderInfo.serviceType ? {
    r: common_vendor.t($options.formatTime($data.orderInfo.createTime)),
    s: $data.orderStatus >= 1 ? 1 : "",
    t: common_vendor.t($data.orderInfo.acceptTime ? $options.formatTime($data.orderInfo.acceptTime) : "等待接单"),
    v: $data.orderStatus >= 2 ? 1 : "",
    w: common_vendor.t($data.orderInfo.deliveryTime ? $options.formatTime($data.orderInfo.deliveryTime) : "配送中"),
    x: $data.orderStatus >= 3 ? 1 : "",
    y: common_vendor.t($data.orderInfo.completeTime ? $options.formatTime($data.orderInfo.completeTime) : "等待完成"),
    z: $data.orderStatus >= 4 ? 1 : ""
  } : {}, {
    A: $data.orderInfo
  }, $data.orderInfo ? common_vendor.e({
    B: common_vendor.t($data.orderInfo.orderNo || "-"),
    C: common_vendor.o((...args) => $options.copyOrderNo && $options.copyOrderNo(...args)),
    D: common_vendor.t($options.getServiceTypeName($data.orderInfo.serviceType)),
    E: common_vendor.t($data.orderInfo.goodsInfo || "-"),
    F: $data.orderInfo.remark
  }, $data.orderInfo.remark ? {
    G: common_vendor.t($data.orderInfo.remark)
  } : {}, {
    H: common_vendor.t($options.formatTime($data.orderInfo.createTime))
  }) : {}, {
    I: $data.orderInfo
  }, $data.orderInfo ? {
    J: common_vendor.t(((_a = $data.orderInfo.addressInfo) == null ? void 0 : _a.pickupAddress) || "-"),
    K: common_vendor.t($data.orderInfo.deliveryName),
    L: common_vendor.t($data.orderInfo.deliveryPhone),
    M: common_vendor.t($data.orderInfo.deliveryAddress || "-")
  } : {}, {
    N: $data.riderInfo
  }, $data.riderInfo ? common_vendor.e({
    O: common_vendor.t($data.riderInfo.realName ? $data.riderInfo.realName.substring(0, 1) : "骑"),
    P: common_vendor.t($data.riderInfo.realName || "骑手"),
    Q: $data.riderInfo.averageRating
  }, $data.riderInfo.averageRating ? {
    R: common_vendor.t($data.riderInfo.averageRating.toFixed(1))
  } : {}, {
    S: common_vendor.o((...args) => $options.callRider && $options.callRider(...args))
  }) : {}, {
    T: $data.orderInfo
  }, $data.orderInfo ? {
    U: common_vendor.t($data.orderInfo.goodsAmount || "0.00"),
    V: common_vendor.t($data.orderInfo.deliveryFee || "0.00"),
    W: common_vendor.t($data.orderInfo.totalAmount || "0.00")
  } : {}, {
    X: $data.orderInfo && $options.shouldShowBottomBar
  }, $data.orderInfo && $options.shouldShowBottomBar ? common_vendor.e({
    Y: $data.orderStatus === 0
  }, $data.orderStatus === 0 ? {
    Z: common_vendor.o((...args) => $options.cancelOrder && $options.cancelOrder(...args)),
    aa: common_vendor.o((...args) => $options.goToPay && $options.goToPay(...args))
  } : {}, {
    ab: $data.orderStatus === 1
  }, $data.orderStatus === 1 ? {
    ac: common_vendor.o((...args) => $options.cancelOrder && $options.cancelOrder(...args))
  } : {}, {
    ad: $data.orderStatus === 2
  }, $data.orderStatus === 2 ? {
    ae: common_vendor.o((...args) => $options.contactRider && $options.contactRider(...args))
  } : {}, {
    af: $data.orderStatus === 3 && ($data.orderInfo.rating === null || $data.orderInfo.rating === void 0)
  }, $data.orderStatus === 3 && ($data.orderInfo.rating === null || $data.orderInfo.rating === void 0) ? {
    ag: common_vendor.o((...args) => $options.goToEvaluate && $options.goToEvaluate(...args))
  } : {}, {
    ah: $data.orderStatus === 3 && $data.orderInfo.rating !== null && $data.orderInfo.rating !== void 0
  }, $data.orderStatus === 3 && $data.orderInfo.rating !== null && $data.orderInfo.rating !== void 0 ? {
    ai: common_vendor.o((...args) => $options.viewEvaluation && $options.viewEvaluation(...args))
  } : {}, {
    aj: $data.orderStatus === 4
  }, $data.orderStatus === 4 ? {
    ak: common_vendor.o((...args) => $options.deleteOrder && $options.deleteOrder(...args)),
    al: common_vendor.o((...args) => $options.reorder && $options.reorder(...args))
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6b23c96c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
