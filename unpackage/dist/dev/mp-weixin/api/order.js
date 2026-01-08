"use strict";
const utils_request = require("../utils/request.js");
function createOrder(data) {
  return utils_request.post("/order/create", data);
}
function getOrderDetail(orderId) {
  return utils_request.get(`/order/${orderId}`);
}
function cancelOrder(data) {
  return utils_request.put("/order/cancel", data);
}
function payOrder(data) {
  return utils_request.post("/pay/doPay", data);
}
exports.cancelOrder = cancelOrder;
exports.createOrder = createOrder;
exports.getOrderDetail = getOrderDetail;
exports.payOrder = payOrder;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
