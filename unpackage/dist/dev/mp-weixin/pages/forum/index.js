"use strict";
const common_vendor = require("../../common/vendor.js");
const api_forum = require("../../api/forum.js");
const PostCard = () => "../../components/post-card/post-card.js";
const _sfc_main = {
  components: {
    "post-card": PostCard
  },
  data() {
    return {
      posts: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      refreshing: false,
      currentTag: null,
      tagOptions: ["失物", "吐槽", "闲置", "求助", "表白"]
    };
  },
  onLoad() {
    this.loadPosts();
    common_vendor.index.$on("refreshForum", this.onRefresh);
  },
  onUnload() {
    common_vendor.index.$off("refreshForum", this.onRefresh);
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    async loadPosts(isRefresh = false) {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const params = {
          page: isRefresh ? 1 : this.pageNum,
          size: this.pageSize,
          orderBy: "createTime,desc"
        };
        if (this.currentTag) {
          params.tag = this.currentTag;
        }
        const res = await api_forum.getPostList(params);
        if (res.code === 200) {
          let list = [];
          let total = 0;
          if (res.data) {
            if (Array.isArray(res.data)) {
              list = res.data;
              total = list.length;
            } else if (res.data.records && Array.isArray(res.data.records)) {
              list = res.data.records;
              total = res.data.total || 0;
            }
            list = list.map((item) => {
              if (item.images && typeof item.images === "string") {
                try {
                  item.images = JSON.parse(item.images);
                } catch (e) {
                  common_vendor.index.__f__("error", "at pages/forum/index.vue:185", "解析图片JSON失败:", e, item.images);
                  item.images = [];
                }
              }
              return item;
            });
          }
          if (isRefresh) {
            this.posts = list;
            this.pageNum = 2;
            this.noMore = list.length < this.pageSize;
          } else {
            this.posts = [...this.posts, ...list];
            this.pageNum++;
            this.noMore = list.length < this.pageSize || total > 0 && this.posts.length >= total;
          }
        } else {
          common_vendor.index.__f__("warn", "at pages/forum/index.vue:204", "⚠️ 响应异常或无数据:", res);
          if (isRefresh)
            this.posts = [];
          this.noMore = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/forum/index.vue:209", "❌ 加载动态失败:", error);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    onRefresh() {
      this.refreshing = true;
      this.loadPosts(true);
    },
    switchTag(tag) {
      if (this.currentTag === tag)
        return;
      this.currentTag = tag;
      this.posts = [];
      this.pageNum = 1;
      this.loadPosts(true);
    },
    loadMore() {
      if (!this.noMore) {
        this.loadPosts();
      }
    },
    goToDetail(postId) {
      common_vendor.index.navigateTo({
        url: `/pages/forum/detail?id=${postId}`
      });
    },
    goToCreate() {
      common_vendor.index.navigateTo({
        url: "/pages/forum/create"
      });
    },
    async onLike(postId) {
      try {
        const res = await api_forum.likePost(postId);
        if (res.code === 200) {
          const index = this.posts.findIndex((p) => p.id === postId);
          if (index !== -1) {
            const post = this.posts[index];
            post.liked = res.data.liked;
            post.likeCount = res.data.likeCount;
            this.posts[index] = post;
          }
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    },
    // 图片预览方法 (新增)
    previewImage(post, index) {
      common_vendor.index.previewImage({
        urls: post.images,
        current: index
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.currentTag === null ? 1 : "",
    c: common_vendor.o(($event) => $options.switchTag(null)),
    d: common_vendor.f($data.tagOptions, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag,
        c: $data.currentTag === tag ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTag(tag), tag)
      };
    }),
    e: common_vendor.f($data.posts, (post, k0, i0) => {
      return common_vendor.e({
        a: post.avatar || "/static/images/default-avatar.png",
        b: common_vendor.t(post.nickname || "匿名用户"),
        c: post.tag
      }, post.tag ? {
        d: common_vendor.t(post.tag)
      } : {}, {
        e: common_vendor.t(post.createTime || "刚刚"),
        f: post.title
      }, post.title ? {
        g: common_vendor.t(post.title)
      } : {}, {
        h: common_vendor.t(post.contentPreview || post.content),
        i: post.images && post.images.length > 0
      }, post.images && post.images.length > 0 ? {
        j: common_vendor.f(post.images, (img, index, i1) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => $options.previewImage(post, index), index)
          };
        }),
        k: common_vendor.n("images-" + Math.min(post.images.length, 3))
      } : {}, {
        l: common_vendor.t(post.liked ? "❤️" : "🤍"),
        m: common_vendor.t(post.likeCount || 0),
        n: post.liked ? 1 : "",
        o: common_vendor.o(($event) => $options.onLike(post.id), "inline-" + post.id),
        p: common_vendor.t(post.commentCount || 0),
        q: common_vendor.o(($event) => $options.goToDetail(post.id), "inline-" + post.id),
        r: post.viewCount
      }, post.viewCount ? {
        s: common_vendor.t(post.viewCount)
      } : {}, {
        t: "inline-" + post.id,
        v: common_vendor.o(($event) => $options.goToDetail(post.id), "inline-" + post.id)
      });
    }),
    f: $data.loading
  }, $data.loading ? {} : {}, {
    g: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    h: $data.posts.length === 0
  }, $data.posts.length === 0 ? {} : $data.noMore ? {} : {}, {
    i: $data.noMore
  }), {
    j: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    k: $data.refreshing,
    l: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    m: common_vendor.o((...args) => $options.goToCreate && $options.goToCreate(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0e21892e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forum/index.js.map
