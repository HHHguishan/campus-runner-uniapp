<template>
  <view class="debug-container">
    <view class="header">
      <text class="title">API调试工具</text>
      <text class="subtitle">检查后端数据连接</text>
    </view>

    <!-- 测试按钮 -->
    <view class="test-section">
      <button class="test-btn" @tap="testBannerAPI">测试轮播图API</button>
      <button class="test-btn" @tap="testNoticeAPI">测试公告API</button>
      <button class="test-btn" @tap="testConfigAPI">测试配置API</button>
      <button class="test-btn" @tap="testAllAPIs">一键测试全部</button>
      <button class="test-btn danger" @tap="clearLogs">清空日志</button>
    </view>

    <!-- 显示结果 -->
    <view class="result-section">
      <text class="result-title">测试结果：</text>
      <scroll-view class="log-container" scroll-y>
        <text class="log-text">{{ logs }}</text>
      </scroll-view>
    </view>

    <!-- API信息 -->
    <view class="info-section">
      <text class="info-title">API端点信息</text>
      <view class="info-item">
        <text class="info-label">轮播图：</text>
        <text class="info-value">{{ baseUrl }}/api/public/notice/banner</text>
      </view>
      <view class="info-item">
        <text class="info-label">公告列表：</text>
        <text class="info-value">{{ baseUrl }}/api/public/notice/list</text>
      </view>
      <view class="info-item">
        <text class="info-label">系统配置：</text>
        <text class="info-value">{{ baseUrl }}/api/public/config</text>
      </view>
      <view class="info-item">
        <text class="info-label">配置示例：</text>
        <text class="info-value">base_price, per_km_price, weather_rate</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getBannerList } from '@/api/notice.js'
import { getNoticeList } from '@/api/notice.js'
import { getConfigs } from '@/api/config.js'
import { BASE_URL } from '@/utils/config.js'

