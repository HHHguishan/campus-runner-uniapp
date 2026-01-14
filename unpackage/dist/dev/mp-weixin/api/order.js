"use strict";
const utils_request = require("../utils/request.js");
function createOrder(data) {
  return utils_request.post("/order/create", data);
}
function getOrderList(params) {
  return utils_request.get("/order/list", params);
}
function getOrderDetail(orderId) {
  return utils_request.get(`/order/${orderId}`);
}
function cancelOrder(data) {
  return utils_request.put("/order/cancel", data);
}
function submitEvaluation(data) {
  return utils_request.post("/evaluation/submit", data);
}
function getEvaluationDetail(orderId) {
  return utils_request.get(`/evaluation/detail/${orderId}`);
}
function payOrder(data) {
  return utils_request.post("/pay/doPay", data);
}
function alipayPayOrder(data) {
  return utils_request.post("/pay/alipay", data);
}
exports.alipayPayOrder = alipayPayOrder;
exports.cancelOrder = cancelOrder;
exports.createOrder = createOrder;
exports.getEvaluationDetail = getEvaluationDetail;
exports.getOrderDetail = getOrderDetail;
exports.getOrderList = getOrderList;
exports.payOrder = payOrder;
exports.submitEvaluation = submitEvaluation;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
