"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const libs_bmapWx = require("../libs/bmap-wx.js");
function getBaiduLocation() {
  return new Promise((resolve, reject) => {
    const BMap = new libs_bmapWx.BMapWX({
      ak: utils_config.BAIDU_MAP_AK
    });
    common_vendor.index.__f__("log", "at utils/location.js:20", "📡 开始获取系统高精度定位...");
    common_vendor.index.getLocation({
      type: "gcj02",
      isHighAccuracy: true,
      highAccuracyExpireTime: 3e3,
      success: (locRes) => {
        common_vendor.index.__f__("log", "at utils/location.js:28", "🛰️ 系统定位成功:", locRes);
        const locationStr = `${locRes.latitude},${locRes.longitude}`;
        BMap.regeocoding({
          location: locationStr,
          // 关键：传入经纬度，跳过 SDK 内部的定位获取
          fail: (err) => {
            common_vendor.index.__f__("error", "at utils/location.js:35", "❌ 百度地图解析地址失败:", err);
            reject(err);
          },
          success: (res) => {
            common_vendor.index.__f__("log", "at utils/location.js:39", "✅ 百度地图解析成功:", res);
            if (res.wxMarkerData && res.wxMarkerData.length > 0) {
              const locationData = res.wxMarkerData[0];
              const result = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: res.originalData.result.formatted_address,
                addressComponent: res.originalData.result.addressComponent,
                business: res.originalData.result.business,
                pois: res.originalData.result.pois
              };
              let displayName = result.address;
              if (res.originalData.result.sematic_description) {
                displayName = res.originalData.result.sematic_description;
              }
              result.displayName = displayName;
              resolve(result);
            } else {
              reject(new Error("未获取到位置详情"));
            }
          }
        });
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/location.js:68", "❌ 系统定位获取失败:", err);
        reject(err);
      }
    });
  });
}
exports.getBaiduLocation = getBaiduLocation;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
