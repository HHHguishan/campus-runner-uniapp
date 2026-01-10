/**
 * 管理员相关API
 */

import { get, post, put, del } from '../utils/request.js'

/**
 * 管理员订单列表查询
 * @param {Object} params - 查询参数
 * @param {Number} params.status - 订单状态（0-待支付,1-待接单,2-配送中,3-已完成,4-已取消,5-退款中）
 * @param {String} params.orderType - 订单类型（buy-帮买,send-帮送,pick-帮取）
 * @param {String} params.abnormalType - 异常类型（timeout_not_taken-超时未接单,timeout_delivery-配送超时,abnormal_payment-支付异常）
 * @param {String} params.startTime - 开始时间（格式：2025-01-01）
 * @param {String} params.endTime - 结束时间（格式：2025-01-31）
 * @param {String} params.keyword - 关键词（订单号/用户昵称/骑手昵称/商品描述）
 * @param {Number} params.current - 当前页
 * @param {Number} params.size - 每页大小
 * @returns {Promise}
 */
export function getAdminOrderList(params) {
  return get('/admin/order/list', params)
}

/**
 * 管理员获取订单详情
 * @param {Number} orderId - 订单ID
 * @returns {Promise}
 */
export function getAdminOrderDetail(orderId) {
  return get(`/admin/order/${orderId}`)
}

/**
 * 骑手认证审核通过
 * @param {Object} data - 审核数据
 * @param {Number} data.runnerId - 骑手ID
 * @param {String} data.remark - 审核备注
 * @returns {Promise}
 */
export function approveRunner(data) {
  return post('/admin/runner/approve', data)
}

/**
 * 骑手认证审核驳回
 * @param {Object} data - 审核数据
 * @param {Number} data.runnerId - 骑手ID
 * @param {String} data.reason - 驳回原因
 * @returns {Promise}
 */
export function rejectRunner(data) {
  return post('/admin/runner/reject', data)
}

/**
 * 获取待审核骑手申请列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @returns {Promise}
 */
export function getPendingRunnerList(params) {
  return get('/admin/runner/pending', params)
}

/**
 * 获取骑手申请详情
 * @param {Number} id - 申请ID
 * @returns {Promise}
 */
export function getRunnerApplicationDetail(id) {
  return get(`/admin/runner/${id}`)
}

/**
 * 审核提现申请
 * @param {Object} data - 审核数据
 * @param {Number} data.id - 提现记录ID
 * @param {Number} data.status - 审核状态（1-通过,2-驳回）
 * @param {String} data.remark - 审核备注
 * @returns {Promise}
 */
export function auditWithdraw(data) {
  return post('/admin/withdraw/audit', data)
}

/**
 * 获取所有提现记录
 * @param {Object} params - 查询参数
 * @param {Number} params.current - 当前页
 * @param {Number} params.size - 每页大小
 * @param {Number} params.status - 状态（可选）
 * @returns {Promise}
 */
export function getAllWithdrawRecords(params) {
  return get('/admin/withdraw/list', params)
}

/**
 * 获取系统配置列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @returns {Promise}
 */
export function getAdminConfigList(params) {
  return get('/admin/config/list', params)
}

/**
 * 更新系统配置
 * @param {Object} data - 配置数据
 * @param {Number} data.id - 配置ID
 * @param {String} data.configValue - 配置值
 * @returns {Promise}
 */
export function updateAdminConfig(data) {
  return put('/admin/config/update', data)
}

/**
 * 创建公告
 * @param {Object} data - 公告数据
 * @param {String} data.title - 公告标题
 * @param {String} data.content - 公告内容
 * @param {Number} data.type - 公告类型（1-系统公告,2-活动公告,3-轮播图）
 * @param {String} data.imageUrl - 图片URL（轮播图必填）
 * @returns {Promise}
 */
export function createNotice(data) {
  return post('/admin/notice/create', data)
}

/**
 * 更新公告
 * @param {Object} data - 公告数据
 * @param {Number} data.id - 公告ID
 * @param {String} data.title - 公告标题
 * @param {String} data.content - 公告内容
 * @param {Number} data.type - 公告类型
 * @param {String} data.imageUrl - 图片URL
 * @returns {Promise}
 */
export function updateNotice(data) {
  return put('/admin/notice/update', data)
}

/**
 * 删除公告
 * @param {Number} id - 公告ID
 * @returns {Promise}
 */
export function deleteNotice(id) {
  return del(`/admin/notice/delete/${id}`)
}

/**
 * 更新公告状态
 * @param {Number} id - 公告ID
 * @returns {Promise}
 */
export function updateNoticeStatus(id) {
  return put(`/admin/notice/status/${id}`)
}

/**
 * 获取公告列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.size - 每页大小
 * @param {Number} params.type - 公告类型（可选）
 * @returns {Promise}
 */
export function getAdminNoticeList(params) {
  return get('/admin/notice/list', params)
}
