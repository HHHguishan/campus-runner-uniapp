"use strict";
const common_vendor = require("../../common/vendor.js");
const api_address = require("../../api/address.js");
const _sfc_main = {
  data() {
    return {
      addressList: [],
      loading: false,
      refreshing: false,
      showDeleteModal: false,
      deleteId: null,
      fromOrder: false,
      // 是否来自订单页面
      addressField: ""
      // 地址字段：pickup-取件地址, delivery-送达地址
    };
  },
  onLoad(options) {
    if (options.from === "order") {
      this.fromOrder = true;
      this.addressField = options.field || "";
    }
    this.loadAddressList();
  },
  onShow() {
    this.loadAddressList();
  },
  methods: {
    /**
     * 加载地址列表
     */
    async loadAddressList() {
      try {
        this.loading = true;
        const res = await api_address.getAddressList();
        if (res.code === 200) {
          this.addressList = res.data || [];
          common_vendor.index.__f__("log", "at pages/address/list.vue:141", "✅ 地址列表加载成功:", this.addressList);
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/list.vue:149", "❌ 加载地址列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true;
      await this.loadAddressList();
      this.refreshing = false;
    },
    /**
     * 加载更多（预留）
     */
    loadMore() {
    },
    /**
     * 添加新地址
     */
    addAddress() {
      common_vendor.index.navigateTo({
        url: "/pages/address/edit"
      });
    },
    /**
     * 编辑地址
     */
    editAddress(item) {
      common_vendor.index.navigateTo({
        url: `/pages/address/edit?id=${item.id}`
      });
    },
    /**
     * 选择地址（从订单页进入时）
     */
    selectAddress(item) {
      if (this.fromOrder) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          if (this.addressField === "pickup") {
            prevPage.$vm.formData.pickupAddress = item;
          } else if (this.addressField === "delivery") {
            prevPage.$vm.formData.deliveryAddress = item;
          }
          if (prevPage.$vm.calculatePrice) {
            prevPage.$vm.calculatePrice();
          }
          common_vendor.index.navigateBack();
        }
      } else {
        this.editAddress(item);
      }
    },
    /**
     * 删除地址
     */
    deleteAddress(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    /**
     * 确认删除
     */
    async confirmDelete() {
      if (!this.deleteId)
        return;
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        const res = await api_address.deleteAddress(this.deleteId);
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          await this.loadAddressList();
        } else {
          common_vendor.index.showToast({
            title: res.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/address/list.vue:259", "❌ 删除地址失败:", error);
        common_vendor.index.showToast({
          title: "删除失败，请稍后重试",
          icon: "none"
        });
      } finally {
        this.showDeleteModal = false;
        this.deleteId = null;
      }
    },
    /**
     * 设置默认地址
     */
    async setDefault(id) {
      try {
        common_vendor.index.showLoading({ title: "设置中..." });
        const address = this.addressList.find((item) => item.id === id);
        if (!address)
          return;
        const res = await api_address.saveAddress({
          ...address,
          isDefault: 1
        });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "设置成功",
            icon: "success"
          });
          await this.loadAddressList();
        } else {
          common_vendor.index.showToast({
            title: res.message || "设置失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/address/list.vue:302", "❌ 设置默认地址失败:", error);
        common_vendor.index.showToast({
          title: "设置失败，请稍后重试",
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
    b: common_vendor.f($data.addressList, (item, k0, i0) => {
      return common_vendor.e({
        a: item.isDefault === 1
      }, item.isDefault === 1 ? {} : {}, {
        b: common_vendor.t(item.contactName),
        c: common_vendor.t(item.contactPhone),
        d: common_vendor.t(item.addressName),
        e: common_vendor.t(item.detail),
        f: common_vendor.o(($event) => $options.editAddress(item), item.id),
        g: common_vendor.o(($event) => $options.deleteAddress(item.id), item.id),
        h: item.isDefault !== 1
      }, item.isDefault !== 1 ? {
        i: common_vendor.o(($event) => $options.setDefault(item.id), item.id)
      } : {}, {
        j: item.id,
        k: common_vendor.o(($event) => $options.selectAddress(item), item.id)
      });
    }),
    c: $data.addressList.length === 0 && !$data.loading
  }, $data.addressList.length === 0 && !$data.loading ? {} : {}, {
    d: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    e: $data.refreshing,
    f: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    g: common_vendor.o((...args) => $options.addAddress && $options.addAddress(...args)),
    h: $data.showDeleteModal
  }, $data.showDeleteModal ? {
    i: common_vendor.o(($event) => $data.showDeleteModal = false),
    j: common_vendor.o((...args) => $options.confirmDelete && $options.confirmDelete(...args)),
    k: common_vendor.o(() => {
    }),
    l: common_vendor.o(($event) => $data.showDeleteModal = false)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-90a3874e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/list.js.map
