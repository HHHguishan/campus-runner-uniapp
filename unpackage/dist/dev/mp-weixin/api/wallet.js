"use strict";
const utils_request = require("../utils/request.js");
function getWalletBalance() {
  return utils_request.get("/wallet/balance");
}
function recharge(data) {
  const amount = Number(data.amount).toFixed(2);
  const url = `/wallet/mock/recharge?amount=${amount}`;
  return utils_request.post(url, {});
}
function getTransactions(params = {}) {
  return utils_request.get("/wallet/transactions", params);
}
exports.getTransactions = getTransactions;
exports.getWalletBalance = getWalletBalance;
exports.recharge = recharge;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/wallet.js.map
