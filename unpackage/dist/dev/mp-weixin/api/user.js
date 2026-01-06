"use strict";
require("../common/vendor.js");
const utils_request = require("../utils/request.js");
function getUserInfo() {
  return utils_request.get("/user/info");
}
function switchMode(data) {
  return utils_request.post("/user/switch-mode", data);
}
exports.getUserInfo = getUserInfo;
exports.switchMode = switchMode;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
