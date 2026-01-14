"use strict";
const common_vendor = require("../../common/vendor.js");
const api_forum = require("../../api/forum.js");
const _sfc_main = {
  data() {
    return {
      id: null,
      post: null,
      comments: [],
      commentValue: "",
      isMe: false
    };
  },
  onLoad(options) {
    this.id = options.id;
    this.loadData();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    async loadData() {
      common_vendor.index.showLoading({ title: "加载中" });
      try {
        const [pRes, cRes] = await Promise.all([
          api_forum.getPostDetail(this.id),
          api_forum.getCommentList({ postId: this.id, page: 1, size: 50 })
        ]);
        common_vendor.index.__f__("log", "at pages/forum/detail.vue:121", "🔍 帖子详情响应:", pRes);
        common_vendor.index.__f__("log", "at pages/forum/detail.vue:122", "🔍 评论列表响应:", cRes);
        if (pRes.code === 200) {
          this.post = pRes.data;
          this.isMe = this.post.isOwner;
          if (this.post.images && typeof this.post.images === "string") {
            try {
              this.post.images = JSON.parse(this.post.images);
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/forum/detail.vue:133", "解析详情图片失败:", e);
              this.post.images = [];
            }
          }
        }
        if (cRes.code === 200) {
          this.comments = cRes.data.records || [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/forum/detail.vue:143", "❌ 加载详情失败:", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    async onLike() {
      try {
        const res = await api_forum.likePost(this.id);
        if (res.code === 200) {
          this.post.liked = res.data.liked;
          this.post.likeCount = res.data.likeCount;
        }
      } catch (e) {
      }
    },
    async submitComment() {
      if (!this.commentValue.trim())
        return;
      try {
        const res = await api_forum.addComment({
          postId: this.id,
          content: this.commentValue,
          parentId: null
          // 顶层评论
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: "回复成功" });
          this.commentValue = "";
          this.loadData();
        }
      } catch (e) {
      }
    },
    async onDeletePost() {
      common_vendor.index.showModal({
        content: "确定删除该动态吗？",
        success: async (res) => {
          if (res.confirm) {
            const dRes = await api_forum.deletePost(this.id);
            if (dRes.code === 200) {
              common_vendor.index.$emit("refreshForum");
              common_vendor.index.navigateBack();
            }
          }
        }
      });
    },
    async onDeleteComment(cid) {
      const res = await api_forum.deleteComment(cid);
      if (res.code === 200)
        this.loadData();
    },
    previewImage(idx) {
      common_vendor.index.previewImage({
        urls: this.post.images,
        current: idx
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.post
  }, $data.post ? common_vendor.e({
    c: $data.post.avatar || "/static/images/default-avatar.png",
    d: common_vendor.t($data.post.nickname),
    e: $data.post.tag
  }, $data.post.tag ? {
    f: common_vendor.t($data.post.tag)
  } : {}, {
    g: common_vendor.t($data.post.createTime),
    h: $data.isMe
  }, $data.isMe ? {
    i: common_vendor.o((...args) => $options.onDeletePost && $options.onDeletePost(...args))
  } : {}, {
    j: $data.post.title
  }, $data.post.title ? {
    k: common_vendor.t($data.post.title)
  } : {}, {
    l: common_vendor.t($data.post.content),
    m: common_vendor.f($data.post.images, (img, idx, i0) => {
      return {
        a: idx,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage(idx), idx)
      };
    }),
    n: common_vendor.t($data.post.liked ? "❤️" : "🤍"),
    o: common_vendor.t($data.post.likeCount || 0),
    p: $data.post.liked ? 1 : "",
    q: common_vendor.o((...args) => $options.onLike && $options.onLike(...args)),
    r: common_vendor.t($data.post.viewCount || 0)
  }) : {}, {
    s: common_vendor.t($data.comments.length),
    t: common_vendor.f($data.comments, (comment, k0, i0) => {
      return common_vendor.e({
        a: comment.avatar || "/static/images/default-avatar.png",
        b: common_vendor.t(comment.nickname),
        c: common_vendor.t(comment.createTime),
        d: common_vendor.t(comment.content),
        e: comment.isMe
      }, comment.isMe ? {
        f: common_vendor.o(($event) => $options.onDeleteComment(comment.id), comment.id)
      } : {}, {
        g: comment.id
      });
    }),
    v: $data.comments.length === 0
  }, $data.comments.length === 0 ? {} : {}, {
    w: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args)),
    x: $data.commentValue,
    y: common_vendor.o(($event) => $data.commentValue = $event.detail.value),
    z: $data.commentValue.trim() ? 1 : "",
    A: common_vendor.o((...args) => $options.submitComment && $options.submitComment(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-15db4200"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forum/detail.js.map
