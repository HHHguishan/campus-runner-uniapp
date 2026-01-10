"use strict";
const utils_request = require("../utils/request.js");
function getAdminOrderList(params) {
  return utils_request.get("/admin/order/list", params);
}
function getAdminOrderDetail(orderId) {
  return utils_request.get(`/admin/order/${orderId}`);
}
exports.getAdminOrderDetail = getAdminOrderDetail;
exports.getAdminOrderList = getAdminOrderList;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/admin.js.map
