/**
 * 订单相关API
 */

import { get, post, put } from '../utils/request.js'

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function createOrder(data) {
  return post('/order/create', data)
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @param {Number} params.status - 订单状态
 * @param {Number} params.type - 订单类型
 * @returns {Promise}
 */
export function getOrderList(params) {
  return get('/order/list', params)
}

/**
 * 获取订单详情
 * @param {Number} orderId - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(orderId) {
  return get(`/order/${orderId}`)
}

/**
 * 取消订单
 * @param {Object} data - 取消订单数据
 * @param {Number} data.orderId - 订单ID
 * @param {String} data.cancelReason - 取消原因
 * @returns {Promise}
 */
export function cancelOrder(data) {
  return put('/order/cancel', data)
}

/**
 * 获取订单统计
 * @returns {Promise}
 */
export function getOrderStatistics() {
  return get('/order/statistics')
}

/**
 * 订单评价
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export function submitEvaluation(data) {
  return post('/evaluation/submit', data)
}

/**
 * 获取订单评价详情
 * @param {Number} orderId - 订单ID
 * @returns {Promise}
 */
export function getEvaluationDetail(orderId) {
  return get(`/evaluation/detail/${orderId}`)
}

/**
 * 订单支付
 * @param {Object} data - 支付数据
 * @param {Number} data.orderId - 订单ID
 * @param {Number} data.payType - 支付方式(1-余额支付)
 * @param {String} data.payPassword - 支付密码
 * @returns {Promise}
 */
export function payOrder(data) {
  return post('/pay/doPay', data)
}
