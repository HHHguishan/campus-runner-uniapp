"use strict";
const common_vendor = require("../../common/vendor.js");
const api_forum = require("../../api/forum.js");
const _sfc_main = {
  data() {
    return {
      title: "",
      content: "",
      tag: "吐槽",
      tagOptions: ["失物", "吐槽", "闲置", "求助", "表白"],
      images: [],
      submitting: false
    };
  },
  computed: {
    canSubmit() {
      return this.title.trim().length > 0 && this.content.trim().length > 0;
    }
  },
  methods: {
    goBack() {
      if (this.title || this.content || this.images.length > 0) {
        common_vendor.index.showModal({
          title: "提示",
          content: "退出将丢失已编辑的内容，确定吗？",
          success: (res) => {
            if (res.confirm)
              common_vendor.index.navigateBack();
          }
        });
      } else {
        common_vendor.index.navigateBack();
      }
    },
    async chooseImage() {
      const count = 9 - this.images.length;
      common_vendor.index.chooseImage({
        count,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadImages(res.tempFilePaths);
        }
      });
    },
    async uploadImages(paths) {
      common_vendor.index.showLoading({ title: "正在上传..." });
      for (const path of paths) {
        try {
          this.images.push(path);
        } catch (e) {
          common_vendor.index.showToast({ title: "部分图片上传失败", icon: "none" });
        }
      }
      common_vendor.index.hideLoading();
    },
    removeImage(index) {
      this.images.splice(index, 1);
    },
    previewImage(index) {
      common_vendor.index.previewImage({
        urls: this.images,
        current: index
      });
    },
    async submit() {
      if (this.submitting)
        return;
      this.submitting = true;
      try {
        const res = await api_forum.createPost({
          title: this.title,
          content: this.content,
          tag: this.tag,
          images: this.images
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "发布成功", icon: "success" });
          common_vendor.index.$emit("refreshForum");
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "发布失败", icon: "none" });
          this.submitting = false;
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: !$options.canSubmit || $data.submitting,
    c: common_vendor.o((...args) => $options.submit && $options.submit(...args)),
    d: $data.title,
    e: common_vendor.o(($event) => $data.title = $event.detail.value),
    f: $data.content,
    g: common_vendor.o(($event) => $data.content = $event.detail.value),
    h: common_vendor.t($data.content.length),
    i: common_vendor.f($data.tagOptions, (t, k0, i0) => {
      return {
        a: common_vendor.t(t),
        b: t,
        c: $data.tag === t ? 1 : "",
        d: common_vendor.o(($event) => $data.tag = t, t)
      };
    }),
    j: common_vendor.f($data.images, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.previewImage(index), index),
        c: common_vendor.o(($event) => $options.removeImage(index), index),
        d: index
      };
    }),
    k: $data.images.length < 9
  }, $data.images.length < 9 ? {
    l: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {}, {
    m: $data.submitting
  }, $data.submitting ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ee120cef"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forum/create.js.map
