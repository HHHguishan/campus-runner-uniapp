/**
 * 地址管理API
 */

import { get, post, del } from '../utils/request.js'

/**
 * 查询我的地址列表
 * @returns {Promise}
 */
export function getAddressList() {
  return get('/address/list')
}

/**
 * 获取默认地址
 * @returns {Promise}
 */
export function getDefaultAddress() {
  return get('/address/default')
}

/**
 * 获取地址详情
 * @param {Number} id - 地址ID
 * @returns {Promise}
 */
export function getAddressDetail(id) {
  return get(`/address/${id}`)
}

/**
 * 新增/修改地址
 * @param {Object} data - 地址数据
 * @param {Number} data.id - 地址ID（修改时必填）
 * @param {String} data.contactName - 联系人姓名
 * @param {String} data.contactPhone - 联系电话
 * @param {String} data.province - 省份
 * @param {String} data.city - 城市
 * @param {String} data.district - 区县
 * @param {String} data.detailAddress - 详细地址
 * @param {Number} data.isDefault - 是否默认地址(0-否,1-是)
 * @param {Number} data.latitude - 纬度
 * @param {Number} data.longitude - 经度
 * @returns {Promise}
 */
export function saveAddress(data) {
  return post('/address/save', data)
}

/**
 * 删除地址
 * @param {Number} id - 地址ID
 * @returns {Promise}
 */
export function deleteAddress(id) {
  return del(`/address/${id}`)
}
