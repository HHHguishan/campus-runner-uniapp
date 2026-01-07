/**
 * 公告相关API
 */

import { get } from '../utils/request.js'

/**
 * 获取公告列表
 * @param {Object} params - 查询参数
 * @param {Number} params.type - 公告类型（可选）
 * @returns {Promise}
 */
export function getNoticeList(params) {
  return get('/public/notice/list', params)
}

/**
 * 获取轮播图列表
 * @returns {Promise}
 */
export function getBannerList() {
  return get('/public/notice/banner')
}

/**
 * 获取公告详情
 * @param {Number} id - 公告ID
 * @returns {Promise}
 */
export function getNoticeDetail(id) {
  return get(`/public/notice/${id}`)
}
