"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
function setToken(token) {
  common_vendor.index.setStorageSync(utils_config.TOKEN_KEY, token);
}
function getToken() {
  return common_vendor.index.getStorageSync(utils_config.TOKEN_KEY) || "";
}
function removeToken() {
  common_vendor.index.removeStorageSync(utils_config.TOKEN_KEY);
}
function setUserInfo(userInfo) {
  common_vendor.index.setStorageSync(utils_config.USER_INFO_KEY, JSON.stringify(userInfo));
}
function removeUserInfo() {
  common_vendor.index.removeStorageSync(utils_config.USER_INFO_KEY);
}
function clearAuth() {
  removeToken();
  removeUserInfo();
}
exports.clearAuth = clearAuth;
exports.getToken = getToken;
exports.setToken = setToken;
exports.setUserInfo = setUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/token.js.map
