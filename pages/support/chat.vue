<template>
  <view class="container">
    <!-- 强化的独立导航栏 -->
    <view class="custom-header">
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-content">
        <view class="back-action" @tap="goBack">
          <text class="cuIcon-back back-icon"></text>
          <text class="back-text">返回</text>
        </view>
        <view class="title-container">
          <text class="header-title">AI 智能伙伴</text>
        </view>
        <view class="right-actions">
           <view class="history-btn" @tap="toggleHistory" title="历史记录">
              <text class="cuIcon-list"></text>
           </view>
           <view class="new-chat-btn" @tap="createNewChat" title="开始新对话">
              <text class="cuIcon-add"></text>
           </view>
        </view>
      </view>
    </view>

    <!-- 历史会话遮罩层 (Drawer) -->
    <view v-if="showHistory" class="history-drawer-mask" @tap="showHistory = false">
      <view class="history-drawer" @tap.stop>
        <view class="drawer-header">
          <text class="drawer-title">全部对话记录</text>
          <text class="cuIcon-close close-icon" @tap="showHistory = false"></text>
        </view>
        <scroll-view scroll-y class="drawer-list">
          <view v-for="(sess, index) in sessionList" :key="index" 
            class="session-item" :class="{ active: sess === sessionId }"
            @tap="selectSession(sess)">
            <view class="sess-icon-box">
              <text class="cuIcon-message sess-icon"></text>
            </view>
            <view class="sess-info">
              <text class="sess-id">{{ sess === 'default' ? '默认会话' : '对话 ' + sess.slice(-6) }}</text>
              <text class="sess-time">{{ sess === 'default' ? '系统初始化' : '创建于 ' + formatSessionTime(sess) }}</text>
            </view>
          </view>
          <view v-if="sessionList.length === 0" class="empty-sessions">
             <view class="cuIcon-info"></view>
             <text>暂无历史对话</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      class="chat-list" 
      scroll-y 
      :scroll-into-view="scrollIntoView" 
      scroll-with-animation
      @scrolltoupper="loadHistory"
    >
      <view class="message-padding-top"></view>
      
      <!-- 欢迎语 -->
      <view class="welcome-box animate-slide-up">
        <view class="ai-badge">智能服务已就绪</view>
        <text class="welcome-text">欢迎使用校光智能客服服务</text>
      </view>

      <view v-for="(item, index) in messages" :key="index" :id="'msg-' + index" 
        class="message-row" :class="[item.role, 'animate-fade-in']">
        
        <view class="avatar-box">
          <image :src="item.role === 'ai' ? '/static/ai-avatar.png' : userInfo.avatar" mode="aspectFill" class="avatar-img"></image>
          <view v-if="item.role === 'ai'" class="online-tag"></view>
        </view>

        <view class="content-wrapper">
          <view class="nickname">{{ item.role === 'ai' ? '智能客服 · 正在运行' : '我的咨询' }}</view>
          <view class="bubble" :class="item.role">
            <view class="message-text">
              <text v-if="item.role === 'ai' && !item.content" class="typing-placeholder">正在深度思考中...</text>
              <text v-else selectable>{{ item.content }}</text>
            </view>
            <!-- 气泡投影装饰 -->
            <view class="bubble-shadow"></view>
          </view>
        </view>
      </view>
      
      <view class="message-padding-bottom" id="bottom"></view>
    </scroll-view>

    <!-- 悬浮式输入区域 -->
    <view class="floating-input-area" :style="{ bottom: keyboardHeight + 'px' }">
      <view class="input-card shadow-premium">
        <!-- 状态指示灯 -->
        <view class="status-dot" :class="{ 'is-loading': loading }"></view>
        
        <input 
          class="premium-input" 
          type="text" 
          v-model="inputMsg" 
          placeholder="问问我：我的订单到哪了？" 
          placeholder-class="input-placeholder"
          @confirm="sendMessage"
          :confirm-hold="true"
        />
        
        <view class="action-buttons">
          <view class="clear-btn" @tap="confirmClear" title="清空对话">
            <text class="cuIcon-delete"></text>
          </view>
          <button class="send-btn-v2" :class="{ 'active': inputMsg.trim() }" @tap="sendMessage" :disabled="loading">
            <view class="send-icon-box" v-if="!loading">
               <text class="cuIcon-forwardfill"></text>
            </view>
            <view class="loading-icon" v-else></view>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAiChatStream, clearAiHistory, getAiChatHistory, getAiChatSessions } from '@/api/ai'
