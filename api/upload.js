/**
 * 文件上传相关API
 */

import { uploadFile } from '../utils/request.js'

/**
 * 上传文件
 * @param {String} filePath - 本地文件路径
 * @param {String} type - 文件类型 (avatar/document/image等)
 * @returns {Promise}
 */
export function uploadFileAPI(filePath, type = 'avatar') {
  return uploadFile('/common/upload', filePath, {
    type: type
  })
}

/**
 * 上传头像
 * @param {String} filePath - 本地图片路径
 * @returns {Promise}
 */
export function uploadAvatar(filePath) {
  return uploadFileAPI(filePath, 'avatar')
}
