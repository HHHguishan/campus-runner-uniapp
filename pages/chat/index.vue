<template>
	<view class="chat-container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-content">
				<view class="back-btn" @tap="goBack">
					<text class="iconfont icon-back">←</text>
				</view>
				<view class="title-group">
					<view class="title">{{ roleName }}</view>
					<view class="status" :class="socketOpen ? 'status-online' : 'status-offline'">
						{{ socketOpen ? '串联在线' : '等待重连...' }}
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
		</view>

		<!-- 聊天内容区域 -->
		<scroll-view 
			class="message-list" 
			scroll-y 
			:scroll-into-view="lastMsgId" 
			@scrolltoupper="loadHistory"
		>
			<view class="msg-padding" :style="{ height: statusBarHeight + 50 + 'px' }"></view>
			
			<view v-for="(msg, index) in messages" :key="msg.id || index" :id="'chat-item-' + (msg.id || index)" class="msg-item" :class="{ 'msg-mine': msg.senderId == mineId }">
				<view class="msg-time" v-if="showTime(index)">{{ formatTime(msg.createTime) }}</view>
				<view class="msg-content-wrapper">
					<image class="avatar" :src="msg.senderId == mineId ? myAvatar : otherAvatar" mode="aspectFill"></image>
					<view class="msg-body">
						<text class="msg-nickname" v-if="msg.senderId != mineId">{{ roleName }}</text>
						<view class="msg-bubble">
							<text class="text">{{ msg.content }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="msg-footer" style="height: 120rpx;"></view>
		</scroll-view>

		<!-- 底部输入栏 -->
		<view class="input-bar" :style="{ paddingBottom: safeAreaInsets.bottom + 'px' }">
			<input 
				class="input" 
				v-model="inputMsg" 
				placeholder="请输入消息..." 
				confirm-type="send" 
				@confirm="sendMsg" 
			/>
			<button class="send-btn" @tap="sendMsg" :disabled="!inputMsg.trim() || !socketOpen">发送</button>
		</view>
	</view>
</template>

<script>
	import { BASE_URL, API_BASE_URL } from '@/utils/config.js';
	import { getToken, getUserInfo } from '@/utils/token.js';
	import { get } from '@/utils/request.js';
	
	export default {
		data() {
			return {
				statusBarHeight: 0,
				safeAreaInsets: { bottom: 0 },
				orderId: null,
				receiverId: null,
				roleName: '对方',
				mineId: null,
				nickname: '',
				myAvatar: '',
				otherAvatar: '',
				inputMsg: '',
				messages: [],
				lastMsgId: '',
				socketOpen: false,
				socketTask: null,
				reconnectTimer: null
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			this.safeAreaInsets = systemInfo.safeAreaInsets || { bottom: 0 };
			
			this.orderId = options.orderId;
			this.receiverId = options.receiverId;
			this.nickname = decodeURIComponent(options.nickname || '') || (options.role == 'rider' ? '骑手' : '用户');
			this.roleName = this.nickname;
			
			const userInfo = getUserInfo() || {};
			this.mineId = userInfo.id;
			this.myAvatar = userInfo.avatar || '/static/default-avatar.png';
			this.otherAvatar = decodeURIComponent(options.avatar || '') || '/static/default-avatar.png';

			console.log('Chat Init:', {
				orderId: this.orderId,
				receiverId: this.receiverId,
				mineId: this.mineId,
				role: options.role
			});

			if (!this.receiverId) {
				uni.showModal({
					title: '提示',
					content: '未获取到聊天对象ID，无法发送消息',
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
				uni.navigateBack();
			},
			formatTime(time) {
				if (!time) return '';
				const date = new Date(time);
				return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
			},
			showTime(index) {
				if (index === 0) return true;
				const curr = new Date(this.messages[index].createTime).getTime();
				const prev = new Date(this.messages[index - 1].createTime).getTime();
				return curr - prev > 5 * 60 * 1000; // 5分钟显示一次时间
			},
			async loadHistory() {
				try {
					const res = await get(`/chat/history/${this.orderId}`);
					if (res.code === 200) {
						this.messages = res.data;
						this.$nextTick(() => {
							this.scrollToBottom();
						});
					}
				} catch (err) {
					console.error('加载历史失败', err);
				}
			},
			connectSocket() {
				let token = getToken();
				if (token && token.startsWith('Bearer ')) {
					token = token.substring(7);
				}
				// 再次清理可能存在的 Bearer (以防 getToken 返回的是完整 Header)
				token = token.trim();
				
				// 注意：小程序正式环境需要 wss
				const baseWsUrl = API_BASE_URL.startsWith('https') ? API_BASE_URL.replace('https', 'wss') : API_BASE_URL.replace('http', 'ws');
				const wsUrl = `${baseWsUrl}/ws/chat/${encodeURIComponent(token)}/${this.orderId}`;
				
				console.log('Target WS URL:', wsUrl);
				
				this.socketTask = uni.connectSocket({
					url: wsUrl,
					success: () => {
						console.log('WebSocket 握手开始...');
					},
					fail: (err) => {
						console.error('uni.connectSocket 调用失败', err);
						this.reconnect();
					}
				});

				this.socketTask.onOpen(() => {
					this.socketOpen = true;
					console.log('WebSocket 已连接');
					uni.showToast({ title: '已连接', icon: 'none', duration: 1000 });
					if (this.reconnectTimer) {
						clearInterval(this.reconnectTimer);
						this.reconnectTimer = null;
					}
				});

				this.socketTask.onMessage((res) => {
					console.log('收到 WebSocket 原始消息:', res);
					try {
						// 兼容性处理：有些环境 res.data 已经是对象
						const msg = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
						console.log('解析后的消息对象:', msg);
						
						// 过滤非本订单消息
						if (msg.orderId == this.orderId) {
							// 查重：避免由于回显逻辑导致重复
							if (msg.id) {
								const exists = this.messages.some(m => m.id === msg.id);
								if (exists) return;
							}
							
							this.messages.push(msg);
							this.scrollToBottom();
							
							// 震动提示（可选）
							uni.vibrateShort();
						} else {
							console.log('收到其他订单消息，已忽略:', msg.orderId);
						}
					} catch (e) {
						console.error('解析消息失败', e);
					}
				});

				this.socketTask.onClose(() => {
					this.socketOpen = false;
					console.log('WebSocket 已关闭');
					this.reconnect();
				});

				this.socketTask.onError((err) => {
					this.socketOpen = false;
					console.error('WebSocket 错误', err);
					uni.showToast({ title: '连接错误: ' + (err.errMsg || '未知'), icon: 'none' });
					this.reconnect();
				});
			},
			reconnect() {
				if (this.reconnectTimer) return;
				this.reconnectTimer = setInterval(() => {
					console.log('正在尝试重连...');
					this.connectSocket();
				}, 10000);
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
						uni.showToast({ title: '连接未就绪', icon: 'none' });
					}
					return;
				}
				
				if (!this.receiverId) {
					uni.showToast({ title: '缺少接收者', icon: 'none' });
					return;
				}
				
				const msgData = {
					orderId: this.orderId,
					receiverId: this.receiverId,
					content: this.inputMsg,
					msgType: 1
				};
				
				console.log('Sending Msg:', msgData);
				
				this.socketTask.send({
					data: JSON.stringify(msgData),
					success: () => {
						this.inputMsg = '';
					},
					fail: (err) => {
						uni.showToast({ title: '发送失败', icon: 'none' });
						console.error('发送错误', err);
					}
				});
			},
			scrollToBottom() {
				this.$nextTick(() => {
					setTimeout(() => {
						if (this.messages.length > 0) {
							const lastIndex = this.messages.length - 1;
							const lastMsg = this.messages[lastIndex];
							this.lastMsgId = 'chat-item-' + (lastMsg.id || lastIndex);
							console.log('Scrolling to bottom, anchor:', this.lastMsgId);
						}
					}, 200); // 增加延迟确保图片和DOM渲染完成
				});
			}
		}
	}
</script>

<style lang="scss">
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.nav-bar {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		
		.nav-content {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			
			.title-group {
				display: flex;
				flex-direction: column;
				align-items: center;
				
				.title {
					font-size: 32rpx;
					font-weight: bold;
					line-height: 1.2;
				}
				
				.status {
					font-size: 20rpx;
					margin-top: 4rpx;
					
					&.status-online {
						color: #fff;
						opacity: 0.9;
					}
					
					&.status-offline {
						color: #ffdada;
						font-weight: bold;
					}
				}
			}
			
			.back-btn, .placeholder {
				width: 60rpx;
			}
		}
	}

	.message-list {
		flex: 1;
		
		.msg-item {
			padding: 20rpx 30rpx;
			
			.msg-time {
				text-align: center;
				font-size: 22rpx;
				color: #999;
				margin-bottom: 20rpx;
			}
			
			.msg-content-wrapper {
				display: flex;
				flex-direction: row;
				
				.avatar {
					width: 80rpx;
					height: 80rpx;
					border-radius: 10rpx;
					margin-right: 20rpx;
					background-color: #eee;
				}
				
				.msg-body {
					display: flex;
					flex-direction: column;
					max-width: 70%;
					
					.msg-nickname {
						font-size: 22rpx;
						color: #999;
						margin-bottom: 6rpx;
						margin-left: 10rpx;
					}
					
					.msg-bubble {
						background-color: #fff;
						padding: 20rpx;
						border-radius: 10rpx;
						position: relative;
						
						&::before {
							content: '';
							position: absolute;
							left: -10rpx;
							top: 30rpx;
							border-top: 10rpx solid transparent;
							border-bottom: 10rpx solid transparent;
							border-right: 10rpx solid #fff;
						}
						
						.text {
							font-size: 28rpx;
							color: #333;
							word-break: break-all;
						}
					}
				}
			}
			
			&.msg-mine {
				.msg-content-wrapper {
					flex-direction: row-reverse;
					
					.avatar {
						margin-right: 0;
						margin-left: 20rpx;
					}
					
					.msg-body {
						align-items: flex-end;
						
						.msg-nickname {
							margin-right: 10rpx;
							margin-left: 0;
						}
						
						.msg-bubble {
							background-color: #e0e7ff;
							color: #333;
							
							.text {
								color: #333;
							}
							
							&::before {
								display: none;
							}
							
							&::after {
								content: '';
								position: absolute;
								right: -10rpx;
								top: 30rpx;
								border-top: 10rpx solid transparent;
								border-bottom: 10rpx solid transparent;
								border-left: 10rpx solid #e0e7ff;
							}
						}
					}
				}
			}
		}
	}

	.input-bar {
		background-color: #f7f7f7;
		border-top: 1rpx solid #ddd;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		
		.input {
			flex: 1;
			background-color: #fff;
			height: 72rpx;
			border-radius: 10rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
		}
		
		.send-btn {
			width: 120rpx;
			height: 72rpx;
			line-height: 72rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			font-size: 26rpx;
			margin-left: 20rpx;
			border-radius: 10rpx;
			padding: 0;
			
			&[disabled] {
				background-color: #eee;
				color: #999;
			}
		}
	}
</style>
