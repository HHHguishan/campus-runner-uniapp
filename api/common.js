/**
 * 通用API
 */

import { post } from '../utils/request.js'

/**
 * 文件上传
 * @param {String} filePath - 本地文件路径
 * @param {String} type - 文件类型（avatar/id_card/temp）
 * @returns {Promise}
 */
export function uploadFile(filePath, type = 'temp') {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'http://localhost:9090/api/common/upload',
      filePath: filePath,
      name: 'file',
      formData: {
        type: type
      },
      header: {
        'Authorization': 'Bearer ' + uni.getStorageSync('Authorization')
      },
      success: (uploadRes) => {
        if (uploadRes.statusCode === 200) {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message))
          }
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}
