"use strict";
const utils_request = require("../utils/request.js");
function uploadFileAPI(filePath, type = "avatar") {
  return utils_request.uploadFile("/common/upload", filePath, {
    type
  });
}
function uploadAvatar(filePath) {
  return uploadFileAPI(filePath, "avatar");
}
exports.uploadAvatar = uploadAvatar;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/upload.js.map
