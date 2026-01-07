"use strict";
const common_vendor = require("../../common/vendor.js");
const api_notice = require("../../api/notice.js");
const api_config = require("../../api/config.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      logs: "",
      baseUrl: utils_config.BASE_URL + "/api"
    };
  },
  methods: {
    // 添加日志
    addLog(message) {
      const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      this.logs += `[${timestamp}] ${message}

`;
      common_vendor.index.__f__("log", "at pages/debug/api.vue:67", message);
    },
    // 测试轮播图API
    async testBannerAPI() {
      this.addLog("=== 开始测试轮播图API ===");
      this.addLog(`请求地址: ${this.baseUrl}/public/notice/banner`);
      try {
        const res = await api_notice.getBannerList();
        this.addLog("✅ 请求成功");
        this.addLog(`响应码: ${res.code}`);
        this.addLog(`响应消息: ${res.message || "无"}`);
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : [];
          this.addLog(`数据类型: ${Array.isArray(res.data) ? "数组" : typeof res.data}`);
          this.addLog(`数据长度: ${data.length}`);
          if (data.length > 0) {
            this.addLog("\n📊 轮播图数据详情:");
            data.forEach((item, index) => {
              this.addLog(`
[${index + 1}] ID: ${item.id}`);
              this.addLog(`    标题: ${item.title}`);
              this.addLog(`    图片: ${item.imgUrl || item.imageUrl || "无"}`);
              this.addLog(`    内容: ${item.content || "无"}`);
              this.addLog(`    状态: ${item.status}`);
              this.addLog(`    排序: ${item.sort || 0}`);
            });
          } else {
            this.addLog("⚠️ 返回空数组");
          }
        } else {
          this.addLog("⚠️ 响应中没有data字段");
        }
      } catch (error) {
        this.addLog("❌ 请求失败");
        this.addLog(`错误信息: ${error.message}`);
        this.addLog(`错误详情: ${JSON.stringify(error)}`);
      }
      this.addLog("\n" + "=".repeat(50) + "\n");
    },
    // 测试公告API
    async testNoticeAPI() {
      this.addLog("=== 开始测试公告API ===");
      this.addLog(`请求地址: ${this.baseUrl}/public/notice/list`);
      try {
        const res = await api_notice.getNoticeList({ type: 1 });
        this.addLog("✅ 请求成功");
        this.addLog(`响应码: ${res.code}`);
        this.addLog(`响应消息: ${res.message || "无"}`);
        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : [];
          this.addLog(`数据类型: ${Array.isArray(res.data) ? "数组" : typeof res.data}`);
          this.addLog(`数据长度: ${data.length}`);
          if (data.length > 0) {
            this.addLog("\n📋 公告数据详情:");
            data.forEach((item, index) => {
              this.addLog(`
[${index + 1}] ID: ${item.id}`);
              this.addLog(`    标题: ${item.title}`);
              this.addLog(`    类型: ${item.type === 1 ? "公告" : item.type === 2 ? "活动" : "未知"}`);
              this.addLog(`    状态: ${item.status === 1 ? "显示" : "隐藏"}`);
              this.addLog(`    创建时间: ${item.createTime}`);
              this.addLog(`    内容: ${item.content ? item.content.substring(0, 50) + "..." : "无"}`);
            });
          } else {
            this.addLog("⚠️ 返回空数组");
          }
        } else {
          this.addLog("⚠️ 响应中没有data字段");
        }
      } catch (error) {
        this.addLog("❌ 请求失败");
        this.addLog(`错误信息: ${error.message}`);
        this.addLog(`错误详情: ${JSON.stringify(error)}`);
      }
      this.addLog("\n" + "=".repeat(50) + "\n");
    },
    // 测试配置API
    async testConfigAPI() {
      this.addLog("=== 开始测试系统配置API ===");
      this.addLog(`请求地址: ${this.baseUrl}/public/config`);
      try {
        const res = await api_config.getConfigs();
        this.addLog("✅ 请求成功");
        this.addLog(`响应码: ${res.code}`);
        this.addLog(`响应消息: ${res.message || "无"}`);
        if (res.data) {
          this.addLog(`数据类型: ${typeof res.data}`);
          this.addLog(`是否为对象: ${typeof res.data === "object"}`);
          this.addLog(`是否为数组: ${Array.isArray(res.data)}`);
          this.addLog("\n⚙️ 配置数据详情:");
          if (typeof res.data === "object" && !Array.isArray(res.data)) {
            const keys = Object.keys(res.data);
            this.addLog(`配置项数量: ${keys.length}`);
            this.addLog(`配置键列表: ${keys.join(", ")}`);
            keys.forEach((key, index) => {
              const value = res.data[key];
              this.addLog(`
[${index + 1}] 键: ${key}`);
              this.addLog(`    值: ${value}`);
              this.addLog(`    类型: ${typeof value}`);
              let displayValue = value;
              if (key === "base_price")
                displayValue = `¥${value}元`;
              else if (key === "per_km_price")
                displayValue = `¥${value}元/公里`;
              else if (key === "weather_rate")
                displayValue = `${value}倍`;
              else if (key === "platform_rate")
                displayValue = `${value}%`;
              this.addLog(`    格式化: ${displayValue}`);
            });
            this.addLog("\n📋 预期轮播效果:");
            this.addLog("配置轮播会垂直显示上述配置项");
            this.addLog("每个配置项会显示中文名称和格式化后的值");
          } else {
            this.addLog(`⚠️ 数据格式异常，应为对象`);
            this.addLog(`实际数据: ${JSON.stringify(res.data)}`);
          }
        } else {
          this.addLog("⚠️ 响应中没有data字段");
        }
      } catch (error) {
        this.addLog("❌ 请求失败");
        this.addLog(`错误信息: ${error.message}`);
        this.addLog(`错误详情: ${JSON.stringify(error)}`);
      }
      this.addLog("\n" + "=".repeat(50) + "\n");
    },
    // 一键测试全部API
    async testAllAPIs() {
      this.clearLogs();
      this.addLog("🚀 开始一键测试全部API\n");
      await this.testBannerAPI();
      await this.testNoticeAPI();
      await this.testConfigAPI();
      this.addLog("\n✅ 全部API测试完成！");
    },
    // 清空日志
    clearLogs() {
      this.logs = "";
      this.addLog("日志已清空\n");
    }
  },
  onLoad() {
    this.addLog("🔧 API调试工具已启动");
    this.addLog(`后端地址: ${this.baseUrl}`);
    this.addLog("点击上方按钮开始测试API\n");
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.testBannerAPI && $options.testBannerAPI(...args)),
    b: common_vendor.o((...args) => $options.testNoticeAPI && $options.testNoticeAPI(...args)),
    c: common_vendor.o((...args) => $options.testConfigAPI && $options.testConfigAPI(...args)),
    d: common_vendor.o((...args) => $options.testAllAPIs && $options.testAllAPIs(...args)),
    e: common_vendor.o((...args) => $options.clearLogs && $options.clearLogs(...args)),
    f: common_vendor.t($data.logs),
    g: common_vendor.t($data.baseUrl),
    h: common_vendor.t($data.baseUrl),
    i: common_vendor.t($data.baseUrl)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-571cea9f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/debug/api.js.map
