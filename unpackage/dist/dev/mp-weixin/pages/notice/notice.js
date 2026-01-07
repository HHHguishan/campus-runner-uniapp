"use strict";
const common_vendor = require("../../common/vendor.js");
const api_notice = require("../../api/notice.js");
const _sfc_main = {
  data() {
    return {
      currentType: null,
      // 当前选中的类型 null=全部 1=公告 2=活动
      noticeList: [],
      loading: false
    };
  },
  onLoad() {
    this.loadNotices();
  },
  methods: {
    // 加载公告列表
    async loadNotices() {
      this.loading = true;
      try {
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:90", "=== 开始加载公告列表 ===");
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:91", "当前公告类型:", this.currentType);
        const params = {};
        if (this.currentType !== null) {
          params.type = this.currentType;
        }
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:98", "请求参数:", params);
        const res = await api_notice.getNoticeList(params);
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:102", "公告API响应:", res);
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:103", "响应码:", res.code);
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:104", "响应数据:", res.data);
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:105", "数据类型:", typeof res.data);
        common_vendor.index.__f__("log", "at pages/notice/notice.vue:106", "是否为数组:", Array.isArray(res.data));
        if (res.code === 200 && res.data) {
          const noticeData = Array.isArray(res.data) ? res.data : [];
          common_vendor.index.__f__("log", "at pages/notice/notice.vue:112", "处理后的公告数据:", noticeData);
          common_vendor.index.__f__("log", "at pages/notice/notice.vue:113", "公告数量:", noticeData.length);
          this.noticeList = noticeData.map((item) => {
            return {
              id: item.id,
              title: item.title || "公告标题",
              content: item.content,
              imgUrl: item.imgUrl || item.imageUrl || "",
              type: item.type,
              status: item.status,
              sort: item.sort || 0,
              createTime: item.createTime
            };
          });
          common_vendor.index.__f__("log", "at pages/notice/notice.vue:129", "最终公告列表:", this.noticeList);
        } else {
          common_vendor.index.__f__("log", "at pages/notice/notice.vue:131", "响应码不是200或没有数据");
          this.noticeList = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notice/notice.vue:135", "=== 加载公告失败 ===");
        common_vendor.index.__f__("error", "at pages/notice/notice.vue:136", "错误信息:", error);
        common_vendor.index.__f__("error", "at pages/notice/notice.vue:137", "错误详情:", JSON.stringify(error));
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
        this.noticeList = [];
      } finally {
        this.loading = false;
      }
    },
    // 切换公告类型
    switchType(type) {
      if (this.currentType === type)
        return;
      this.currentType = type;
      this.loadNotices();
    },
    // 查看公告详情
    viewNoticeDetail(notice) {
      common_vendor.index.showModal({
        title: notice.title,
        content: notice.content || "暂无详细内容",
        showCancel: false,
        confirmText: "我知道了"
      });
    },
    // 格式化时间
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 36e5) {
        return Math.floor(diff / 6e4) + "分钟前";
      }
      if (diff < 864e5) {
        return Math.floor(diff / 36e5) + "小时前";
      }
      if (diff < 6048e5) {
        return Math.floor(diff / 864e5) + "天前";
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    // 获取内容预览
    getContentPreview(content) {
      if (!content)
        return "";
      if (content.length <= 50)
        return content;
      return content.substring(0, 50) + "...";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentType === null ? 1 : "",
    b: common_vendor.o(($event) => $options.switchType(null)),
    c: $data.currentType === 1 ? 1 : "",
    d: common_vendor.o(($event) => $options.switchType(1)),
    e: $data.currentType === 2 ? 1 : "",
    f: common_vendor.o(($event) => $options.switchType(2)),
    g: $data.noticeList.length > 0
  }, $data.noticeList.length > 0 ? {
    h: common_vendor.f($data.noticeList, (notice, k0, i0) => {
      return common_vendor.e({
        a: notice.type === 1
      }, notice.type === 1 ? {} : notice.type === 2 ? {} : {}, {
        b: notice.type === 2,
        c: common_vendor.t(notice.title),
        d: common_vendor.t($options.formatTime(notice.createTime)),
        e: notice.imgUrl
      }, notice.imgUrl ? {
        f: notice.imgUrl
      } : {}, {
        g: notice.content
      }, notice.content ? {
        h: common_vendor.t($options.getContentPreview(notice.content))
      } : {}, {
        i: notice.id,
        j: common_vendor.o(($event) => $options.viewNoticeDetail(notice), notice.id)
      });
    })
  } : !$data.loading ? {} : {}, {
    i: !$data.loading,
    j: $data.loading
  }, $data.loading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1c2e4c1e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notice/notice.js.map
