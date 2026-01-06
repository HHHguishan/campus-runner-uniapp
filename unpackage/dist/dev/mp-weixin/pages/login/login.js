"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
const _sfc_main = {
  data() {
    return {
      phone: "",
      // 手机号
      code: "",
      // 验证码
      countdown: 0,
      // 倒计时
      isAgree: false,
      // 是否同意协议
      isLoading: false
      // 登录加载状态
    };
  },
  computed: {
    // 判断是否可以获取验证码：手机号必须是11位且倒计时结束
    canGetCode() {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(this.phone) && this.countdown === 0;
    },
    // 判断是否可以登录：手机号有效 + 验证码6位 + 已勾选协议
    canLogin() {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(this.phone) && this.code.length === 6 && this.isAgree && !this.isLoading;
    }
  },
  methods: {
    // 处理协议勾选
    handleAgreeChange(e) {
      this.isAgree = e.detail.value.length > 0;
    },
    // 手机号输入处理（限制只能输入数字）
    onPhoneInput(e) {
      const value = e.detail.value.replace(/\D/g, "");
      this.phone = value;
    },
    // 发送验证码逻辑
    async sendCode() {
      if (!this.canGetCode)
        return;
      try {
        common_vendor.index.showLoading({ title: "发送中...", mask: true });
        await api_auth.sendSmsCode(this.phone);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "验证码已发送",
          icon: "success",
          duration: 2e3
        });
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
          }
        }, 1e3);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/login/login.vue:152", "发送验证码失败:", error);
        if (error.message && error.message.includes("发送太频繁")) {
          const match = error.message.match(/请(\d+)秒后再试/);
          if (match) {
            const remainingTime = parseInt(match[1]);
            this.countdown = remainingTime;
            const timer = setInterval(() => {
              this.countdown--;
              if (this.countdown <= 0) {
                clearInterval(timer);
              }
            }, 1e3);
          }
        }
      }
    },
    // 登录逻辑
    async handleLogin() {
      if (!this.canLogin) {
        if (!this.isAgree) {
          common_vendor.index.showToast({
            title: "请先阅读并同意协议",
            icon: "none"
          });
        }
        return;
      }
      try {
        this.isLoading = true;
        common_vendor.index.showLoading({ title: "登录中...", mask: true });
        const loginResult = await api_auth.loginByPhone({
          phone: this.phone,
          code: this.code,
          deviceInfo: common_vendor.index.getSystemInfoSync().model,
          // 设备信息
          location: ""
          // 可选：地理位置
        });
        common_vendor.index.hideLoading();
        api_auth.handleLoginSuccess(loginResult.data);
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success",
          duration: 1500
        });
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/index/index"
          });
        }, 1500);
      } catch (error) {
        this.isLoading = false;
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/login/login.vue:220", "登录失败:", error);
      }
    },
    // 查看协议
    showProtocol(type) {
      const title = type === "user" ? "用户协议" : "隐私政策";
      common_vendor.index.showToast({
        title: `暂未开放${title}`,
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o([($event) => $data.phone = $event.detail.value, (...args) => $options.onPhoneInput && $options.onPhoneInput(...args)]),
    b: $data.phone,
    c: $data.code,
    d: common_vendor.o(($event) => $data.code = $event.detail.value),
    e: common_vendor.t($data.countdown > 0 ? `${$data.countdown}s后重发` : "获取验证码"),
    f: $options.canGetCode ? 1 : "",
    g: $data.countdown > 0 ? 1 : "",
    h: !$options.canGetCode || $data.countdown > 0,
    i: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args)),
    j: common_vendor.t($data.isLoading ? "登录中..." : "立即登录"),
    k: $options.canLogin ? 1 : "",
    l: !$options.canLogin || $data.isLoading,
    m: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    n: $data.isAgree,
    o: common_vendor.o((...args) => $options.handleAgreeChange && $options.handleAgreeChange(...args)),
    p: common_vendor.o(($event) => $options.showProtocol("user")),
    q: common_vendor.o(($event) => $options.showProtocol("privacy"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
