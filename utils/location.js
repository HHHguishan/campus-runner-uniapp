/**
 * 百度地图定位工具类
 * 基于百度地图微信小程序JS SDK封装
 */
import { BAIDU_MAP_AK } from './config.js'
// 导入百度 SDK
import { BMapWX } from '@/libs/bmap-wx.js'

/**
 * 获取当前位置信息 (高精度)
 * @returns {Promise} 返回包含经纬度和地址信息的 Promise
 */
export function getBaiduLocation() {
    return new Promise((resolve, reject) => {
        // 1. 初始化百度地图对象
        const BMap = new BMapWX({
            ak: BAIDU_MAP_AK
        })

        console.log('📡 开始获取系统高精度定位...')

        // 先使用 uni.getLocation 获取高精度经纬度，再传给百度进行逆地理编码
        uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            highAccuracyExpireTime: 3000,
            success: (locRes) => {
                console.log('🛰️ 系统定位成功:', locRes)
                const locationStr = `${locRes.latitude},${locRes.longitude}`

                // 2. 将高精度经纬度传给百度 SDK 进行逆地理编码
                BMap.regeocoding({
                    location: locationStr, // 关键：传入经纬度，跳过 SDK 内部的定位获取
                    fail: (err) => {
                        console.error('❌ 百度地图解析地址失败:', err)
                        reject(err)
                    },
                    success: (res) => {
                        console.log('✅ 百度地图解析成功:', res)

                        if (res.wxMarkerData && res.wxMarkerData.length > 0) {
                            const locationData = res.wxMarkerData[0]

                            const result = {
                                latitude: locRes.latitude,
                                longitude: locRes.longitude,
                                address: res.originalData.result.formatted_address,
                                addressComponent: res.originalData.result.addressComponent,
                                business: res.originalData.result.business,
                                pois: res.originalData.result.pois
                            }

                            // 优先使用语义化描述
                            let displayName = result.address
                            if (res.originalData.result.sematic_description) {
                                displayName = res.originalData.result.sematic_description
                            }

                            result.displayName = displayName
                            resolve(result)
                        } else {
                            reject(new Error('未获取到位置详情'))
                        }
                    }
                })
            },
            fail: (err) => {
                console.error('❌ 系统定位获取失败:', err)
                reject(err)
            }
        })
    })
}
