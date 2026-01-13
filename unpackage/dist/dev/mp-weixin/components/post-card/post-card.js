"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    post: {
      type: Object,
      required: true
    },
    isMyPost: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onCardClick() {
      this.$emit("click", this.post.id);
    },
    onLike() {
      this.$emit("like", this.post.id);
    },
    onComment() {
      this.$emit("comment", this.post.id);
    },
    onDelete() {
      this.$emit("delete", this.post.id);
    },
    previewImage(current) {
      common_vendor.index.previewImage({
        urls: this.post.images,
        current
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.post.avatar || "/static/images/default-avatar.png",
    b: common_vendor.t($props.post.nickname || "匿名用户"),
    c: $props.post.tag
  }, $props.post.tag ? {
    d: common_vendor.t($props.post.tag)
  } : {}, {
    e: common_vendor.t($props.post.createTime || "刚刚"),
    f: $props.isMyPost
  }, $props.isMyPost ? {
    g: common_vendor.o((...args) => $options.onDelete && $options.onDelete(...args))
  } : {}, {
    h: $props.post.title
  }, $props.post.title ? {
    i: common_vendor.t($props.post.title)
  } : {}, {
    j: common_vendor.t($props.post.contentPreview || $props.post.content),
    k: $props.post.images && $props.post.images.length > 0
  }, $props.post.images && $props.post.images.length > 0 ? {
    l: common_vendor.f($props.post.images, (img, index, i0) => {
      return {
        a: index,
        b: img,
        c: common_vendor.o(($event) => $options.previewImage(index), index)
      };
    }),
    m: common_vendor.n("images-" + Math.min($props.post.images.length, 3))
  } : {}, {
    n: common_vendor.t($props.post.liked ? "❤️" : "🤍"),
    o: common_vendor.t($props.post.likeCount || 0),
    p: $props.post.liked ? 1 : "",
    q: common_vendor.o((...args) => $options.onLike && $options.onLike(...args)),
    r: common_vendor.t($props.post.commentCount || 0),
    s: common_vendor.o((...args) => $options.onComment && $options.onComment(...args)),
    t: $props.post.viewCount
  }, $props.post.viewCount ? {
    v: common_vendor.t($props.post.viewCount)
  } : {}, {
    w: common_vendor.o((...args) => $options.onCardClick && $options.onCardClick(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-83111fb1"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/post-card/post-card.js.map
