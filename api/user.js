/**
 * 用户相关API
 */

import { get, post } from '../utils/request.js'
import { setUserInfo } from '../utils/token.js'

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return get('/user/info')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  return put('/user/update', data)
}

/**
 * 切换身份模式
 * @param {Object} data - 切换数据
 * @param {String} data.targetMode - 目标模式（user/rider）
 * @returns {Promise}
 */
export function switchMode(data) {
  return post('/user/switch-mode', data)
}

/**
 * 获取当前身份信息
 * @returns {Promise}
 */
export function getModeInfo() {
  return get('/user/mode-info')
}

/**
 * 绑定手机号
 * @param {Object} data - 绑定数据
 * @param {String} data.phone - 手机号
 * @param {String} data.code - 验证码
 * @returns {Promise}
 */
export function bindPhone(data) {
  return post('/user/bind-phone', data)
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  // 清除本地存储
  uni.removeStorageSync('Authorization')
  uni.removeStorageSync('userInfo')

  return Promise.resolve()
}
