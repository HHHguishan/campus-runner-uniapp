"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const utils_token = require("../utils/token.js");
function sendSmsCode(phone) {
  return utils_request.post("/sms/send-code?phone=" + phone);
}
function loginByPhone(data) {
  return utils_request.post("/auth/login/phone", data);
}
function handleLoginSuccess(loginData) {
  const { token, ...userInfo } = loginData;
  utils_token.setToken(token);
  utils_token.setUserInfo(userInfo);
  common_vendor.index.__f__("log", "at api/auth.js:78", "✅ 登录成功，用户信息已保存:", userInfo);
}
exports.handleLoginSuccess = handleLoginSuccess;
exports.loginByPhone = loginByPhone;
exports.sendSmsCode = sendSmsCode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
