<template>
  <view class="order-create-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">发布订单</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 表单内容 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 服务类型 -->
      <view class="form-section">
        <view class="section-title required">服务类型</view>
        <view class="service-type-grid">
          <view
            class="service-type-item"
            :class="{ active: formData.type === item.value }"
            v-for="item in serviceTypes"
            :key="item.value"
            @click="selectServiceType(item.value)"
          >
            <text class="service-icon">{{ item.icon }}</text>
            <text class="service-name">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 物品信息 -->
      <view class="form-section">
        <view class="section-title required">物品信息</view>
        <view class="form-input-wrapper">
          <textarea
            class="form-textarea"
            v-model="formData.goodsDesc"
            placeholder="请描述物品信息，如：帮买一杯奶茶，少冰少糖"
            maxlength="200"
            :show-confirm-bar="false"
          />
          <view class="char-count">{{ formData.goodsDesc.length }}/200</view>
        </view>
      </view>

      <!-- 取件地址 -->
      <view class="form-section">
        <view class="section-title required">取件地址</view>
        <view class="address-selector" @click="selectPickupAddress">
          <view class="address-content" v-if="formData.pickupAddress">
            <view class="address-header">
              <text class="contact-name">{{ formData.pickupAddress.addressName }}</text>
            </view>
            <view class="address-detail">
              {{ formData.pickupAddress.detail }}
            </view>
          </view>
          <view class="address-placeholder" v-else>
            <text class="placeholder-text">请选择取件地址</text>
            <text class="placeholder-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 送达地址 -->
      <view class="form-section">
        <view class="section-title required">送达地址</view>
        <view class="address-selector" @click="selectDeliveryAddress">
          <view class="address-content" v-if="formData.deliveryAddress">
            <view class="address-header">
              <text class="contact-name">{{ formData.deliveryAddress.addressName }}</text>
            </view>
            <view class="address-detail">
              {{ formData.deliveryAddress.detail }}
            </view>
          </view>
          <view class="address-placeholder" v-else>
            <text class="placeholder-text">请选择送达地址</text>
            <text class="placeholder-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 联系电话 -->
      <view class="form-section">
        <view class="section-title required">联系电话</view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            v-model="formData.contactPhone"
            type="number"
            placeholder="请输入联系电话"
            maxlength="11"
          />
        </view>
      </view>

      <!-- 联系人 -->
      <view class="form-section">
        <view class="section-title required">联系人</view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            v-model="formData.contactName"
            type="text"
            placeholder="请输入联系人姓名"
            maxlength="20"
          />
        </view>
      </view>

      <!-- 标签 -->
      <view class="form-section">
        <view class="section-title">标签（可选）</view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            v-model="formData.tags"
            type="text"
            placeholder="如：加急、易碎、贵重品"
            maxlength="50"
          />
        </view>
      </view>

      <!-- 订单估价 -->
      <view class="form-section price-section">
        <view class="section-title">订单估价</view>
        <view class="price-display">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ estimatedPrice }}</text>
        </view>
        <view class="price-breakdown" v-if="priceBreakdown">
          <text class="breakdown-item">起步价：¥{{ priceBreakdown.basePrice }}</text>
          <text class="breakdown-item" v-if="priceBreakdown.distanceFee">里程费：¥{{ priceBreakdown.distanceFee }}</text>
          <text class="breakdown-item" v-if="priceBreakdown.weatherFee">天气加价：×{{ priceBreakdown.weatherRate }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <text class="bar-label">预估：</text>
        <text class="bar-price">¥{{ estimatedPrice }}</text>
      </view>
      <button class="btn-submit" @click="submitOrder" :disabled="!canSubmit">
        提交订单
      </button>
    </view>
  </view>
</template>

<script>
import { createOrder } from '@/api/order.js'
import { getConfigs } from '@/api/config.js'
import { getUserInfo } from '@/api/user.js'

export default {
  data() {
    return {
      // 服务类型
      serviceTypes: [
        { label: '帮我买', value: 1, icon: '🛒' },
        { label: '帮我送', value: 2, icon: '📦' },
        { label: '帮我取', value: 3, icon: '🔑' },
        { label: '全能', value: 4, icon: '🌟' }
      ],

      // 表单数据
      formData: {
        type: 1, // 订单类型：1-帮买, 2-帮送, 3-帮取, 4-全能
        goodsDesc: '',
        pickupAddress: null, // 取件地址对象
        deliveryAddress: null, // 送达地址对象
        contactPhone: '',
        contactName: '',
        tags: '', // 标签（可选）
        weight: null, // 重量（可选）
        distance: null // 距离（可选）
      },

      // 系统配置
      config: {
        basePrice: 3, // 起步价
        perKmPrice: 1, // 每公里价格
        weatherRate: 1, // 天气加价倍率
        platformRate: 0.1 // 平台抽成比例
      },

      // 估价
      estimatedPrice: '0.00',
      priceBreakdown: null
    }
  },

  computed: {
    // 是否可以提交
    canSubmit() {
      return (
        this.formData.serviceType &&
        this.formData.goodsInfo.trim() &&
        this.formData.pickupAddress &&
        this.formData.deliveryAddress &&
        this.formData.deliveryPhone &&
        this.formData.deliveryName
      )
    }
  },

  async onLoad(options) {
    // 如果从首页选择服务类型进入
    if (options.serviceType) {
      this.formData.serviceType = Number(options.serviceType)
    }

    // 加载系统配置
    await this.loadConfig()

    // 加载用户信息
    await this.loadUserInfo()

    // 计算价格
    this.calculatePrice()
  },

  methods: {
    /**
     * 加载系统配置
     */
    async loadConfig() {
      try {
        const res = await getConfigs('base_price,per_km_price,weather_rate,platform_rate')

        if (res.code === 200 && res.data) {
          const data = res.data
          this.config = {
            basePrice: Number(data.base_price || 3),
            perKmPrice: Number(data.per_km_price || 1),
            weatherRate: Number(data.weather_rate || 1),
            platformRate: Number(data.platform_rate || 0.1)
          }
          console.log('✅ 系统配置加载成功:', this.config)
        }
      } catch (error) {
        console.error('❌ 加载配置失败:', error)
        // 使用默认配置
      }
    },

    /**
     * 加载用户信息
     */
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        if (res.code === 200 && res.data) {
          // 自动填充联系电话
          if (res.data.mobile) {
            this.formData.contactPhone = res.data.mobile
          }
          // 自动填充联系人
          if (res.data.nickname) {
            this.formData.contactName = res.data.nickname
          }
        }
      } catch (error) {
        console.error('❌ 加载用户信息失败:', error)
      }
    },

    /**
     * 选择服务类型
     */
    selectServiceType(type) {
      this.formData.type = type
      this.calculatePrice()
    },

    /**
     * 选择取件地址
     */
    selectPickupAddress() {
      uni.navigateTo({
        url: '/pages/address/list?from=order&field=pickup'
      })
    },

    /**
     * 选择送达地址
     */
    selectDeliveryAddress() {
      uni.navigateTo({
        url: '/pages/address/list?from=order&field=delivery'
      })
    },

    /**
     * 计算订单价格
     */
    calculatePrice() {
      // TODO: 实际应该根据距离计算，这里使用简化版本
      // 基础价格 = 起步价 + 固定里程费
      const baseFee = this.config.basePrice
      const distanceFee = 2 * this.config.perKmPrice // 假设固定2公里
      const subtotal = baseFee + distanceFee
      const total = subtotal * this.config.weatherRate

      this.estimatedPrice = total.toFixed(2)

      this.priceBreakdown = {
        basePrice: baseFee.toFixed(2),
        distanceFee: distanceFee.toFixed(2),
        weatherRate: this.config.weatherRate
      }
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.type) {
        uni.showToast({ title: '请选择服务类型', icon: 'none' })
        return false
      }

      if (!this.formData.goodsDesc.trim()) {
        uni.showToast({ title: '请输入物品信息', icon: 'none' })
        return false
      }

      if (!this.formData.pickupAddress) {
        uni.showToast({ title: '请选择取件地址', icon: 'none' })
        return false
      }

      if (!this.formData.deliveryAddress) {
        uni.showToast({ title: '请选择送达地址', icon: 'none' })
        return false
      }

      // 验证手机号
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.formData.contactPhone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return false
      }

      if (!this.formData.contactName.trim()) {
        uni.showToast({ title: '请输入联系人姓名', icon: 'none' })
        return false
      }

      return true
    },

    /**
     * 提交订单
     */
    async submitOrder() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }

      try {
        uni.showLoading({ title: '提交中...' })

        // 构造订单数据 - 完全匹配后端 OrderCreateDTO
        const orderData = {
          type: this.formData.type, // 订单类型：1-帮买, 2-帮送, 3-帮取, 4-全能
          goodsDesc: this.formData.goodsDesc, // 物品描述
          pickupAddr: this.formData.pickupAddress.detail, // 取货地址（详细门牌号）
          pickupLat: this.formData.pickupAddress.lat || 23.123456, // 取货纬度（默认值）
          pickupLng: this.formData.pickupAddress.lng || 113.123456, // 取货经度（默认值）
          deliveryAddr: this.formData.deliveryAddress.detail, // 送货地址（详细门牌号）
          deliveryLat: this.formData.deliveryAddress.lat || 23.123456, // 送货纬度（默认值）
          deliveryLng: this.formData.deliveryAddress.lng || 113.123456, // 送货经度（默认值）
          contactName: this.formData.contactName, // 收货人姓名
          contactPhone: this.formData.contactPhone, // 收货人电话
          weight: this.formData.weight, // 重量（可选）
          tags: this.formData.tags || undefined, // 标签（可选）
          distance: this.formData.distance || undefined // 距离（可选）
        }

        console.log('提交订单数据:', orderData)

        const res = await createOrder(orderData)

        uni.hideLoading()

        if (res.code === 200) {
          const orderInfo = res.data

          uni.showToast({
            title: '订单创建成功',
            icon: 'success',
            duration: 1500
          })

          // 跳转到支付页面
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/order/payment?orderId=${orderInfo.orderId}&totalAmount=${orderInfo.totalAmount}`
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '创建失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 创建订单失败:', error)
        uni.showToast({
          title: '创建失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-create-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 40px;
}

/* 表单内容 */
.form-content {
  flex: 1;
  margin-top: 54px;
  margin-bottom: 70px;
  padding: 15px;
}

.form-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.section-title.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

/* 服务类型 */
.service-type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.service-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 5px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.service-type-item.active {
  background-color: #f0f4ff;
  border-color: #667eea;
}

.service-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.service-name {
  font-size: 12px;
  color: #666;
}

.service-type-item.active .service-name {
  color: #667eea;
  font-weight: 600;
}

/* 输入框 */
.form-input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-size: 15px;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #999;
}

/* 地址选择 */
.address-selector {
  min-height: 80px;
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 15px;
  cursor: pointer;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-right: 12px;
}

.contact-phone {
  font-size: 13px;
  color: #666;
}

.address-detail {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.address-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.placeholder-text {
  font-size: 14px;
  color: #999;
}

.placeholder-arrow {
  font-size: 20px;
  color: #999;
}

/* 价格 */
.price-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.price-section .section-title {
  color: #fff;
}

.price-display {
  display: flex;
  align-items: baseline;
  margin: 15px 0;
}

.price-symbol {
  font-size: 24px;
  color: #fff;
  margin-right: 4px;
}

.price-value {
  font-size: 40px;
  font-weight: bold;
  color: #fff;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breakdown-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bar-left {
  flex: 1;
}

.bar-label {
  font-size: 14px;
  color: #666;
}

.bar-price {
  font-size: 22px;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 8px;
}

.btn-submit {
  width: 120px;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 22px;
  border: none;
}

.btn-submit[disabled] {
  opacity: 0.5;
}
</style>
