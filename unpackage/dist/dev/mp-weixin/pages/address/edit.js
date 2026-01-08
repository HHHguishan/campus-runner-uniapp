"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const _sfc_main = {
  data() {
    return {
      isEdit: false,
      // 是否是编辑模式
      addressId: null,
      // 地址ID（编辑模式）
      showRegionPicker: false,
      regionValue: [],
      // 省市区数组
      regionText: "",
      // 省市区文本
      formData: {
        contactName: "",
        contactPhone: "",
        province: "",
        city: "",
        district: "",
        detailAddress: "",
        isDefault: 0,
        latitude: null,
        longitude: null
      }
    };
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true;
      this.addressId = options.id;
      this.loadAddressDetail();
    }
  },
  methods: {
    /**
     * 加载地址详情（编辑模式）
     */
    async loadAddressDetail() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_address.getAddressDetail(this.addressId);
        common_vendor.index.hideLoading();
        if (res.code === 200 && res.data) {
          const data = res.data;
          this.formData = {
            contactName: data.contactName || "",
            contactPhone: data.contactPhone || "",
            province: data.province || "",
            city: data.city || "",
            district: data.district || "",
            detailAddress: data.detailAddress || "",
            isDefault: data.isDefault || 0,
            latitude: data.latitude,
            longitude: data.longitude
          };
          if (data.province && data.city && data.district) {
            this.regionValue = [data.province, data.city, data.district];
            this.regionText = `${data.province} ${data.city} ${data.district}`;
          }
          common_vendor.index.__f__("log", "at pages/address/edit.vue:153", "✅ 地址详情加载成功:", this.formData);
        } else {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/address/edit.vue:162", "❌ 加载地址详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 省市区选择改变
     */
    onRegionChange(e) {
      const value = e.detail.value;
      this.regionValue = value;
      this.regionText = value.join(" ");
      this.formData.province = value[0];
      this.formData.city = value[1];
      this.formData.district = value[2];
      this.showRegionPicker = false;
    },
    /**
     * 默认地址开关改变
     */
    onDefaultChange(e) {
      this.formData.isDefault = e.detail.value ? 1 : 0;
    },
    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.contactName.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系人姓名",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.contactPhone.trim()) {
        common_vendor.index.showToast({
          title: "请输入联系电话",
          icon: "none"
        });
        return false;
      }
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.formData.contactPhone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.province || !this.formData.city || !this.formData.district) {
        common_vendor.index.showToast({
          title: "请选择所在地区",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.detailAddress.trim()) {
        common_vendor.index.showToast({
          title: "请输入详细地址",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    /**
     * 保存地址
     */
    async saveAddress() {
      if (!this.validateForm()) {
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const requestData = {
          ...this.formData
        };
        if (this.isEdit && this.addressId) {
          requestData.id = this.addressId;
        }
        const res = await api_address.saveAddress(requestData);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: this.isEdit ? "修改成功" : "添加成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/address/edit.vue:284", "❌ 保存地址失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请稍后重试",
          icon: "none"
        });
      }
    },
    /**
     * 返回上一页
     */
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.isEdit ? "编辑地址" : "添加地址"),
    c: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args)),
    d: $data.formData.contactName,
    e: common_vendor.o(($event) => $data.formData.contactName = $event.detail.value),
    f: $data.formData.contactPhone,
    g: common_vendor.o(($event) => $data.formData.contactPhone = $event.detail.value),
    h: $data.regionText
  }, $data.regionText ? {
    i: common_vendor.t($data.regionText)
  } : {}, {
    j: common_vendor.o(($event) => $data.showRegionPicker = true),
    k: $data.formData.detailAddress,
    l: common_vendor.o(($event) => $data.formData.detailAddress = $event.detail.value),
    m: $data.formData.isDefault === 1,
    n: common_vendor.o((...args) => $options.onDefaultChange && $options.onDefaultChange(...args)),
    o: $data.showRegionPicker
  }, $data.showRegionPicker ? {
    p: $data.regionValue,
    q: common_vendor.o((...args) => $options.onRegionChange && $options.onRegionChange(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
