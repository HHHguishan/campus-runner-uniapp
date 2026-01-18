"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const utils_config = require("../utils/config.js");
const utils_token = require("../utils/token.js");
const getAiChatStream = (message, sessionId = "default", onMessage, onComplete, onError) => {
  const token = utils_token.getToken();
  const baseUrl = utils_config.API_BASE_URL;
  const requestTask = common_vendor.index.request({
    url: `${baseUrl}/ai/chat/stream?message=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(sessionId)}`,
    method: "GET",
    header: {
      "Authorization": token ? `Bearer ${token}` : ""
    },
    enableChunked: true,
    // 开启分块接收
    success: (res) => {
      onComplete && onComplete();
    },
    fail: (err) => {
      onError && onError(err);
    }
  });
  requestTask.onChunkReceived((res) => {
    const unit8Array = new Uint8Array(res.data);
    const text = new TextDecoder("utf-8").decode(unit8Array);
    onMessage && onMessage(text);
  });
  return requestTask;
};
const getAiChatHistory = (sessionId = "default") => {
  return utils_request.request({
    url: `/ai/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
    method: "GET"
  });
};
const getAiChatSessions = () => {
  return utils_request.request({
    url: "/ai/chat/sessions",
    method: "GET"
  });
};
const clearAiHistory = (sessionId = "default") => {
  return utils_request.request({
    url: `/ai/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
    method: "DELETE"
  });
};
exports.clearAiHistory = clearAiHistory;
exports.getAiChatHistory = getAiChatHistory;
exports.getAiChatSessions = getAiChatSessions;
exports.getAiChatStream = getAiChatStream;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/ai.js.map
