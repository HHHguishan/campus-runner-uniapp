/**
 * 骑手相关API
 */

import { get, post } from '../utils/request.js'

/**
 * 获取骑手认证状态
 * @returns {Promise}
 */
export function getRunnerStatus() {
  return get('/runner/status')
}

/**
 * 获取骑手认证信息
 * @returns {Promise}
 */
export function getRunnerInfo() {
  return get('/runner/info')
}

/**
 * 提交学生证认证申请
 * @param {Object} data - 认证信息
 * @param {String} data.realName - 真实姓名
 * @param {String} data.studentId - 学号
 * @param {String} data.schoolName - 学校名称
 * @param {String} data.idCardFront - 学生证正面URL
 * @param {String} data.idCardBack - 学生证反面URL
 * @returns {Promise}
 */
export function submitStudentCardApply(data) {
  return post('/runner/apply/student-card', data)
}

/**
 * 骑手接单
 * @param {Number} orderId - 订单ID
 * @returns {Promise}
 */
export function grabOrder(orderId) {
  return post('/order/grab', { orderId })
}

/**
 * 完成订单
 * @param {Object} data - 完成订单数据
 * @param {Number} data.orderId - 订单ID
 * @param {String} data.finishImg - 完成图片URL
 * @returns {Promise}
 */
export function finishOrder(data) {
  return put('/order/finish', data)
}

/**
 * 获取骑手订单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.status - 订单状态
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @returns {Promise}
 */
export function getRiderOrders(params) {
  return get('/order/list', params)
}

/**
 * 获取骑手统计数据
 * @returns {Promise}
 */
export function getRiderStats() {
  return get('/order/statistics')
}

/**
 * 获取骑手工作台数据看板
 * @returns {Promise}
 */
export function getRiderDashboard() {
  return get('/runner/dashboard/overview')
}

/**
 * 获取骑手收入统计
 * @returns {Promise}
 */
export function getRiderIncome() {
  return get('/runner/dashboard/income')
}

/**
 * 获取骑手订单统计
 * @returns {Promise}
 */
export function getRiderOrderStats() {
  return get('/runner/dashboard/orders')
}

/**
 * 获取骑手评分统计
 * @returns {Promise}
 */
export function getRiderEvaluationStats() {
  return get('/evaluation/statistics?type=received')
}
