"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_config = require("../../api/config.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  data() {
    return {
      // 服务类型
      serviceTypes: [
        { label: "帮我买", value: 1, icon: "🛒" },
        { label: "帮我送", value: 2, icon: "📦" },
        { label: "帮我取", value: 3, icon: "🔑" },
        { label: "全能", value: 4, icon: "🌟" }
      ],
      // 表单数据
      formData: {
        type: 1,
        // 订单类型：1-帮买, 2-帮送, 3-帮取, 4-全能
        goodsDesc: "",
        pickupAddress: null,
        // 取件地址对象
        deliveryAddress: null,
        // 送达地址对象
        contactPhone: "",
        contactName: "",
        tags: "",
        // 标签（可选）
        weight: null,
        // 重量（可选）
        distance: null
        // 距离（可选）
      },
      // 系统配置
      config: {
        basePrice: 3,
        // 起步价
        perKmPrice: 1,
        // 每公里价格
        weatherRate: 1,
        // 天气加价倍率
        platformRate: 0.1
        // 平台抽成比例
      },
      // 估价
      estimatedPrice: "0.00",
      priceBreakdown: null
    };
  },
  computed: {
    // 是否可以提交
    canSubmit() {
      return this.formData.type && this.formData.goodsDesc.trim() && this.formData.pickupAddress && this.formData.deliveryAddress && this.formData.contactPhone && this.formData.contactName;
    }
  },
  async onLoad(options) {
    if (options.serviceType) {
      this.formData.type = Number(options.serviceType);
    }
    await this.loadConfig();
    await this.loadUserInfo();
    this.calculatePrice();
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/order/create.vue:237", "✅ 订单页面 onShow 触发");
    common_vendor.index.__f__("log", "at pages/order/create.vue:238", "当前表单数据:", JSON.stringify(this.formData, null, 2));
    this.$forceUpdate();
    if (this.formData.pickupAddress || this.formData.deliveryAddress) {
      common_vendor.index.__f__("log", "at pages/order/create.vue:245", "地址已选择，重新计算价格");
      this.calculatePrice();
    }
  },
  methods: {
    /**
     * 加载系统配置
     */
    async loadConfig() {
      try {
        const res = await api_config.getConfigs("base_price,per_km_price,weather_rate,platform_rate");
        if (res.code === 200 && res.data) {
          const data = res.data;
          this.config = {
            basePrice: Number(data.base_price || 3),
            perKmPrice: Number(data.per_km_price || 1),
            weatherRate: Number(data.weather_rate || 1),
            platformRate: Number(data.platform_rate || 0.1)
          };
          common_vendor.index.__f__("log", "at pages/order/create.vue:266", "✅ 系统配置加载成功:", this.config);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/create.vue:269", "❌ 加载配置失败:", error);
      }
    },
    /**
     * 加载用户信息
     */
    async loadUserInfo() {
      try {
        const res = await api_user.getUserInfo();
        if (res.code === 200 && res.data) {
          if (res.data.mobile) {
            this.formData.contactPhone = res.data.mobile;
          }
          if (res.data.nickname) {
            this.formData.contactName = res.data.nickname;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/create.vue:291", "❌ 加载用户信息失败:", error);
      }
    },
    /**
     * 选择服务类型
     */
    selectServiceType(type) {
      this.formData.type = type;
      this.calculatePrice();
    },
    /**
     * 选择取件地址
     */
    selectPickupAddress() {
      common_vendor.index.__f__("log", "at pages/order/create.vue:307", "跳转到选择取件地址页面");
      common_vendor.index.navigateTo({
        url: "/pages/address/list?from=order&field=pickup"
      });
    },
    /**
     * 选择送达地址
     */
    selectDeliveryAddress() {
      common_vendor.index.__f__("log", "at pages/order/create.vue:317", "跳转到选择送达地址页面");
      common_vendor.index.navigateTo({
        url: "/pages/address/list?from=order&field=delivery"
      });
    },
    /**
     * 计算订单价格
     */
    calculatePrice() {
      const baseFee = this.config.basePrice;
      const distanceFee = 2 * this.config.perKmPrice;
      const subtotal = baseFee + distanceFee;
      const total = subtotal * this.config.weatherRate;
      this.estimatedPrice = total.toFixed(2);
      this.priceBreakdown = {
        basePrice: baseFee.toFixed(2),
        distanceFee: distanceFee.toFixed(2),
        weatherRate: this.config.weatherRate
      };
    },
    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.type) {
        common_vendor.index.showToast({ title: "请选择服务类型", icon: "none" });
        return false;
      }
      if (!this.formData.goodsDesc.trim()) {
        common_vendor.index.showToast({ title: "请输入物品信息", icon: "none" });
        return false;
      }
      if (!this.formData.pickupAddress) {
        common_vendor.index.showToast({ title: "请选择取件地址", icon: "none" });
        return false;
      }
      if (!this.formData.deliveryAddress) {
        common_vendor.index.showToast({ title: "请选择送达地址", icon: "none" });
        return false;
      }
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.formData.contactPhone)) {
        common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
        return false;
      }
      if (!this.formData.contactName.trim()) {
        common_vendor.index.showToast({ title: "请输入联系人姓名", icon: "none" });
        return false;
      }
      return true;
    },
    /**
     * 提交订单
     */
    async submitOrder() {
      if (!this.validateForm()) {
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        const orderData = {
          type: this.formData.type,
          // 订单类型：1-帮买, 2-帮送, 3-帮取, 4-全能
          goodsDesc: this.formData.goodsDesc,
          // 物品描述
          pickupAddr: this.formData.pickupAddress.detail,
          // 取货地址（详细门牌号）
          pickupLat: this.formData.pickupAddress.lat || 23.123456,
          // 取货纬度（默认值）
          pickupLng: this.formData.pickupAddress.lng || 113.123456,
          // 取货经度（默认值）
          deliveryAddr: this.formData.deliveryAddress.detail,
          // 送货地址（详细门牌号）
          deliveryLat: this.formData.deliveryAddress.lat || 23.123456,
          // 送货纬度（默认值）
          deliveryLng: this.formData.deliveryAddress.lng || 113.123456,
          // 送货经度（默认值）
          contactName: this.formData.contactName,
          // 收货人姓名
          contactPhone: this.formData.contactPhone,
          // 收货人电话
          weight: this.formData.weight,
          // 重量（可选）
          tags: this.formData.tags || void 0,
          // 标签（可选）
          distance: this.formData.distance || void 0
          // 距离（可选）
        };
        common_vendor.index.__f__("log", "at pages/order/create.vue:411", "📤 提交订单数据:", orderData);
        const res = await api_order.createOrder(orderData);
        common_vendor.index.__f__("log", "at pages/order/create.vue:415", "📥 创建订单响应:", JSON.stringify(res, null, 2));
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          const orderInfo = res.data;
          common_vendor.index.__f__("log", "at pages/order/create.vue:421", "✅ 订单信息:", orderInfo);
          const orderId = orderInfo.id;
          const totalAmount = orderInfo.totalFee || "0.00";
          common_vendor.index.__f__("log", "at pages/order/create.vue:427", "订单ID:", orderId);
          common_vendor.index.__f__("log", "at pages/order/create.vue:428", "订单金额:", totalAmount);
          if (!orderId) {
            common_vendor.index.__f__("error", "at pages/order/create.vue:431", "❌ 订单ID不存在，无法跳转支付页面");
            common_vendor.index.showToast({
              title: "订单创建失败，缺少订单ID",
              icon: "none",
              duration: 2e3
            });
            return;
          }
          common_vendor.index.showToast({
            title: "订单创建成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: `/pages/order/payment?orderId=${orderId}&totalAmount=${totalAmount}`
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: res.message || "创建失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/order/create.vue:460", "❌ 创建订单失败:", error);
        common_vendor.index.showToast({
          title: "创建失败，请稍后重试",
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
    b: common_vendor.f($data.serviceTypes, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.icon),
        b: common_vendor.t(item.label),
        c: $data.formData.type === item.value ? 1 : "",
        d: item.value,
        e: common_vendor.o(($event) => $options.selectServiceType(item.value), item.value)
      };
    }),
    c: $data.formData.goodsDesc,
    d: common_vendor.o(($event) => $data.formData.goodsDesc = $event.detail.value),
    e: common_vendor.t($data.formData.goodsDesc.length),
    f: $data.formData.pickupAddress
  }, $data.formData.pickupAddress ? common_vendor.e({
    g: common_vendor.t($data.formData.pickupAddress.addressName),
    h: common_vendor.t($data.formData.pickupAddress.contactPhone),
    i: $data.formData.pickupAddress.contactName
  }, $data.formData.pickupAddress.contactName ? {
    j: common_vendor.t($data.formData.pickupAddress.contactName)
  } : {}, {
    k: common_vendor.t($data.formData.pickupAddress.detail)
  }) : {}, {
    l: common_vendor.o((...args) => $options.selectPickupAddress && $options.selectPickupAddress(...args)),
    m: $data.formData.deliveryAddress
  }, $data.formData.deliveryAddress ? common_vendor.e({
    n: common_vendor.t($data.formData.deliveryAddress.addressName),
    o: common_vendor.t($data.formData.deliveryAddress.contactPhone),
    p: $data.formData.deliveryAddress.contactName
  }, $data.formData.deliveryAddress.contactName ? {
    q: common_vendor.t($data.formData.deliveryAddress.contactName)
  } : {}, {
    r: common_vendor.t($data.formData.deliveryAddress.detail)
  }) : {}, {
    s: common_vendor.o((...args) => $options.selectDeliveryAddress && $options.selectDeliveryAddress(...args)),
    t: $data.formData.contactPhone,
    v: common_vendor.o(($event) => $data.formData.contactPhone = $event.detail.value),
    w: $data.formData.contactName,
    x: common_vendor.o(($event) => $data.formData.contactName = $event.detail.value),
    y: $data.formData.tags,
    z: common_vendor.o(($event) => $data.formData.tags = $event.detail.value),
    A: common_vendor.t($data.estimatedPrice),
    B: $data.priceBreakdown
  }, $data.priceBreakdown ? common_vendor.e({
    C: common_vendor.t($data.priceBreakdown.basePrice),
    D: $data.priceBreakdown.distanceFee
  }, $data.priceBreakdown.distanceFee ? {
    E: common_vendor.t($data.priceBreakdown.distanceFee)
  } : {}, {
    F: $data.priceBreakdown.weatherFee
  }, $data.priceBreakdown.weatherFee ? {
    G: common_vendor.t($data.priceBreakdown.weatherRate)
  } : {}) : {}, {
    H: common_vendor.t($data.estimatedPrice),
    I: common_vendor.o((...args) => $options.submitOrder && $options.submitOrder(...args)),
    J: !$options.canSubmit
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8837ac90"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/create.js.map
