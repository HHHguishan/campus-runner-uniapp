"use strict";
const common_vendor = require("../../common/vendor.js");
const api_common = require("../../api/common.js");
const api_rider = require("../../api/rider.js");
const _sfc_main = {
  data() {
    return {
      // 认证信息
      authInfo: {
        status: void 0,
        // 0-待审核, 1-通过, 2-驳回
        auditReason: ""
      },
      // 表单数据
      formData: {
        realName: "",
        // 真实姓名
        studentId: "",
        // 学号
        schoolName: "",
        // 学校名称
        college: "",
        // 所属学院
        studentCardImg: ""
        // 学生证照片
      }
    };
  },
  computed: {
    // 是否待审核
    isPending() {
      return this.authInfo.status === 0;
    },
    // 是否已通过
    isApproved() {
      return this.authInfo.status === 1;
    },
    // 是否可以提交
    canSubmit() {
      return this.formData.realName && this.formData.studentId && this.formData.schoolName && this.formData.college && this.formData.studentCardImg;
    }
  },
  onLoad() {
    this.loadAuthStatus();
  },
  methods: {
    // 加载认证状态
    async loadAuthStatus() {
      try {
        const result = await api_rider.getRunnerStatus();
        if (result.data) {
          this.authInfo = result.data;
          if (result.data.realName) {
            this.formData.realName = result.data.realName;
            this.formData.studentId = result.data.studentId;
            this.formData.schoolName = result.data.schoolName;
            this.formData.college = result.data.college;
            this.formData.studentCardImg = result.data.studentCardImg;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/rider/auth.vue:195", "获取认证状态失败:", error);
      }
    },
    // 选择图片
    chooseImage() {
      if (this.isPending) {
        common_vendor.index.showToast({
          title: "审核中无法修改",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadImage(tempFilePath);
        }
      });
    },
    // 上传图片
    async uploadImage(filePath) {
      try {
        common_vendor.index.showLoading({ title: "上传中...", mask: true });
        const result = await api_common.uploadFile(filePath, "id_card");
        common_vendor.index.hideLoading();
        this.formData.studentCardImg = result.data;
        common_vendor.index.showToast({
          title: "上传成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/rider/auth.vue:237", "上传失败:", error);
      }
    },
    // 提交认证
    async handleSubmit() {
      if (!this.canSubmit) {
        common_vendor.index.showToast({
          title: "请完善所有信息",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中...", mask: true });
        await api_rider.submitStudentCardApply(this.formData);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "提交成功，请等待审核",
          icon: "success",
          duration: 2e3
        });
        setTimeout(() => {
          this.loadAuthStatus();
        }, 1e3);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/rider/auth.vue:271", "提交失败:", error);
      }
    },
    // 前往接单大厅
    goToHall() {
      common_vendor.index.redirectTo({
        url: "/pages/hall/hall"
      });
    },
    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        0: "⏳",
        1: "✅",
        2: "❌"
      };
      return iconMap[status] || "";
    },
    // 获取状态标题
    getStatusTitle(status) {
      const titleMap = {
        0: "审核中",
        1: "认证已通过",
        2: "认证未通过"
      };
      return titleMap[status] || "未认证";
    },
    // 获取状态描述
    getStatusDesc(status) {
      const descMap = {
        0: "您的认证申请正在审核中，请耐心等待",
        1: "恭喜！您已成为认证骑手",
        2: "很遗憾，您的认证未通过，请修改后重新提交"
      };
      return descMap[status] || "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.authInfo.status !== void 0
  }, $data.authInfo.status !== void 0 ? common_vendor.e({
    b: common_vendor.t($options.getStatusIcon($data.authInfo.status)),
    c: common_vendor.t($options.getStatusTitle($data.authInfo.status)),
    d: common_vendor.t($options.getStatusDesc($data.authInfo.status)),
    e: $data.authInfo.status === 2 && $data.authInfo.auditReason
  }, $data.authInfo.status === 2 && $data.authInfo.auditReason ? {
    f: common_vendor.t($data.authInfo.auditReason)
  } : {}) : {}, {
    g: !$options.isApproved
  }, !$options.isApproved ? common_vendor.e({
    h: $options.isPending,
    i: $data.formData.realName,
    j: common_vendor.o(($event) => $data.formData.realName = $event.detail.value),
    k: $options.isPending,
    l: $data.formData.studentId,
    m: common_vendor.o(($event) => $data.formData.studentId = $event.detail.value),
    n: $options.isPending,
    o: $data.formData.schoolName,
    p: common_vendor.o(($event) => $data.formData.schoolName = $event.detail.value),
    q: $options.isPending,
    r: $data.formData.college,
    s: common_vendor.o(($event) => $data.formData.college = $event.detail.value),
    t: $data.formData.studentCardImg
  }, $data.formData.studentCardImg ? {
    v: $data.formData.studentCardImg
  } : {}, {
    w: common_vendor.o(($event) => $options.chooseImage("studentCard")),
    x: common_vendor.t($options.isPending ? "审核中" : "提交认证"),
    y: !$options.canSubmit || $options.isPending,
    z: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  }) : {
    A: common_vendor.o((...args) => $options.goToHall && $options.goToHall(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d89b5b71"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/rider/auth.js.map
