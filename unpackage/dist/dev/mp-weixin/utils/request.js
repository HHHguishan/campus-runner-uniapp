"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const utils_token = require("./token.js");
function requestInterceptor(config) {
  const token = utils_token.getToken();
  if (token) {
    config.header = {
      ...config.header,
      "Authorization": `Bearer ${token}`
    };
  }
  if (!config.url.startsWith("http")) {
    config.url = utils_config.API_BASE_URL + config.url;
  }
  if (!config.timeout) {
    config.timeout = utils_config.REQUEST_TIMEOUT;
  }
  common_vendor.index.__f__("log", "at utils/request.js:36", "🚀 请求发送:", {
    url: config.url,
    method: config.method,
    data: config.data,
    header: config.header
  });
  return config;
}
function responseInterceptor(response) {
  var _a;
  const { statusCode, data } = response;
  common_vendor.index.__f__("log", "at utils/request.js:55", "📥 响应接收:", {
    url: (_a = response.config) == null ? void 0 : _a.url,
    statusCode,
    data
  });
  if (statusCode >= 200 && statusCode < 300) {
    if (data.code === 200) {
      return Promise.resolve(data);
    } else {
      common_vendor.index.showToast({
        title: data.message || "请求失败",
        icon: "none",
        duration: 2e3
      });
      return Promise.reject(new Error(data.message || "请求失败"));
    }
  }
  if (statusCode === 401) {
    common_vendor.index.showToast({
      title: "登录已过期，请重新登录",
      icon: "none"
    });
    utils_token.clearAuth();
    setTimeout(() => {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }, 1500);
    return Promise.reject(new Error("未授权"));
  }
  if (statusCode === 403) {
    common_vendor.index.showToast({
      title: "没有权限访问",
      icon: "none"
    });
    return Promise.reject(new Error("禁止访问"));
  }
  if (statusCode === 404) {
    common_vendor.index.showToast({
      title: "请求的资源不存在",
      icon: "none"
    });
    return Promise.reject(new Error("资源不存在"));
  }
  if (statusCode === 500) {
    common_vendor.index.showToast({
      title: "服务器错误",
      icon: "none"
    });
    return Promise.reject(new Error("服务器错误"));
  }
  common_vendor.index.showToast({
    title: "网络请求失败",
    icon: "none"
  });
  return Promise.reject(new Error("网络请求失败"));
}
function request(options) {
  return new Promise((resolve, reject) => {
    const config = requestInterceptor({
      method: "GET",
      header: {
        "Content-Type": "application/json"
      },
      ...options
    });
    common_vendor.index.request({
      ...config,
      success: (response) => {
        responseInterceptor(response).then(resolve).catch(reject);
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at utils/request.js:154", "❌ 请求失败:", error);
        common_vendor.index.showToast({
          title: "网络连接失败",
          icon: "none"
        });
        reject(error);
      }
    });
  });
}
function get(url, params = {}, options = {}) {
  return request({
    url,
    method: "GET",
    data: params,
    ...options
  });
}
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: "POST",
    data,
    ...options
  });
}
exports.get = get;
exports.post = post;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
