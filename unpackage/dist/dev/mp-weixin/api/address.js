"use strict";
const utils_request = require("../utils/request.js");
function getAddressList() {
  return utils_request.get("/address/list");
}
function getAddressDetail(id) {
  return utils_request.get(`/address/${id}`);
}
function saveAddress(data) {
  return utils_request.post("/address/save", data);
}
function deleteAddress(id) {
  return utils_request.del(`/address/${id}`);
}
exports.deleteAddress = deleteAddress;
exports.getAddressDetail = getAddressDetail;
exports.getAddressList = getAddressList;
exports.saveAddress = saveAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/address.js.map
