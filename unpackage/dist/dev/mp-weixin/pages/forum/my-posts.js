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
      refreshing: false
    };
  },
  onLoad() {
    this.loadPosts();
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
          size: this.pageSize
        };
        const res = await api_forum.getMyPosts(params);
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
          if (isRefresh)
            this.posts = [];
          this.noMore = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/forum/my-posts.vue:112", "❌ 加载我的帖子失败:", error);
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
    handleDelete(postId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除这条帖子吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await api_forum.deletePost(postId);
              if (delRes.code === 200) {
                common_vendor.index.showToast({ title: "已删除" });
                this.posts = this.posts.filter((p) => p.id !== postId);
                common_vendor.index.$emit("refreshForum");
              }
            } catch (error) {
              common_vendor.index.showToast({ title: "删除失败", icon: "none" });
            }
          }
        }
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
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.f($data.posts, (post, k0, i0) => {
      return {
        a: post.id,
        b: common_vendor.o($options.goToDetail, post.id),
        c: common_vendor.o($options.handleDelete, post.id),
        d: common_vendor.o($options.onLike, post.id),
        e: "b7e93a41-0-" + i0,
        f: common_vendor.p({
          post,
          ["is-my-post"]: true
        })
      };
    }),
    c: $data.loading
  }, $data.loading ? {} : {}, {
    d: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    e: $data.posts.length === 0
  }, $data.posts.length === 0 ? {} : $data.noMore ? {} : {}, {
    f: $data.noMore
  }), {
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args)),
    h: $data.refreshing,
    i: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b7e93a41"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forum/my-posts.js.map
