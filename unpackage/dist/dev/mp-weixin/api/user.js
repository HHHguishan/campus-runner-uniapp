"use strict";
require("../common/vendor.js");
const utils_request = require("../utils/request.js");
function getUserInfo() {
  return utils_request.get("/user/info");
}
function fetchUserInfo() {
  return getUserInfo();
}
function updateUserInfo(data) {
  return utils_request.put("/user/update", data);
}
function switchMode(data) {
  return utils_request.post("/user/switch-mode", data);
}
exports.fetchUserInfo = fetchUserInfo;
exports.getUserInfo = getUserInfo;
exports.switchMode = switchMode;
exports.updateUserInfo = updateUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
