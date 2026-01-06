/**
 * 认证相关API
 */

import { get, post } from '../utils/request.js'
import { setToken, setUserInfo } from '../utils/token.js'

/**
 * 发送短信验证码
 * @param {String} phone - 手机号
 * @returns {Promise}
 */
export function sendSmsCode(phone) {
	return post('/sms/send-code?phone=' + phone)
}

/**
 * 检查发送验证码限制
 * @param {String} phone - 手机号
 * @returns {Promise}
 */
export function checkSmsLimit(phone) {
	return get('/sms/check-limit', { phone })
}

/**
 * 手机号验证码登录
 * @param {Object} data - 登录数据
 * @param {String} data.phone - 手机号
 * @param {String} data.code - 验证码
 * @param {String} data.deviceInfo - 设备信息（可选）
 * @param {String} data.location - 地理位置（可选）
 * @returns {Promise}
 */
export function loginByPhone(data) {
	return post('/auth/login/phone', data)
}

/**
 * 微信小程序登录
 * @param {Object} data - 登录数据
 * @param {String} data.code - 微信登录code
 * @param {String} data.avatar - 头像URL
 * @param {String} data.nickname - 昵称
 * @returns {Promise}
 */
export function loginByWechat(data) {
	return post('/auth/login/wechat', data)
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
	// 清除本地存储的Token和用户信息
	uni.removeStorageSync('Authorization')
	uni.removeStorageSync('userInfo')

	return Promise.resolve()
}

/**
 * 登录成功后的处理
 * @param {Object} loginData - 登录返回数据
 * @param {String} loginData.token - JWT Token
 * @param {Object} loginData.data - 用户信息
 */
export function handleLoginSuccess(loginData) {
	const { token, ...userInfo } = loginData

	// 1. 存储Token
	setToken(token)

	// 2. 存储用户信息
	setUserInfo(userInfo)

	console.log('✅ 登录成功，用户信息已保存:', userInfo)
}
