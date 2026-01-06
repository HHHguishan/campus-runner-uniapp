/**
 * Token管理工具
 * 负责Token的存储、获取、清除
 */

import { TOKEN_KEY, USER_INFO_KEY } from './config.js'

/**
 * 存储Token
 * @param {String} token - JWT Token
 */
export function setToken(token) {
	uni.setStorageSync(TOKEN_KEY, token)
}

/**
 * 获取Token
 * @returns {String} Token
 */
export function getToken() {
	return uni.getStorageSync(TOKEN_KEY) || ''
}

/**
 * 清除Token
 */
export function removeToken() {
	uni.removeStorageSync(TOKEN_KEY)
}

/**
 * 存储用户信息
 * @param {Object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
	uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息对象
 */
export function getUserInfo() {
	const userInfoStr = uni.getStorageSync(USER_INFO_KEY)
	return userInfoStr ? JSON.parse(userInfoStr) : null
}

/**
 * 清除用户信息
 */
export function removeUserInfo() {
	uni.removeStorageSync(USER_INFO_KEY)
}

/**
 * 清除所有登录信息（Token + 用户信息）
 */
export function clearAuth() {
	removeToken()
	removeUserInfo()
}

/**
 * 检查是否已登录
 * @returns {Boolean} 是否已登录
 */
export function isLoggedIn() {
	const token = getToken()
	return !!token
}