import { getUserInfo } from '@/utils/token'

export default {
  data() {
    return {
      userInfo: {},
      inputMsg: '',
      messages: [
        { 
          role: 'ai', 
          content: '您好！我是您的智能校光助手。🌻\n我可以帮您查询订单、核对余额，或者解答任何校园服务问题。有什么我可以帮您的吗？' 
        }
      ],
      loading: false,
      scrollIntoView: '',
      keyboardHeight: 0,
      statusBarHeight: 0,
      sessionId: 'default', // 当前会话 ID
      showHistory: false,   // 是否显示历史列表
      sessionList: []       // 历史会话列表
    }
  },
  onLoad() {
    this.userInfo = getUserInfo() || {}
    // 持久化获取 sessionId，解决“进入即 default”的问题
    this.sessionId = uni.getStorageSync('ai_chat_session_id') || 'default'
    
    // 获取历史记录
    this.loadChatHistory()
    
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    uni.onKeyboardHeightChange(res => {
      this.keyboardHeight = res.height
      if (res.height > 0) {
        setTimeout(() => this.scrollToBottom(), 100)
      }
    })
  },
  methods: {
    goBack() {
      console.log('🔙 执行返回逻辑');
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({ url: '/pages/mine/mine' })
        }
      });
    },
    toggleHistory() {
      this.showHistory = !this.showHistory
      if (this.showHistory) {
        this.loadSessionList()
      }
    },
    async loadSessionList() {
      try {
        const res = await getAiChatSessions()
        if (res.code === 200) {
          // 对结果进行过滤和简单排序
          this.sessionList = res.data.sort((a,b) => b > a ? 1 : -1)
        }
      } catch (err) {
        console.error('获取会话列表失败:', err)
      }
    },
    selectSession(sessId) {
      if (this.sessionId === sessId) {
        this.showHistory = false
        return
      }
      this.sessionId = sessId
      uni.setStorageSync('ai_chat_session_id', sessId)
      this.messages = []
      this.loadChatHistory()
      this.showHistory = false
    },
    formatSessionTime(sessId) {
       if (sessId.startsWith('session_')) {
          const timestamp = parseInt(sessId.split('_')[1])
          return new Date(timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
       }
       return '--'
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollIntoView = 'bottom'
      })
    },
    async loadChatHistory() {
      try {
        const res = await getAiChatHistory(this.sessionId)
        if (res.data && res.data.length > 0) {
          // 如果有历史记录，则替换初始消息
          this.messages = res.data
        } else {
          // 如果无历史记录，显示欢迎语
          this.messages = [
            { 
              role: 'ai', 
              content: '您好！我是您的智能校光助手。🌻\n我可以帮您查询订单、核对余额，或者解答任何校园服务问题。有什么我可以帮您的吗？' 
            }
          ]
        }
        this.scrollToBottom()
      } catch (err) {
        console.error('加载历史记录失败:', err)
      }
    },
    createNewChat() {
      uni.showModal({
        title: '新对话',
        content: '开启一个全新的对话窗口吗？之前对话仍会保存在历史中。',
        success: (res) => {
          if (res.confirm) {
            const newSessionId = 'session_' + Date.now()
            this.sessionId = newSessionId
            uni.setStorageSync('ai_chat_session_id', newSessionId)
            
            this.messages = []
            this.loadChatHistory()
            uni.showToast({ title: '新会话已开启', icon: 'none' })
          }
        }
      })
    },
    confirmClear() {
      uni.showModal({
        title: '提示',
        content: '确定要清空当前的聊天记录吗？',
        success: (res) => {
          if (res.confirm) {
            clearAiHistory(this.sessionId).then(() => {
              this.messages = [{ role: 'ai', content: '记忆已重置。请问还有什么我可以帮您的？' }]
            })
          }
        }
      })
    },
    async sendMessage() {
      if (!this.inputMsg.trim() || this.loading) return
      
      const userMsg = this.inputMsg.trim()
      this.inputMsg = ''
      
      this.messages.push({ role: 'user', content: userMsg })
      this.scrollToBottom()
      
      const aiMsgIndex = this.messages.length
      this.messages.push({ role: 'ai', content: '' })
      this.loading = true
      
      let fullContent = ''
      
      getAiChatStream(
        userMsg,
        this.sessionId,
        (token) => {
          // 清理 SSE 协议的 data: 前缀（针对多行情况）
          let cleanToken = token.replace(/^data:/gm, '').trim();
          
          // 增加 JSON 过滤器：防止显示后端的 500 原始 JSON 代码
          if (cleanToken.startsWith('{') && cleanToken.includes('"code":500')) {
             this.messages[aiMsgIndex].content = '抱歉，我现在有些忙，正在努力为您处理中... 🐢'
             this.loading = false
             return
          }
          
          if (cleanToken) {
            fullContent += cleanToken
            this.messages[aiMsgIndex].content = fullContent
            this.scrollToBottom()
          }
        },
        () => {
          this.loading = false
        },
        (err) => {
          this.loading = false
          this.messages[aiMsgIndex].content = '抱歉，我的网络连接稍微有些拥挤，请稍后再试。'
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  position: relative;
}

/* 独立导航栏样式 */
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .status-bar { width: 100%; }
  
  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    justify-content: space-between;
    
    .back-action {
      display: flex;
      align-items: center;
      padding: 10rpx 28rpx;
      color: #fff;
      background: #0081ff; /* 改为实色背景，极其醒目 */
      border-radius: 40rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 129, 255, 0.3);
      transition: all 0.2s;
      
      .back-icon {
        font-size: 38rpx;
        font-weight: bold;
        margin-right: 6rpx;
      }
      
      .back-text {
        font-size: 28rpx;
        font-weight: bold;
      }
      
      &:active {
        opacity: 0.6;
      }
    }
    
    .title-container {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      
      .header-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #1a1a1a;
        letter-spacing: 2rpx;
      }
    }
    
    .empty-side { width: 120rpx; }
    
    .right-actions {
       width: 120rpx;
       display: flex;
       justify-content: flex-end;
       
       .new-chat-btn {
          width: 70rpx;
          height: 70rpx;
          background: #0081ff;
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40rpx;
          box-shadow: 0 4rpx 12rpx rgba(0, 129, 255, 0.3);
          
          &:active {
            opacity: 0.6;
            transform: scale(0.9);
          }
       }
    }
  }
}

