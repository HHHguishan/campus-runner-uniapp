"use strict";
const common_vendor = require("../../common/vendor.js");
const api_ai = require("../../api/ai.js");
const utils_token = require("../../utils/token.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      inputMsg: "",
      messages: [
        {
          role: "ai",
          content: "您好！我是您的智能校光助手。🌻\n我可以帮您查询订单、核对余额，或者解答任何校园服务问题。有什么我可以帮您的吗？"
        }
      ],
      loading: false,
      scrollIntoView: "",
      keyboardHeight: 0,
      statusBarHeight: 0,
      sessionId: "default",
      // 当前会话 ID
      showHistory: false,
      // 是否显示历史列表
      sessionList: []
      // 历史会话列表
    };
  },
  onLoad() {
    this.userInfo = utils_token.getUserInfo() || {};
    this.sessionId = common_vendor.index.getStorageSync("ai_chat_session_id") || "default";
    this.loadChatHistory();
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    common_vendor.index.onKeyboardHeightChange((res) => {
      this.keyboardHeight = res.height;
      if (res.height > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  },
  methods: {
    goBack() {
      common_vendor.index.__f__("log", "at pages/support/chat.vue:169", "🔙 执行返回逻辑");
      common_vendor.index.navigateBack({
        delta: 1,
        fail: () => {
          common_vendor.index.switchTab({ url: "/pages/mine/mine" });
        }
      });
    },
    toggleHistory() {
      this.showHistory = !this.showHistory;
      if (this.showHistory) {
        this.loadSessionList();
      }
    },
    async loadSessionList() {
      try {
        const res = await api_ai.getAiChatSessions();
        if (res.code === 200) {
          this.sessionList = res.data.sort((a, b) => b > a ? 1 : -1);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/support/chat.vue:191", "获取会话列表失败:", err);
      }
    },
    selectSession(sessId) {
      if (this.sessionId === sessId) {
        this.showHistory = false;
        return;
      }
      this.sessionId = sessId;
      common_vendor.index.setStorageSync("ai_chat_session_id", sessId);
      this.messages = [];
      this.loadChatHistory();
      this.showHistory = false;
    },
    formatSessionTime(sessId) {
      if (sessId.startsWith("session_")) {
        const timestamp = parseInt(sessId.split("_")[1]);
        return new Date(timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      }
      return "--";
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollIntoView = "bottom";
      });
    },
    async loadChatHistory() {
      try {
        const res = await api_ai.getAiChatHistory(this.sessionId);
        if (res.data && res.data.length > 0) {
          this.messages = res.data;
        } else {
          this.messages = [
            {
              role: "ai",
              content: "您好！我是您的智能校光助手。🌻\n我可以帮您查询订单、核对余额，或者解答任何校园服务问题。有什么我可以帮您的吗？"
            }
          ];
        }
        this.scrollToBottom();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/support/chat.vue:234", "加载历史记录失败:", err);
      }
    },
    createNewChat() {
      common_vendor.index.showModal({
        title: "新对话",
        content: "开启一个全新的对话窗口吗？之前对话仍会保存在历史中。",
        success: (res) => {
          if (res.confirm) {
            const newSessionId = "session_" + Date.now();
            this.sessionId = newSessionId;
            common_vendor.index.setStorageSync("ai_chat_session_id", newSessionId);
            this.messages = [];
            this.loadChatHistory();
            common_vendor.index.showToast({ title: "新会话已开启", icon: "none" });
          }
        }
      });
    },
    confirmClear() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清空当前的聊天记录吗？",
        success: (res) => {
          if (res.confirm) {
            api_ai.clearAiHistory(this.sessionId).then(() => {
              this.messages = [{ role: "ai", content: "记忆已重置。请问还有什么我可以帮您的？" }];
            });
          }
        }
      });
    },
    async sendMessage() {
      if (!this.inputMsg.trim() || this.loading)
        return;
      const userMsg = this.inputMsg.trim();
      this.inputMsg = "";
      this.messages.push({ role: "user", content: userMsg });
      this.scrollToBottom();
      const aiMsgIndex = this.messages.length;
      this.messages.push({ role: "ai", content: "" });
      this.loading = true;
      let fullContent = "";
      api_ai.getAiChatStream(
        userMsg,
        this.sessionId,
        (token) => {
          let cleanToken = token.replace(/^data:/gm, "").trim();
          if (cleanToken.startsWith("{") && cleanToken.includes('"code":500')) {
            this.messages[aiMsgIndex].content = "抱歉，我现在有些忙，正在努力为您处理中... 🐢";
            this.loading = false;
            return;
          }
          if (cleanToken) {
            fullContent += cleanToken;
            this.messages[aiMsgIndex].content = fullContent;
            this.scrollToBottom();
          }
        },
        () => {
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.messages[aiMsgIndex].content = "抱歉，我的网络连接稍微有些拥挤，请稍后再试。";
        }
      );
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + "px",
    b: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    c: common_vendor.o((...args) => $options.toggleHistory && $options.toggleHistory(...args)),
    d: common_vendor.o((...args) => $options.createNewChat && $options.createNewChat(...args)),
    e: $data.showHistory
  }, $data.showHistory ? common_vendor.e({
    f: common_vendor.o(($event) => $data.showHistory = false),
    g: common_vendor.f($data.sessionList, (sess, index, i0) => {
      return {
        a: common_vendor.t(sess === "default" ? "默认会话" : "对话 " + sess.slice(-6)),
        b: common_vendor.t(sess === "default" ? "系统初始化" : "创建于 " + $options.formatSessionTime(sess)),
        c: index,
        d: sess === $data.sessionId ? 1 : "",
        e: common_vendor.o(($event) => $options.selectSession(sess), index)
      };
    }),
    h: $data.sessionList.length === 0
  }, $data.sessionList.length === 0 ? {} : {}, {
    i: common_vendor.o(() => {
    }),
    j: common_vendor.o(($event) => $data.showHistory = false)
  }) : {}, {
    k: common_vendor.f($data.messages, (item, index, i0) => {
      return common_vendor.e({
        a: item.role === "ai" ? "/static/ai-avatar.png" : $data.userInfo.avatar,
        b: item.role === "ai"
      }, item.role === "ai" ? {} : {}, {
        c: common_vendor.t(item.role === "ai" ? "智能客服 · 正在运行" : "我的咨询"),
        d: item.role === "ai" && !item.content
      }, item.role === "ai" && !item.content ? {} : {
        e: common_vendor.t(item.content)
      }, {
        f: common_vendor.n(item.role),
        g: index,
        h: "msg-" + index,
        i: common_vendor.n(item.role)
      });
    }),
    l: $data.scrollIntoView,
    m: common_vendor.o((...args) => _ctx.loadHistory && _ctx.loadHistory(...args)),
    n: $data.loading ? 1 : "",
    o: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    p: $data.inputMsg,
    q: common_vendor.o(($event) => $data.inputMsg = $event.detail.value),
    r: common_vendor.o((...args) => $options.confirmClear && $options.confirmClear(...args)),
    s: !$data.loading
  }, !$data.loading ? {} : {}, {
    t: $data.inputMsg.trim() ? 1 : "",
    v: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    w: $data.loading,
    x: $data.keyboardHeight + "px"
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-08438d9f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/support/chat.js.map
