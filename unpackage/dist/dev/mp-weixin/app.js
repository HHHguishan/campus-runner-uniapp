"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_token = require("./utils/token.js");
const utils_tracker = require("./utils/tracker.js");
const utils_request = require("./utils/request.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/orders/orders.js";
  "./pages/message/message.js";
  "./pages/mine/mine.js";
  "./pages/hall/hall.js";
  "./pages/running/running.js";
  "./pages/stats/stats.js";
  "./pages/login/login.js";
  "./pages/rider/auth.js";
  "./pages/notice/notice.js";
  "./pages/profile/edit.js";
  "./pages/debug/api.js";
  "./pages/address/list.js";
  "./pages/address/edit.js";
  "./pages/wallet/wallet.js";
  "./pages/wallet/recharge.js";
  "./pages/wallet/alipay-pay.js";
  "./pages/wallet/withdraw.js";
  "./pages/wallet/withdraw-records.js";
  "./pages/wallet/alipay-bind.js";
  "./pages/order/create.js";
  "./pages/order/payment.js";
  "./pages/order/detail.js";
  "./pages/evaluation/create.js";
  "./pages/evaluation/detail.js";
  "./pages/admin/order-list.js";
  "./pages/admin/order-detail.js";
  "./pages/upload-finish/upload-finish.js";
  "./pages/rider/completed.js";
  "./pages/rider/reply.js";
  "./pages/rider/evaluations.js";
  "./pages/forum/index.js";
  "./pages/forum/detail.js";
  "./pages/forum/create.js";
  "./pages/forum/my-posts.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Launch");
    const token = utils_token.getToken();
    if (token) {
      utils_tracker.riderTracker.init();
    } else {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:22", "App Show");
    if (utils_token.getToken()) {
      utils_tracker.riderTracker.checkAndStart();
    }
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:29", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$request = utils_request.request;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
