import { getBaiduLocation } from './location.js'
import { reportLocation } from '../api/order.js'
import { getRiderOrders } from '../api/rider.js'
import { getToken } from './token.js'

class RiderTracker {
    constructor() {
        this.timer = null
        this.activeOrderIds = [] // 正在进行的订单 ID 列表
        this.isReporting = false
    }

    /**
     * 初始化并启动全局监听
     */
    init() {
        console.log('🚀 全局位置监听器已初始化')
        this.checkAndStart()

        // 每 2 分钟检查一遍是否有新订单（作为兜底）
        setInterval(() => {
            this.checkAndStart()
        }, 120000)
    }

    /**
     * 检查是否需要开始汇报
     */
    async checkAndStart() {
        const token = getToken()
        if (!token) return

        try {
            // 查询是否有配送中的订单
            const res = await getRiderOrders({
                page: 1,
                size: 20, // 获取所有配送中的订单
                status: 2 // 配送中
            })

            const newOrderIds = (res.data && res.data.records)
                ? res.data.records.map(r => r.id)
                : []

            if (newOrderIds.length > 0) {
                // 判断订单列表是否有变化
                const isChanged = JSON.stringify(this.activeOrderIds) !== JSON.stringify(newOrderIds)
                this.activeOrderIds = newOrderIds

                if (!this.isReporting || isChanged) {
                    this.startReporting()
                }
            } else {
                this.stopReporting()
                this.activeOrderIds = []
            }
        } catch (err) {
            console.error('🔍 检查配送订单失败:', err)
        }
    }

    /**
     * 开始上报位置
     */
    startReporting() {
        if (this.isReporting) {
            // 如果已经在上报，定时器不用重开，只需确保 doReport 使用最新的 activeOrderIds
            return
        }
        this.isReporting = true
        console.log('🏇 开启多订单位置同步:', this.activeOrderIds)

        const doReport = async () => {
            if (this.activeOrderIds.length === 0 || !this.isReporting) return

            try {
                const loc = await getBaiduLocation()

                // 为每一个正在配送的订单上报位置
                const reports = this.activeOrderIds.map(orderId =>
                    reportLocation({
                        orderId: orderId,
                        latitude: loc.latitude,
                        longitude: loc.longitude
                    })
                )

                await Promise.all(reports)
                console.log('📡 多订单位置同步成功:', loc.latitude, loc.longitude, `(共${this.activeOrderIds.length}单)`)
            } catch (err) {
                console.error('❌ 多订单位置上报失败:', err)
            }
        }

        // 立即上报一次
        doReport()
        // 设置定时器 30s
        this.timer = setInterval(doReport, 30000)

        // 如果是微信小程序环境，可以尝试开启背景定位（如果 manifest.json 已配置）
        // #ifdef MP-WEIXIN
        wx.startLocationUpdateBackground({
            success: (res) => {
                console.log('🟢 背景定位已开启')
                wx.onLocationChange((res) => {
                    // 这里可以实现更高频率的增量上报，但为了省电和后端压力，暂时维持 30s 定时
                    // 如果需要实时丝滑，可以在这里做 reportLocation
                })
            },
            fail: (err) => {
                console.warn('🟡 背景定位开启失败，将维持常规上报:', err)
            }
        })
        // #endif
    }

    /**
     * 停止上报
     */
    stopReporting() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
        this.isReporting = false
        console.log('⏹️ 全局位置上报已停止')

        // #ifdef MP-WEIXIN
        wx.stopLocationUpdate()
        // #endif
    }
}

export default new RiderTracker()
