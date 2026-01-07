"use strict";
const utils_request = require("../utils/request.js");
function getNoticeList(params) {
  return utils_request.get("/public/notice/list", params);
}
function getBannerList() {
  return utils_request.get("/public/notice/banner");
}
exports.getBannerList = getBannerList;
exports.getNoticeList = getNoticeList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/notice.js.map
