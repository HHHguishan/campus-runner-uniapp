/**
 * 系统配置相关API
 */

import { get } from '../utils/request.js'

/**
 * 获取单个配置值
 * @param {String} key - 配置键
 * @returns {Promise}
 */
export function getConfigValue(key) {
  return get(`/public/config/${key}`)
}

/**
 * 批量获取配置值
 * @param {String} keys - 配置键，多个用逗号分隔（可选）
 * @returns {Promise}
 */
export function getConfigs(keys) {
  // 如果没有传递keys，则不传参数
  const params = keys ? { keys } : {}
  return get('/public/config', params)
}

/**
 * 获取系统基础配置（价格相关）
 * @returns {Promise}
 */
export function getBaseConfigs() {
  return getConfigs('base_price,per_km_price,weather_rate,platform_rate')
}
