"use strict";
const utils_request = require("../utils/request.js");
function getRunnerStatus() {
  return utils_request.get("/runner/status");
}
function submitStudentCardApply(data) {
  return utils_request.post("/runner/apply/student-card", data);
}
function grabOrder(orderId) {
  return utils_request.post("/order/grab", { orderId });
}
function finishOrder(data) {
  return put("/order/finish", data);
}
function getRiderOrders(params) {
  return utils_request.get("/order/list", params);
}
function getRiderDashboard() {
  return utils_request.get("/runner/dashboard/overview");
}
function getRiderOrderStats() {
  return utils_request.get("/runner/dashboard/orders");
}
function getRiderEvaluationStats() {
  return utils_request.get("/evaluation/statistics?type=received");
}
exports.finishOrder = finishOrder;
exports.getRiderDashboard = getRiderDashboard;
exports.getRiderEvaluationStats = getRiderEvaluationStats;
exports.getRiderOrderStats = getRiderOrderStats;
exports.getRiderOrders = getRiderOrders;
exports.getRunnerStatus = getRunnerStatus;
exports.grabOrder = grabOrder;
exports.submitStudentCardApply = submitStudentCardApply;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/rider.js.map
