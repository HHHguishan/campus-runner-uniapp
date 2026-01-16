"use strict";
const common_vendor = require("../common/vendor.js");
const utils_location = require("./location.js");
const api_order = require("../api/order.js");
const api_rider = require("../api/rider.js");
const utils_token = require("./token.js");
class RiderTracker {
  constructor() {
    this.timer = null;
    this.activeOrderIds = [];
    this.isReporting = false;
  }
  /**
   * 初始化并启动全局监听
   */
  init() {
    common_vendor.index.__f__("log", "at utils/tracker.js:17", "🚀 全局位置监听器已初始化");
    this.checkAndStart();
    setInterval(() => {
      this.checkAndStart();
    }, 12e4);
  }
  /**
   * 检查是否需要开始汇报
   */
  async checkAndStart() {
    const token = utils_token.getToken();
    if (!token)
      return;
    try {
      const res = await api_rider.getRiderOrders({
        page: 1,
        size: 20,
        // 获取所有配送中的订单
        status: 2
        // 配送中
      });
      const newOrderIds = res.data && res.data.records ? res.data.records.map((r) => r.id) : [];
      if (newOrderIds.length > 0) {
        const isChanged = JSON.stringify(this.activeOrderIds) !== JSON.stringify(newOrderIds);
        this.activeOrderIds = newOrderIds;
        if (!this.isReporting || isChanged) {
          this.startReporting();
        }
      } else {
        this.stopReporting();
        this.activeOrderIds = [];
      }
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/tracker.js:58", "🔍 检查配送订单失败:", err);
    }
  }
  /**
   * 开始上报位置
   */
  startReporting() {
    if (this.isReporting) {
      return;
    }
    this.isReporting = true;
    common_vendor.index.__f__("log", "at utils/tracker.js:71", "🏇 开启多订单位置同步:", this.activeOrderIds);
    const doReport = async () => {
      if (this.activeOrderIds.length === 0 || !this.isReporting)
        return;
      try {
        const loc = await utils_location.getBaiduLocation();
        const reports = this.activeOrderIds.map(
          (orderId) => api_order.reportLocation({
            orderId,
            latitude: loc.latitude,
            longitude: loc.longitude
          })
        );
        await Promise.all(reports);
        common_vendor.index.__f__("log", "at utils/tracker.js:89", "📡 多订单位置同步成功:", loc.latitude, loc.longitude, `(共${this.activeOrderIds.length}单)`);
      } catch (err) {
        common_vendor.index.__f__("error", "at utils/tracker.js:91", "❌ 多订单位置上报失败:", err);
      }
    };
    doReport();
    this.timer = setInterval(doReport, 3e4);
    common_vendor.wx$1.startLocationUpdateBackground({
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/tracker.js:104", "🟢 背景定位已开启");
        common_vendor.wx$1.onLocationChange((res2) => {
        });
      },
      fail: (err) => {
        common_vendor.index.__f__("warn", "at utils/tracker.js:111", "🟡 背景定位开启失败，将维持常规上报:", err);
      }
    });
  }
  /**
   * 停止上报
   */
  stopReporting() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isReporting = false;
    common_vendor.index.__f__("log", "at utils/tracker.js:126", "⏹️ 全局位置上报已停止");
    common_vendor.wx$1.stopLocationUpdate();
  }
}
const riderTracker = new RiderTracker();
exports.riderTracker = riderTracker;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/tracker.js.map