export default {
  data() {
    return {
      logs: '',
      baseUrl: BASE_URL + '/api'
    }
  },

  methods: {
    // 添加日志
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.logs += `[${timestamp}] ${message}\n\n`
      console.log(message)
    },

    // 测试轮播图API
    async testBannerAPI() {
      this.addLog('=== 开始测试轮播图API ===')
      this.addLog(`请求地址: ${this.baseUrl}/public/notice/banner`)

      try {
        const res = await getBannerList()

        this.addLog('✅ 请求成功')
        this.addLog(`响应码: ${res.code}`)
        this.addLog(`响应消息: ${res.message || '无'}`)

        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : []
          this.addLog(`数据类型: ${Array.isArray(res.data) ? '数组' : typeof res.data}`)
          this.addLog(`数据长度: ${data.length}`)

          if (data.length > 0) {
            this.addLog('\n📊 轮播图数据详情:')
            data.forEach((item, index) => {
              this.addLog(`\n[${index + 1}] ID: ${item.id}`)
              this.addLog(`    标题: ${item.title}`)
              this.addLog(`    图片: ${item.imgUrl || item.imageUrl || '无'}`)
              this.addLog(`    内容: ${item.content || '无'}`)
              this.addLog(`    状态: ${item.status}`)
              this.addLog(`    排序: ${item.sort || 0}`)
            })
          } else {
            this.addLog('⚠️ 返回空数组')
          }
        } else {
          this.addLog('⚠️ 响应中没有data字段')
        }
      } catch (error) {
        this.addLog('❌ 请求失败')
        this.addLog(`错误信息: ${error.message}`)
        this.addLog(`错误详情: ${JSON.stringify(error)}`)
      }

      this.addLog('\n' + '='.repeat(50) + '\n')
    },

    // 测试公告API
    async testNoticeAPI() {
      this.addLog('=== 开始测试公告API ===')
      this.addLog(`请求地址: ${this.baseUrl}/public/notice/list`)

      try {
        const res = await getNoticeList({ type: 1 })

        this.addLog('✅ 请求成功')
        this.addLog(`响应码: ${res.code}`)
        this.addLog(`响应消息: ${res.message || '无'}`)

        if (res.data) {
          const data = Array.isArray(res.data) ? res.data : []
          this.addLog(`数据类型: ${Array.isArray(res.data) ? '数组' : typeof res.data}`)
          this.addLog(`数据长度: ${data.length}`)

          if (data.length > 0) {
            this.addLog('\n📋 公告数据详情:')
            data.forEach((item, index) => {
              this.addLog(`\n[${index + 1}] ID: ${item.id}`)
              this.addLog(`    标题: ${item.title}`)
              this.addLog(`    类型: ${item.type === 1 ? '公告' : item.type === 2 ? '活动' : '未知'}`)
              this.addLog(`    状态: ${item.status === 1 ? '显示' : '隐藏'}`)
              this.addLog(`    创建时间: ${item.createTime}`)
              this.addLog(`    内容: ${item.content ? item.content.substring(0, 50) + '...' : '无'}`)
            })
          } else {
            this.addLog('⚠️ 返回空数组')
          }
        } else {
          this.addLog('⚠️ 响应中没有data字段')
        }
      } catch (error) {
        this.addLog('❌ 请求失败')
        this.addLog(`错误信息: ${error.message}`)
        this.addLog(`错误详情: ${JSON.stringify(error)}`)
      }

      this.addLog('\n' + '='.repeat(50) + '\n')
    },

    // 测试配置API
    async testConfigAPI() {
      this.addLog('=== 开始测试系统配置API ===')
      this.addLog(`请求地址: ${this.baseUrl}/public/config`)

      try {
        const res = await getConfigs()

        this.addLog('✅ 请求成功')
        this.addLog(`响应码: ${res.code}`)
        this.addLog(`响应消息: ${res.message || '无'}`)

        if (res.data) {
          this.addLog(`数据类型: ${typeof res.data}`)
          this.addLog(`是否为对象: ${typeof res.data === 'object'}`)
          this.addLog(`是否为数组: ${Array.isArray(res.data)}`)
          this.addLog('\n⚙️ 配置数据详情:')

          if (typeof res.data === 'object' && !Array.isArray(res.data)) {
            const keys = Object.keys(res.data)
            this.addLog(`配置项数量: ${keys.length}`)
            this.addLog(`配置键列表: ${keys.join(', ')}`)

            keys.forEach((key, index) => {
              const value = res.data[key]
              this.addLog(`\n[${index + 1}] 键: ${key}`)
              this.addLog(`    值: ${value}`)
              this.addLog(`    类型: ${typeof value}`)

              // 格式化显示
              let displayValue = value
              if (key === 'base_price') displayValue = `¥${value}元`
              else if (key === 'per_km_price') displayValue = `¥${value}元/公里`
              else if (key === 'weather_rate') displayValue = `${value}倍`
              else if (key === 'platform_rate') displayValue = `${value}%`

              this.addLog(`    格式化: ${displayValue}`)
            })

            this.addLog('\n📋 预期轮播效果:')
            this.addLog('配置轮播会垂直显示上述配置项')
            this.addLog('每个配置项会显示中文名称和格式化后的值')
          } else {
            this.addLog(`⚠️ 数据格式异常，应为对象`)
            this.addLog(`实际数据: ${JSON.stringify(res.data)}`)
          }
        } else {
          this.addLog('⚠️ 响应中没有data字段')
        }
      } catch (error) {
        this.addLog('❌ 请求失败')
        this.addLog(`错误信息: ${error.message}`)
        this.addLog(`错误详情: ${JSON.stringify(error)}`)
      }

      this.addLog('\n' + '='.repeat(50) + '\n')
    },

    // 一键测试全部API
    async testAllAPIs() {
      this.clearLogs()
      this.addLog('🚀 开始一键测试全部API\n')

      await this.testBannerAPI()
      await this.testNoticeAPI()
      await this.testConfigAPI()

      this.addLog('\n✅ 全部API测试完成！')
    },

    // 清空日志
    clearLogs() {
      this.logs = ''
      this.addLog('日志已清空\n')
    }
  },

  onLoad() {
    this.addLog('🔧 API调试工具已启动')
    this.addLog(`后端地址: ${this.baseUrl}`)
    this.addLog('点击上方按钮开始测试API\n')
  }
}
</script>

<style scoped>
.debug-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 测试按钮 */
.test-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.test-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 12rpx;
  background: #07c160;
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  border: none;
}

.test-btn::after {
  border: none;
}

.test-btn.danger {
  background: #ff4d4f;
}

/* 结果显示 */
.result-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.result-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.log-container {
  height: 600rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
}

.log-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

/* API信息 */
.info-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.info-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 150rpx;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 24rpx;
  color: #333;
  word-break: break-all;
}
</style>