.chat-list {
  flex: 1;
  padding: 0 30rpx;
  /* 动态预留状态栏 + 导航栏高度 */
  margin-top: calc(var(--status-bar-height) + 120rpx);
}

.message-padding-top { height: 30rpx; }
.message-padding-bottom { height: 180rpx; }

/* 欢迎组件 */
.welcome-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40rpx 0;
  
  .ai-badge {
    padding: 4rpx 16rpx;
    background: rgba(0, 129, 255, 0.1);
    color: #0081ff;
    font-size: 20rpx;
    border-radius: 40rpx;
    margin-bottom: 20rpx;
  }
  
  .welcome-text {
    font-size: 24rpx;
    color: #99aabb;
  }
}

/* 消息行基础结构 */
.message-row {
  display: flex;
  margin-bottom: 50rpx;
  
  .avatar-box {
    width: 84rpx;
    height: 84rpx;
    position: relative;
    flex-shrink: 0;
    
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
      background: #fff;
    }
    
    .online-tag {
      position: absolute;
      bottom: -4rpx;
      right: -4rpx;
      width: 16rpx;
      height: 16rpx;
      background: #4cd964;
      border: 3rpx solid #fff;
      border-radius: 50%;
    }
  }
  
  .content-wrapper {
    max-width: 75%;
    margin-left: 24rpx;
    
    .nickname {
      font-size: 20rpx;
      color: #aeb6bf;
      margin-bottom: 10rpx;
      padding-left: 4rpx;
    }
    
    .bubble {
      position: relative;
      padding: 24rpx 28rpx;
      font-size: 28rpx;
      line-height: 1.6;
      word-break: break-all;
      
      &.ai {
        background: #ffffff;
        color: #2c3e50;
        border-radius: 4rpx 32rpx 32rpx 32rpx;
        box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.04);
        border: 1rpx solid #f0f3f6;
        
        .message-text { color: #2c3e50; }
      }
      
      &.user {
        background: #0081ff;
        color: #fff;
        border-radius: 32rpx 4rpx 32rpx 32rpx;
        box-shadow: 0 10rpx 20rpx rgba(0,129,255,0.15);
        
        .message-text { color: #fff; }
      }
      
      .typing-placeholder {
        color: #999;
        font-style: italic;
      }
    }
  }
  
  &.user {
    flex-direction: row-reverse;
    .content-wrapper {
      margin-left: 0;
      margin-right: 24rpx;
      text-align: right;
    }
  }
}

