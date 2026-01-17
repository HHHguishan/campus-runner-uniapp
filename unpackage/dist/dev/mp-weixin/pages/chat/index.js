"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const utils_token = require("../../utils/token.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  data() {
    return {
      statusBarHeight: 0,
      safeAreaInsets: { bottom: 0 },
      orderId: null,
      receiverId: null,
      roleName: "对方",
      mineId: null,
      nickname: "",
      myAvatar: "",
      otherAvatar: "",
      inputMsg: "",
      messages: [],
      lastMsgId: "",
      socketOpen: false,
      socketTask: null,
      reconnectTimer: null
    };
  },
  onLoad(options) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.safeAreaInsets = systemInfo.safeAreaInsets || { bottom: 0 };
    this.orderId = options.orderId;
    this.receiverId = options.receiverId;
    this.nickname = decodeURIComponent(options.nickname || "") || (options.role == "rider" ? "骑手" : "用户");
    this.roleName = this.nickname;
    const userInfo = utils_token.getUserInfo() || {};
    this.mineId = userInfo.id;
    this.myAvatar = userInfo.avatar || "/static/default-avatar.png";
    this.otherAvatar = decodeURIComponent(options.avatar || "") || "/static/default-avatar.png";
    common_vendor.index.__f__("log", "at pages/chat/index.vue:98", "Chat Init:", {
      orderId: this.orderId,
      receiverId: this.receiverId,
      mineId: this.mineId,
      role: options.role
    });
    if (!this.receiverId) {
      common_vendor.index.showModal({
        title: "提示",
        content: "未获取到聊天对象ID，无法发送消息",
        showCancel: false
      });
    }
    this.loadHistory();
    this.connectSocket();
  },
  onUnload() {
    this.closeSocket();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
    },
    showTime(index) {
      if (index === 0)
        return true;
      const curr = new Date(this.messages[index].createTime).getTime();
      const prev = new Date(this.messages[index - 1].createTime).getTime();
      return curr - prev > 5 * 60 * 1e3;
    },
    async loadHistory() {
      try {
        const res = await utils_request.get(`/chat/history/${this.orderId}`);
        if (res.code === 200) {
          this.messages = res.data;
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/chat/index.vue:144", "加载历史失败", err);
      }
    },
    connectSocket() {
      let token = utils_token.getToken();
      if (token && token.startsWith("Bearer ")) {
        token = token.substring(7);
      }
      token = token.trim();
      const baseWsUrl = utils_config.API_BASE_URL.startsWith("https") ? utils_config.API_BASE_URL.replace("https", "wss") : utils_config.API_BASE_URL.replace("http", "ws");
      const wsUrl = `${baseWsUrl}/ws/chat/${encodeURIComponent(token)}/${this.orderId}`;
      common_vendor.index.__f__("log", "at pages/chat/index.vue:159", "Target WS URL:", wsUrl);
      this.socketTask = common_vendor.index.connectSocket({
        url: wsUrl,
        success: () => {
          common_vendor.index.__f__("log", "at pages/chat/index.vue:164", "WebSocket 握手开始...");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/chat/index.vue:167", "uni.connectSocket 调用失败", err);
          this.reconnect();
        }
      });
      this.socketTask.onOpen(() => {
        this.socketOpen = true;
        common_vendor.index.__f__("log", "at pages/chat/index.vue:174", "WebSocket 已连接");
        common_vendor.index.showToast({ title: "已连接", icon: "none", duration: 1e3 });
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      });
      this.socketTask.onMessage((res) => {
        common_vendor.index.__f__("log", "at pages/chat/index.vue:183", "收到 WebSocket 原始消息:", res);
        try {
          const msg = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          common_vendor.index.__f__("log", "at pages/chat/index.vue:187", "解析后的消息对象:", msg);
          if (msg.orderId == this.orderId) {
            if (msg.id) {
              const exists = this.messages.some((m) => m.id === msg.id);
              if (exists)
                return;
            }
            this.messages.push(msg);
            this.scrollToBottom();
            common_vendor.index.vibrateShort();
          } else {
            common_vendor.index.__f__("log", "at pages/chat/index.vue:203", "收到其他订单消息，已忽略:", msg.orderId);
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/chat/index.vue:206", "解析消息失败", e);
        }
      });
      this.socketTask.onClose(() => {
        this.socketOpen = false;
        common_vendor.index.__f__("log", "at pages/chat/index.vue:212", "WebSocket 已关闭");
        this.reconnect();
      });
      this.socketTask.onError((err) => {
        this.socketOpen = false;
        common_vendor.index.__f__("error", "at pages/chat/index.vue:218", "WebSocket 错误", err);
        common_vendor.index.showToast({ title: "连接错误: " + (err.errMsg || "未知"), icon: "none" });
        this.reconnect();
      });
    },
    reconnect() {
      if (this.reconnectTimer)
        return;
      this.reconnectTimer = setInterval(() => {
        common_vendor.index.__f__("log", "at pages/chat/index.vue:226", "正在尝试重连...");
        this.connectSocket();
      }, 1e4);
    },
    closeSocket() {
      if (this.socketTask) {
        this.socketTask.close();
      }
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
      }
    },
    sendMsg() {
      if (!this.inputMsg.trim() || !this.socketOpen) {
        if (!this.socketOpen) {
          common_vendor.index.showToast({ title: "连接未就绪", icon: "none" });
        }
        return;
      }
      if (!this.receiverId) {
        common_vendor.index.showToast({ title: "缺少接收者", icon: "none" });
        return;
      }
      const msgData = {
        orderId: this.orderId,
        receiverId: this.receiverId,
        content: this.inputMsg,
        msgType: 1
      };
      common_vendor.index.__f__("log", "at pages/chat/index.vue:258", "Sending Msg:", msgData);
      this.socketTask.send({
        data: JSON.stringify(msgData),
        success: () => {
          this.inputMsg = "";
        },
        fail: (err) => {
          common_vendor.index.showToast({ title: "发送失败", icon: "none" });
          common_vendor.index.__f__("error", "at pages/chat/index.vue:267", "发送错误", err);
        }
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.messages.length > 0) {
            const lastIndex = this.messages.length - 1;
            const lastMsg = this.messages[lastIndex];
            this.lastMsgId = "chat-item-" + (lastMsg.id || lastIndex);
            common_vendor.index.__f__("log", "at pages/chat/index.vue:278", "Scrolling to bottom, anchor:", this.lastMsgId);
          }
        }, 200);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: common_vendor.t($data.roleName),
    c: common_vendor.t($data.socketOpen ? "串联在线" : "等待重连..."),
    d: common_vendor.n($data.socketOpen ? "status-online" : "status-offline"),
    e: $data.statusBarHeight + "px",
    f: $data.statusBarHeight + 50 + "px",
    g: common_vendor.f($data.messages, (msg, index, i0) => {
      return common_vendor.e({
        a: $options.showTime(index)
      }, $options.showTime(index) ? {
        b: common_vendor.t($options.formatTime(msg.createTime))
      } : {}, {
        c: msg.senderId == $data.mineId ? $data.myAvatar : $data.otherAvatar,
        d: msg.senderId != $data.mineId
      }, msg.senderId != $data.mineId ? {
        e: common_vendor.t($data.roleName)
      } : {}, {
        f: common_vendor.t(msg.content),
        g: msg.id || index,
        h: "chat-item-" + (msg.id || index),
        i: msg.senderId == $data.mineId ? 1 : ""
      });
    }),
    h: $data.lastMsgId,
    i: common_vendor.o((...args) => $options.loadHistory && $options.loadHistory(...args)),
    j: common_vendor.o((...args) => $options.sendMsg && $options.sendMsg(...args)),
    k: $data.inputMsg,
    l: common_vendor.o(($event) => $data.inputMsg = $event.detail.value),
    m: common_vendor.o((...args) => $options.sendMsg && $options.sendMsg(...args)),
    n: !$data.inputMsg.trim() || !$data.socketOpen,
    o: $data.safeAreaInsets.bottom + "px"
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/chat/index.js.map
