"use strict";
const common_vendor = require("../../common/vendor.js");
const api_notice = require("../../api/notice.js");
const api_config = require("../../api/config.js");
const api_forum = require("../../api/forum.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      refreshing: false,
      // 是否正在刷新
      showModal: false,
      // 是否显示配置弹窗
      showConfigInfo: false,
      // 是否显示配置说明
      bannerList: [],
      configList: [],
      // 默认轮播图数据
      defaultBanners: [
        {
          id: "default-1",
          title: "新用户首单立减¥5",
          subtitle: "快来体验吧",
          gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          imgUrl: "",
          content: "新用户专享优惠"
        },
        {
          id: "default-2",
          title: "成为骑手 轻松赚钱",
          subtitle: "时间自由 · 多劳多得",
          gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          imgUrl: "",
          content: "join_rider"
        },
        {
          id: "default-3",
          title: "校园跑腿 随叫随到",
          subtitle: "帮买 · 帮送 · 帮取",
          gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          imgUrl: "",
          content: "service_intro"
        },
        {
          id: "default-4",
          title: "邀请好友 双方得奖励",
          subtitle: "一起省钱 一起赚钱",
          gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          imgUrl: "",
          content: "invite_friends"
        }
      ],
      recentOrders: [
        // 示例数据，后续从接口获取
        {
          id: 1,
          typeText: "帮买",
          status: 1,
          statusText: "待接单",
          address: "奶茶店 → 5号楼302",
          time: "10分钟前",
          price: "8.00"
        }
      ],
      forumPosts: []
      // 圈子动态
    };
  },
  computed: {
    // 显示的轮播图：优先显示API加载的，没有则显示默认的
    displayBanners() {
      return this.bannerList.length > 0 ? this.bannerList : this.defaultBanners;
    }
  },
  onLoad() {
    this.loadBanners();
    this.loadConfigs();
    this.loadForumPosts();
    common_vendor.index.$on("refreshForum", this.loadForumPosts);
  },
  onUnload() {
    common_vendor.index.$off("refreshForum", this.loadForumPosts);
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:244", "=== 首页显示，刷新数据 ===");
    this.loadForumPosts();
  },
  methods: {
    // 加载轮播图
    async loadBanners() {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:252", "=== 开始加载轮播图 ===");
        const res = await api_notice.getBannerList();
        common_vendor.index.__f__("log", "at pages/index/index.vue:255", "轮播图API响应:", res);
        common_vendor.index.__f__("log", "at pages/index/index.vue:256", "响应码:", res.code);
        common_vendor.index.__f__("log", "at pages/index/index.vue:257", "响应数据:", res.data);
        common_vendor.index.__f__("log", "at pages/index/index.vue:258", "数据类型:", typeof res.data);
        common_vendor.index.__f__("log", "at pages/index/index.vue:259", "是否为数组:", Array.isArray(res.data));
        if (res.code === 200 && res.data) {
          const bannerData = Array.isArray(res.data) ? res.data : [];
          common_vendor.index.__f__("log", "at pages/index/index.vue:265", "处理后的轮播图数据:", bannerData);
          common_vendor.index.__f__("log", "at pages/index/index.vue:266", "轮播图数量:", bannerData.length);
          if (bannerData.length > 0) {
            this.bannerList = bannerData.map((item, index) => {
              common_vendor.index.__f__("log", "at pages/index/index.vue:271", `处理轮播图 ${index}:`, item);
              const banner = {
                id: item.id,
                title: item.title || "轮播图",
                content: item.content,
                imgUrl: item.imgUrl || item.imageUrl || "",
                gradient: item.gradient,
                subtitle: item.subtitle || "",
                sort: item.sort || 0
              };
              if (!banner.gradient && !banner.imgUrl) {
                const gradients = [
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                ];
                banner.gradient = gradients[index % gradients.length];
              }
              return banner;
            });
            common_vendor.index.__f__("log", "at pages/index/index.vue:299", "最终轮播图列表:", this.bannerList);
          } else {
            common_vendor.index.__f__("log", "at pages/index/index.vue:301", "后端返回空数组，使用默认轮播图");
            this.bannerList = [];
          }
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:305", "响应码不是200或没有数据，使用默认轮播图");
          this.bannerList = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:309", "=== 加载轮播图失败 ===");
        common_vendor.index.__f__("error", "at pages/index/index.vue:310", "错误信息:", error);
        common_vendor.index.__f__("error", "at pages/index/index.vue:311", "错误详情:", JSON.stringify(error));
        this.bannerList = [];
      }
    },
    // 加载系统配置
    async loadConfigs() {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:320", "=== 开始加载系统配置 ===");
        const res = await api_config.getConfigs();
        common_vendor.index.__f__("log", "at pages/index/index.vue:325", "系统配置API响应完整数据:", JSON.stringify(res));
        common_vendor.index.__f__("log", "at pages/index/index.vue:326", "响应码:", res.code);
        common_vendor.index.__f__("log", "at pages/index/index.vue:327", "响应数据:", res.data);
        common_vendor.index.__f__("log", "at pages/index/index.vue:328", "数据类型:", typeof res.data);
        if (res.code === 200 && res.data) {
          const configs = [];
          if (typeof res.data === "object" && !Array.isArray(res.data)) {
            const keys = Object.keys(res.data);
            common_vendor.index.__f__("log", "at pages/index/index.vue:336", "配置键列表:", keys);
            keys.forEach((key) => {
              const value = res.data[key];
              common_vendor.index.__f__("log", "at pages/index/index.vue:340", `处理配置项: ${key} = ${value}`);
              configs.push({
                paramKey: key,
                paramValue: String(value),
                // 确保值是字符串
                displayValue: this.formatConfigValue(key, value),
                remark: this.getConfigRemark(key)
              });
            });
          } else if (Array.isArray(res.data)) {
            common_vendor.index.__f__("log", "at pages/index/index.vue:351", "后端返回数组格式，转换处理");
            this.configList = res.data.map((item) => ({
              paramKey: item.paramKey,
              paramValue: item.paramValue,
              displayValue: this.formatConfigValue(item.paramKey, item.paramValue),
              remark: item.remark || item.paramKey
            }));
            common_vendor.index.__f__("log", "at pages/index/index.vue:358", `✅ 配置加载成功，共${this.configList.length}个配置项`);
            return;
          }
          common_vendor.index.__f__("log", "at pages/index/index.vue:362", "最终配置列表数量:", configs.length);
          common_vendor.index.__f__("log", "at pages/index/index.vue:363", "最终配置列表:", JSON.stringify(configs));
          this.configList = configs;
          common_vendor.index.__f__("log", "at pages/index/index.vue:367", `✅ 配置加载成功，共${configs.length}个配置项`);
          if (configs.length > 0) {
            common_vendor.index.showToast({
              title: `配置已更新`,
              icon: "success",
              duration: 1500
            });
          }
        } else {
          common_vendor.index.__f__("log", "at pages/index/index.vue:378", "响应码不是200或没有数据");
          common_vendor.index.showToast({
            title: "配置为空",
            icon: "none",
            duration: 2e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:386", "=== 加载系统配置失败 ===");
        common_vendor.index.__f__("error", "at pages/index/index.vue:387", "错误信息:", error);
        common_vendor.index.__f__("error", "at pages/index/index.vue:388", "错误详情:", JSON.stringify(error));
        common_vendor.index.showToast({
          title: "加载配置失败",
          icon: "none"
        });
        this.configList = [];
      }
    },
    // 显示配置弹窗
    showConfigModal() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:402", "点击配置按钮，当前配置数量:", this.configList.length);
      if (this.configList.length === 0) {
        common_vendor.index.showToast({
          title: "正在加载配置...",
          icon: "loading"
        });
        this.loadConfigs().then(() => {
          setTimeout(() => {
            this.showModal = true;
          }, 500);
        });
      } else {
        this.showModal = true;
      }
    },
    // 隐藏配置弹窗
    hideConfigModal() {
      this.showModal = false;
      this.showConfigInfo = false;
    },
    // 切换配置说明显示
    toggleConfigInfo() {
      this.showConfigInfo = !this.showConfigInfo;
      common_vendor.index.__f__("log", "at pages/index/index.vue:430", "配置说明显示状态:", this.showConfigInfo);
    },
    // 格式化配置值的显示
    formatConfigValue(key, value) {
      const formatMap = {
        "base_price": `¥${value}元`,
        "per_km_price": `¥${value}元/公里`,
        "weather_rate": `${value}倍`,
        "platform_rate": `${value}%`,
        "min_delivery_fee": `¥${value}元`,
        "max_delivery_distance": `${value}公里`,
        "service_time": `${value}小时`
      };
      return formatMap[key] || value;
    },
    // 获取配置的备注名称
    getConfigRemark(key) {
      const remarkMap = {
        "base_price": "起步价",
        "per_km_price": "公里单价",
        "weather_rate": "天气系数",
        "platform_rate": "平台费率",
        "min_delivery_fee": "最低配送费",
        "max_delivery_distance": "最大配送距离",
        "service_time": "服务时间"
      };
      return remarkMap[key] || key;
    },
    // 下拉刷新
    async onRefresh() {
      common_vendor.index.__f__("log", "at pages/index/index.vue:466", "=== 开始刷新首页数据 ===");
      this.refreshing = true;
      try {
        await Promise.all([
          this.loadBanners(),
          this.loadConfigs(),
          this.loadForumPosts()
        ]);
        common_vendor.index.showToast({
          title: "刷新成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:483", "刷新失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      } finally {
        setTimeout(() => {
          this.refreshing = false;
        }, 500);
      }
    },
    // 轮播图点击事件
    onBannerClick(banner) {
      if (banner.content) {
        if (banner.content === "join_rider") {
          common_vendor.index.navigateTo({
            url: "/pages/rider/auth"
          });
        } else {
          common_vendor.index.showToast({
            title: banner.title,
            icon: "none"
          });
        }
      } else {
        common_vendor.index.showToast({
          title: banner.title,
          icon: "none"
        });
      }
    },
    // 跳转到发布订单页面
    navigateToPublish(type) {
      const typeMap = {
        "buy": 1,
        // 帮买
        "send": 2,
        // 帮送
        "fetch": 3,
        // 帮取
        "all": 4
        // 全能
      };
      const serviceType = typeMap[type] || 1;
      common_vendor.index.navigateTo({
        url: `/pages/order/create?serviceType=${serviceType}`
      });
    },
    // 跳转到订单列表
    goToOrders() {
      common_vendor.index.switchTab({
        url: "/pages/orders/orders"
      });
    },
    // 跳转到订单详情
    goToOrderDetail(orderId) {
      common_vendor.index.showToast({
        title: "订单详情功能开发中...",
        icon: "none"
      });
    },
    // 加载圈子动态
    async loadForumPosts() {
      try {
        const res = await api_forum.getPostList({
          page: 1,
          size: 3,
          orderBy: "createTime,desc"
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:563", "🔍 首页圈子响应:", res);
        if (res.code === 200) {
          let list = [];
          if (res.data) {
            if (Array.isArray(res.data)) {
              list = res.data;
            } else if (Array.isArray(res.data.records)) {
              list = res.data.records;
            }
          }
          this.forumPosts = list;
          common_vendor.index.__f__("log", "at pages/index/index.vue:574", "✅ 首页圈子加载成功:", this.forumPosts.length);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:577", "❌ 加载首页圈子失败:", error);
      }
    },
    // 跳转到圈子列表
    goToForum() {
      common_vendor.index.navigateTo({
        url: "/pages/forum/index"
      });
    },
    // 跳转到帖子详情
    goToPostDetail(postId) {
      common_vendor.index.navigateTo({
        url: `/pages/forum/detail?id=${postId}`
      });
    },
    // 点赞处理
    async onPostLike(postId) {
      try {
        const res = await api_forum.likePost(postId);
        if (res.code === 200) {
          const index = this.forumPosts.findIndex((p) => p.id === postId);
          if (index !== -1) {
            const post = this.forumPosts[index];
            post.liked = res.data.liked;
            post.likeCount = res.data.likeCount;
            this.forumPosts[index] = post;
          }
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    }
  }
};
if (!Array) {
  const _easycom_post_card2 = common_vendor.resolveComponent("post-card");
  _easycom_post_card2();
}
const _easycom_post_card = () => "../../components/post-card/post-card.js";
if (!Math) {
  _easycom_post_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.refreshing ? 1 : "",
    b: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    c: common_vendor.f($options.displayBanners, (banner, k0, i0) => {
      return common_vendor.e({
        a: banner.imgUrl
      }, banner.imgUrl ? {
        b: banner.imgUrl
      } : common_vendor.e({
        c: common_vendor.t(banner.title),
        d: banner.subtitle
      }, banner.subtitle ? {
        e: common_vendor.t(banner.subtitle)
      } : {}, {
        f: banner.gradient
      }), {
        g: banner.id,
        h: common_vendor.o(($event) => $options.onBannerClick(banner), banner.id)
      });
    }),
    d: common_vendor.o(($event) => $options.navigateToPublish("buy")),
    e: common_vendor.o(($event) => $options.navigateToPublish("send")),
    f: common_vendor.o(($event) => $options.navigateToPublish("fetch")),
    g: common_vendor.o(($event) => $options.navigateToPublish("all")),
    h: common_vendor.o(($event) => $options.navigateToPublish("all")),
    i: common_vendor.o((...args) => $options.showConfigModal && $options.showConfigModal(...args)),
    j: common_vendor.o((...args) => $options.goToForum && $options.goToForum(...args)),
    k: common_vendor.f($data.forumPosts, (post, k0, i0) => {
      return {
        a: post.id,
        b: common_vendor.o($options.goToPostDetail, post.id),
        c: common_vendor.o($options.onPostLike, post.id),
        d: "1cf27b2a-0-" + i0,
        e: common_vendor.p({
          post
        })
      };
    }),
    l: $data.forumPosts.length === 0
  }, $data.forumPosts.length === 0 ? {
    m: common_assets._imports_0
  } : {}, {
    n: $data.refreshing,
    o: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    p: $data.showModal
  }, $data.showModal ? common_vendor.e({
    q: common_vendor.o((...args) => $options.toggleConfigInfo && $options.toggleConfigInfo(...args)),
    r: common_vendor.o((...args) => $options.hideConfigModal && $options.hideConfigModal(...args)),
    s: $data.showConfigInfo
  }, $data.showConfigInfo ? {} : {}, {
    t: common_vendor.f($data.configList, (config, index, i0) => {
      return {
        a: common_vendor.t(config.remark || config.paramKey),
        b: common_vendor.t(config.displayValue),
        c: index
      };
    }),
    v: common_vendor.o((...args) => $options.hideConfigModal && $options.hideConfigModal(...args)),
    w: common_vendor.o(() => {
    }),
    x: common_vendor.o((...args) => $options.hideConfigModal && $options.hideConfigModal(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
