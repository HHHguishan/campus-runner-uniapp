/**
 * 钱包管理API
 */

import { get, post } from '../utils/request.js'

/**
 * 获取钱包余额
 * @returns {Promise}
 */
export function getWalletBalance() {
  return get('/wallet/balance')
}

/**
 * 模拟充值（测试用）
 * @param {Object} data - 充值数据
 * @param {Number} data.amount - 充值金额
 * @returns {Promise}
 */
export function recharge(data) {
  // 后端使用@RequestParam接收参数
  // 需要将amount作为查询参数传递（后端从URL或表单中获取）
  const amount = Number(data.amount).toFixed(2)
  const url = `/wallet/mock/recharge?amount=${amount}`
  return post(url, {})
}

/**
 * 获取资金流水记录
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @returns {Promise}
 */
export function getTransactions(params = {}) {
  return get('/wallet/transactions', params)
}