/* 拟态输入区 */
.floating-input-area {
  position: fixed;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: transparent;
  pointer-events: none; /* 让外部可以穿透，但内部 card 要改回 auto */
  
  .input-card {
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    padding: 10rpx 10rpx 10rpx 36rpx;
    border: 1rpx solid rgba(0,0,0,0.03);
    
    .status-dot {
      width: 12rpx;
      height: 12rpx;
      background: #4cd964;
      border-radius: 50%;
      margin-right: 20rpx;
      box-shadow: 0 0 10rpx rgba(76,217,100,0.5);
      
      &.is-loading {
        background: #0081ff;
        animation: pulse 1.5s infinite;
      }
    }
    
    .premium-input {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .input-placeholder { color: #bdc3c7; }
    
    .action-buttons {
      display: flex;
      align-items: center;
      
      .clear-btn {
        padding: 20rpx;
        color: #99aabb;
        font-size: 32rpx;
      }
      
      .send-btn-v2 {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: #f4f6f7;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.05);
        color: #bdc3c7;
        
        &::after { border: none; }
        
        &.active {
          background: #0081ff;
          color: #fff;
          box-shadow: 0 6rpx 16rpx rgba(0,129,255,0.3);
          transform: scale(1.05);
        }
        
        .loading-icon {
          width: 30rpx;
          height: 30rpx;
          border: 3rpx solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      }
    }
  }
}

/* 阴影辅助 */
.shadow-premium {
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.1) !important;
}

/* 动画定义 */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 20rpx rgba(0,129,255,0.6); }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20rpx) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40rpx); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 历史记录按钮样式 */
.history-btn {
  width: 70rpx;
  height: 70rpx;
  background: rgba(0, 129, 255, 0.1);
  color: #0081ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  transition: all 0.2s;
  
  &:active {
    opacity: 0.6;
    transform: scale(0.9);
  }
}

/* 历史记录侧边抽屉 */
.history-drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.3s;
}

.history-drawer {
  width: 520rpx;
  height: 100%;
  background: #ffffff;
  box-shadow: -10rpx 0 30rpx rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
  
  .drawer-header {
    padding: 100rpx 40rpx 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #f5f5f5;
    
    .drawer-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-icon {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
    }
  }
  
  .drawer-list {
    flex: 1;
    padding: 20rpx;
    
    .session-item {
      padding: 30rpx 20rpx;
      display: flex;
      align-items: center;
      border-radius: 16rpx;
      margin-bottom: 16rpx;
      transition: all 0.2s;
      border: 2rpx solid transparent;
      
      &.active {
        background: rgba(0, 129, 255, 0.05);
        border: 2rpx solid rgba(0, 129, 255, 0.15);
        
        .sess-icon-box {
          background: #0081ff;
          color: #fff;
        }
        
        .sess-id {
          color: #0081ff;
          font-weight: bold;
        }
      }
      
      &:active {
        opacity: 0.7;
        background: #f9f9f9;
        transform: scale(0.98);
      }
      
      .sess-icon-box {
        width: 80rpx;
        height: 80rpx;
        background: #f0f3f6;
        color: #7f8c8d;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        font-size: 38rpx;
      }
      
      .sess-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .sess-id {
          font-size: 28rpx;
          color: #2c3e50;
          margin-bottom: 8rpx;
        }
        
        .sess-time {
          font-size: 22rpx;
          color: #95a5a6;
        }
      }
    }
    
    .empty-sessions {
      padding: 120rpx 0;
      text-align: center;
      color: #bdc3c7;
      
      .cuIcon-info {
        font-size: 80rpx;
        margin-bottom: 30rpx;
        opacity: 0.5;
      }
      
      text { font-size: 26rpx; }
    }
  }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
