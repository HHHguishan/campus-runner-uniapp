"use strict";
const common_vendor = require("../../common/vendor.js");
const api_rider = require("../../api/rider.js");
const _sfc_main = {
  data() {
    return {
      orderId: null,
      orderInfo: null,
      imageUrl: ""
    };
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
    }
    if (options.orderInfo) {
      try {
        this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/upload-finish/upload-finish.vue:73", "解析订单信息失败:", error);
      }
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 选择图片
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.imageUrl = res.tempFilePaths[0];
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/upload-finish/upload-finish.vue:94", "选择图片失败:", err);
        }
      });
    },
    // 提交完成配送
    async handleSubmit() {
      if (!this.imageUrl) {
        common_vendor.index.showToast({
          title: "请先上传完成凭证图片",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (!this.orderId) {
        common_vendor.index.showToast({
          title: "订单信息异常",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中...", mask: true });
        const finishImg = this.imageUrl;
        common_vendor.index.__f__("log", "at pages/upload-finish/upload-finish.vue:126", "提交完成配送:", {
          orderId: this.orderId,
          finishImg,
          orderIdType: typeof this.orderId
        });
        await api_rider.finishOrder({
          orderId: Number(this.orderId),
          finishImg
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "配送完成",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 2e3);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/upload-finish/upload-finish.vue:152", "完成配送失败:", error);
        common_vendor.index.showToast({
          title: error.message || "提交失败，请重试",
          icon: "none",
          duration: 2e3
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.orderInfo
  }, $data.orderInfo ? {
    c: common_vendor.t($data.orderInfo.deliveryAddr)
  } : {}, {
    d: !$data.imageUrl
  }, !$data.imageUrl ? {} : {
    e: $data.imageUrl
  }, {
    f: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    g: $data.imageUrl
  }, $data.imageUrl ? {
    h: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    i: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    j: !$data.imageUrl
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-05303c01"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/upload-finish/upload-finish.js.map
