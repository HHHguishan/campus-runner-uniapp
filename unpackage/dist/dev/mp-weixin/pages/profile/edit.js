"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const api_upload = require("../../api/upload.js");
const utils_token = require("../../utils/token.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      defaultAvatar: "https://via.placeholder.com/120",
      formData: {
        nickname: "",
        avatar: "",
        gender: null,
        email: ""
      },
      genderOptions: [
        { label: "保密", value: 0 },
        { label: "男", value: 1 },
        { label: "女", value: 2 }
      ],
      genderIndex: 0,
      uploading: false
    };
  },
  computed: {
    // 表单验证
    isFormValid() {
      const { nickname } = this.formData;
      return nickname && nickname.length >= 2 && nickname.length <= 20;
    }
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const result = await api_user.fetchUserInfo();
        if (result.data) {
          this.userInfo = result.data;
          this.formData = {
            nickname: result.data.nickname || "",
            avatar: result.data.avatar || "",
            gender: result.data.gender,
            email: result.data.email || ""
          };
          if (result.data.gender !== null && result.data.gender !== void 0) {
            this.genderIndex = this.genderOptions.findIndex(
              (item) => item.value === result.data.gender
            );
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:144", "加载用户信息失败:", error);
        const localUserInfo = utils_token.getUserInfo();
        if (localUserInfo) {
          this.userInfo = localUserInfo;
          this.formData = {
            nickname: localUserInfo.nickname || "",
            avatar: localUserInfo.avatar || "",
            gender: localUserInfo.gender,
            email: localUserInfo.email || ""
          };
        }
      }
    },
    // 选择头像
    chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        // 压缩图
        sourceType: ["album", "camera"],
        // 从相册选择或拍照
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadAvatar(tempFilePath);
        }
      });
    },
    // 上传头像
    async uploadAvatar(filePath) {
      if (this.uploading) {
        common_vendor.index.showToast({
          title: "上传中，请稍候",
          icon: "none"
        });
        return;
      }
      this.uploading = true;
      common_vendor.index.showLoading({
        title: "上传中..."
      });
      try {
        const result = await api_upload.uploadAvatar(filePath);
        if (result.code === 200 && result.data) {
          this.formData.avatar = result.data;
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:201", "上传头像失败:", error);
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
      } finally {
        this.uploading = false;
        common_vendor.index.hideLoading();
      }
    },
    // 性别选择
    onGenderChange(e) {
      const index = e.detail.value;
      this.genderIndex = index;
      this.formData.gender = this.genderOptions[index].value;
    },
    // 保存个人资料
    async saveProfile() {
      if (!this.isFormValid) {
        return;
      }
      if (this.formData.email) {
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailReg.test(this.formData.email)) {
          common_vendor.index.showToast({
            title: "邮箱格式不正确",
            icon: "none"
          });
          return;
        }
      }
      common_vendor.index.showLoading({
        title: "保存中..."
      });
      try {
        const updateData = {};
        if (this.formData.nickname)
          updateData.nickname = this.formData.nickname;
        if (this.formData.avatar)
          updateData.avatar = this.formData.avatar;
        if (this.formData.gender !== null && this.formData.gender !== void 0) {
          updateData.gender = this.formData.gender;
        }
        if (this.formData.email)
          updateData.email = this.formData.email;
        const result = await api_user.updateUserInfo(updateData);
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          await this.loadUserInfo();
          const updatedUserInfo = utils_token.getUserInfo();
          if (updatedUserInfo) {
            utils_token.setUserInfo(updatedUserInfo);
          }
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/edit.vue:274", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.formData.avatar || $data.defaultAvatar,
    b: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args)),
    c: $data.formData.nickname,
    d: common_vendor.o(($event) => $data.formData.nickname = $event.detail.value),
    e: common_vendor.t($data.formData.gender !== null ? $data.genderOptions[$data.genderIndex].label : "请选择"),
    f: $data.genderOptions,
    g: $data.genderIndex,
    h: common_vendor.o((...args) => $options.onGenderChange && $options.onGenderChange(...args)),
    i: $data.formData.email,
    j: common_vendor.o(($event) => $data.formData.email = $event.detail.value),
    k: common_vendor.t($data.userInfo.mobile || "未绑定"),
    l: !$options.isFormValid ? 1 : "",
    m: !$options.isFormValid,
    n: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ead3e541"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/edit.js.map
