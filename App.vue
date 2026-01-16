<script>
	import { getToken } from './utils/token.js'
	import riderTracker from './utils/tracker.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')

			// 检查登录状态
			const token = getToken()
			if (token) {
				// 已登录，初始化全局追踪器
				riderTracker.init()
			} else {
				// 未登录，跳转到登录页
				uni.reLaunch({
					url: '/pages/login/login'
				})
			}
		},
		onShow: function() {
			console.log('App Show')
			// 再次检查并开启追踪器（防止 onLaunch 漏掉或重新切入时状态不一致）
			if (getToken()) {
				riderTracker.checkAndStart()
			}
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
