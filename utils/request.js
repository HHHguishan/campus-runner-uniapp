/**
 * 网络请求封装
 * 基于uni.request封装的请求工具
 */

import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY } from './config.js'
import { getToken, clearAuth } from './token.js'

/**
 * 请求拦截器
 * 在请求发送前统一处理
 * @param {Object} config - 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(config) {
	// 1. 添加Token到请求头（如果存在）
	const token = getToken()
	if (token) {
		config.header = {
			...config.header,
			'Authorization': `Bearer ${token}`
		}
	}

	// 2. 添加基础URL（如果config.url不是完整URL）
	if (!config.url.startsWith('http')) {
		config.url = API_BASE_URL + config.url
	}

	// 3. 设置默认超时时间
	if (!config.timeout) {
		config.timeout = REQUEST_TIMEOUT
	}

	// 4. 打印请求日志（开发调试用）
	console.log('🚀 请求发送:', {
		url: config.url,
		method: config.method,
		data: config.data,
		header: config.header
	})

	return config
}

/**
 * 响应拦截器
 * 统一处理响应数据
 * @param {Object} response - 响应对象
 * @returns {Promise} 处理后的数据
 */
function responseInterceptor(response) {
	const { statusCode, data } = response

	console.log('📥 响应接收:', {
		url: response.config?.url,
		statusCode,
		data
	})

	// 1. HTTP状态码检查
	if (statusCode >= 200 && statusCode < 300) {
		// 2. 业务状态码检查
		if (data.code === 200) {
			// 请求成功，返回业务数据
			return Promise.resolve(data)
		} else {
			// 业务错误（如：验证码错误、参数错误等）
			uni.showToast({
				title: data.message || '请求失败',
				icon: 'none',
				duration: 2000
			})
			return Promise.reject(new Error(data.message || '请求失败'))
		}
	}

	// 3. 特殊HTTP状态码处理
	if (statusCode === 401) {
		// Token过期或未授权
		uni.showToast({
			title: '登录已过期，请重新登录',
			icon: 'none'
		})
		clearAuth()

		// 跳转到登录页
		setTimeout(() => {
			uni.reLaunch({
				url: '/pages/login/login'
			})
		}, 1500)

		return Promise.reject(new Error('未授权'))
	}

	if (statusCode === 403) {
		uni.showToast({
			title: '没有权限访问',
			icon: 'none'
		})
		return Promise.reject(new Error('禁止访问'))
	}

	if (statusCode === 404) {
		uni.showToast({
			title: '请求的资源不存在',
			icon: 'none'
		})
		return Promise.reject(new Error('资源不存在'))
	}

	if (statusCode === 500) {
		uni.showToast({
			title: '服务器错误',
			icon: 'none'
		})
		return Promise.reject(new Error('服务器错误'))
	}

	// 4. 其他错误
	uni.showToast({
		title: '网络请求失败',
		icon: 'none'
	})
	return Promise.reject(new Error('网络请求失败'))
}

/**
 * 通用请求方法
 * @param {Object} options - 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
	return new Promise((resolve, reject) => {
		// 1. 请求拦截处理
		const config = requestInterceptor({
			method: 'GET',
			header: {
				'Content-Type': 'application/json'
			},
			...options
		})

		// 2. 发起请求
		uni.request({
			...config,
			success: (response) => {
				responseInterceptor(response)
					.then(resolve)
					.catch(reject)
			},
			fail: (error) => {
				console.error('❌ 请求失败:', error)

				// 网络错误处理
				uni.showToast({
					title: '网络连接失败',
					icon: 'none'
				})
				reject(error)
			}
		})
	})
}

/**
 * GET请求
 * @param {String} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求结果
 */
export function get(url, params = {}, options = {}) {
	return request({
		url,
		method: 'GET',
		data: params,
		...options
	})
}

/**
 * POST请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求体数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求结果
 */
export function post(url, data = {}, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

/**
 * PUT请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求体数据
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求结果
 */
export function put(url, data = {}, options = {}) {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

/**
 * DELETE请求
 * @param {String} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 其他配置
 * @returns {Promise} 请求结果
 */
export function del(url, params = {}, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data: params,
		...options
	})
}

// 导出默认方法
export default request
