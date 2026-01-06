"use strict";
const common_vendor = require("../common/vendor.js");
function uploadFile(filePath, type = "temp") {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: "http://localhost:9090/api/common/upload",
      filePath,
      name: "file",
      formData: {
        type
      },
      header: {
        "Authorization": "Bearer " + common_vendor.index.getStorageSync("Authorization")
      },
      success: (uploadRes) => {
        if (uploadRes.statusCode === 200) {
          const data = JSON.parse(uploadRes.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(new Error(data.message));
          }
        } else {
          reject(new Error("上传失败"));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}
exports.uploadFile = uploadFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/common.js.map
