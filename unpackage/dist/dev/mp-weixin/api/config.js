"use strict";
const utils_request = require("../utils/request.js");
function getConfigs(keys) {
  const params = keys ? { keys } : {};
  return utils_request.get("/public/config", params);
}
exports.getConfigs = getConfigs;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/config.js.map
