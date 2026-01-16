"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      records: [],
      hasMore: false,
      loading: false
    };
  },
  onLoad() {
    this.loadRecords(true);
  },
  onPullDownRefresh() {
    this.loadRecords(true);
  },
  methods: {
    async loadRecords(reset = false) {
      if (this.loading)
        return;
      if (reset) {
        this.pageNum = 1;
        this.records = [];
      }
      this.loading = true;
      try {
        const res = await this.$request({
          url: "/withdraw/list",
          params: {
            pageNum: this.pageNum,
            pageSize: this.pageSize
          }
        });
        if (res.code === 200) {
          const list = res.data.records;
          this.records = this.records.concat(list);
          this.hasMore = list.length === this.pageSize;
          this.pageNum++;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/wallet/withdraw-records.vue:100", "加载提现记录失败", e);
      } finally {
        this.loading = false;
        common_vendor.index.stopPullDownRefresh();
      }
    },
    goBack() {
      common_vendor.index.navigateBack();
    },
    getTypeName(type) {
      const map = { alipay: "支付宝", wechat: "微信", bank: "银行卡" };
      return map[type] || "其他";
    },
    getIcon(type) {
      const map = { alipay: "💙", wechat: "💚", bank: "💳" };
      return map[type] || "💰";
    },
    getStatusText(status) {
      const map = { 0: "审核中", 1: "已打款", 2: "已驳回" };
      return map[status];
    },
    formatDate(dateStr) {
      if (!dateStr)
        return "-";
      return dateStr.replace("T", " ").substring(0, 16);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.records.length > 0
  }, $data.records.length > 0 ? common_vendor.e({
    c: common_vendor.f($data.records, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getIcon(item.accountType)),
        b: common_vendor.t($options.getTypeName(item.accountType)),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: common_vendor.n("status-" + item.status),
        e: common_vendor.t(item.amount.toFixed(2)),
        f: common_vendor.t(item.accountNo),
        g: common_vendor.t(item.realName),
        h: common_vendor.t($options.formatDate(item.createTime)),
        i: item.status === 2
      }, item.status === 2 ? {
        j: common_vendor.t(item.auditMsg || "账号异常")
      } : {}, {
        k: item.id
      });
    }),
    d: $data.hasMore
  }, $data.hasMore ? {
    e: common_vendor.o((...args) => $options.loadRecords && $options.loadRecords(...args))
  } : {}) : {
    f: common_assets._imports_0$1
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8131fd70"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/withdraw-records.js.map
