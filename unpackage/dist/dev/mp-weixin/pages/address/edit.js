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
      regionText: "",
      // 地区文本（仅显示用）
      formData: {
        contactName: "",
        contactPhone: "",
        addressName: "",
        // 地址名称，如：北门菜鸟、学校宿舍
        detail: "",
        // 详细门牌号
        isDefault: 0,
        lat: null,
        // 纬度
        lng: null
        // 经度
      }
    };
  },
  computed: {
    hasCoords() {
      return this.formData.lat && this.formData.lng;
    },
    isBeijingCoord() {
      if (!this.hasCoords)
        return false;
      return Math.abs(this.formData.lat - 39.9) < 0.1 && Math.abs(this.formData.lng - 116.4) < 0.1;
    },
    coordStatusText() {
      if (!this.hasCoords)
        return "未设置定位坐标，请点击地图选点";
      if (this.isBeijingCoord && !this.formData.detail.includes("北京")) {
        return "检测到定位可能在异常区域（北京），请重选";
      }
      return `位置已设定 (${this.formData.lat.toFixed(3)}, ${this.formData.lng.toFixed(3)})`;
    }
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
            addressName: data.addressName || "",
            detail: data.detail || "",
            isDefault: data.isDefault || 0,
            lat: data.lat,
            lng: data.lng
          };
          common_vendor.index.__f__("log", "at pages/address/edit.vue:163", "✅ 地址详情加载成功:", this.formData);
        } else {
          common_vendor.index.showToast({
            title: "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/address/edit.vue:172", "❌ 加载地址详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      }
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
      if (!this.formData.addressName.trim()) {
        common_vendor.index.showToast({
          title: "请输入地址名称",
          icon: "none"
        });
        return false;
      }
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
      if (!this.formData.detail.trim()) {
        common_vendor.index.showToast({
          title: "请输入详细门牌号",
          icon: "none"
        });
        return false;
      }
      if (this.formData.lat && Math.abs(this.formData.lat - 39.9) < 0.1 && !this.formData.detail.includes("北京")) {
        common_vendor.index.showToast({
          title: "检测到定位在异常区域（北京），请在地图选点重新选择",
          icon: "none",
          duration: 3e3
        });
        return false;
      }
      return true;
    },
    /**
     * 从地图选择位置
     */
    async chooseFromMap() {
      let centerLat = 22.817;
      let centerLng = 108.366;
      try {
        const loc = await new Promise((resolve) => {
          common_vendor.index.getLocation({ type: "gcj02", success: resolve, fail: () => resolve(null) });
        });
        if (loc) {
          centerLat = loc.latitude;
          centerLng = loc.longitude;
        }
      } catch (e) {
      }
      common_vendor.index.chooseLocation({
        latitude: centerLat,
        longitude: centerLng,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/address/edit.vue:267", "📍 [EDIT] 地图选点结果 Raw:", JSON.stringify(res));
          this.formData.addressName = res.name || "";
          this.formData.detail = res.address || "";
          this.formData.lat = res.latitude;
          this.formData.lng = res.longitude;
          common_vendor.index.showToast({
            title: "位置已同步",
            icon: "none"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/address/edit.vue:280", "❌ 地图选点失败:", err);
          if (err.errMsg.indexOf("auth deny") > -1) {
            common_vendor.index.showModal({
              title: "提示",
              content: "请在设置中开启位置权限",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  common_vendor.index.openSetting();
                }
              }
            });
          }
        }
      });
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
        common_vendor.index.__f__("error", "at pages/address/edit.vue:341", "❌ 保存地址失败:", error);
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
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.isEdit ? "编辑地址" : "添加地址"),
    c: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args)),
    d: $data.formData.addressName,
    e: common_vendor.o(($event) => $data.formData.addressName = $event.detail.value),
    f: common_vendor.o((...args) => $options.chooseFromMap && $options.chooseFromMap(...args)),
    g: $data.formData.contactName,
    h: common_vendor.o(($event) => $data.formData.contactName = $event.detail.value),
    i: $data.formData.contactPhone,
    j: common_vendor.o(($event) => $data.formData.contactPhone = $event.detail.value),
    k: $data.formData.detail,
    l: common_vendor.o(($event) => $data.formData.detail = $event.detail.value),
    m: common_vendor.t($options.isBeijingCoord ? "⚠️" : $options.hasCoords ? "✅" : "❓"),
    n: common_vendor.t($options.coordStatusText),
    o: $options.isBeijingCoord ? 1 : "",
    p: $options.hasCoords && !$options.isBeijingCoord ? 1 : "",
    q: $data.formData.isDefault === 1,
    r: common_vendor.o((...args) => $options.onDefaultChange && $options.onDefaultChange(...args)),
    s: common_vendor.o((...args) => $options.saveAddress && $options.saveAddress(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dcb1f0d8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
