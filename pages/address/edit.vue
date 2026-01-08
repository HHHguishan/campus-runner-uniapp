<template>
  <view class="address-edit-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">{{ isEdit ? '编辑地址' : '添加地址' }}</view>
      <view class="nav-save" @click="saveAddress">
        <text>保存</text>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 联系人 -->
      <view class="form-item">
        <view class="form-label required">联系人</view>
        <input
          class="form-input"
          v-model="formData.contactName"
          placeholder="请输入联系人姓名"
          maxlength="20"
        />
      </view>

      <!-- 联系电话 -->
      <view class="form-item">
        <view class="form-label required">联系电话</view>
        <input
          class="form-input"
          v-model="formData.contactPhone"
          placeholder="请输入联系电话"
          type="number"
          maxlength="11"
        />
      </view>

      <!-- 省市区选择 -->
      <view class="form-item">
        <view class="form-label required">所在地区</view>
        <view class="form-picker" @click="showRegionPicker = true">
          <text class="picker-text" v-if="regionText">{{ regionText }}</text>
          <text class="picker-placeholder" v-else>请选择省/市/区</text>
          <text class="picker-arrow">›</text>
        </view>
      </view>

      <!-- 详细地址 -->
      <view class="form-item">
        <view class="form-label required">详细地址</view>
        <textarea
          class="form-textarea"
          v-model="formData.detailAddress"
          placeholder="请输入详细地址，如街道、楼栋、门牌号等"
          maxlength="200"
          :show-confirm-bar="false"
        />
      </view>

      <!-- 设为默认地址 -->
      <view class="form-item form-switch">
        <view class="switch-label">
          <text class="switch-icon">⭐</text>
          <text class="switch-text">设为默认地址</text>
        </view>
        <switch
          :checked="formData.isDefault === 1"
          @change="onDefaultChange"
          color="#667eea"
        />
      </view>
    </view>

    <!-- 省市区选择器 -->
    <picker
      mode="region"
      :value="regionValue"
      @change="onRegionChange"
      v-if="showRegionPicker"
    >
      <view></view>
    </picker>
  </view>
</template>

<script>
import { getAddressDetail, saveAddress } from '@/api/address.js'

export default {
  data() {
    return {
      isEdit: false, // 是否是编辑模式
      addressId: null, // 地址ID（编辑模式）
      showRegionPicker: false,
      regionValue: [], // 省市区数组
      regionText: '', // 省市区文本
      formData: {
        contactName: '',
        contactPhone: '',
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        isDefault: 0,
        latitude: null,
        longitude: null
      }
    }
  },

  onLoad(options) {
    // 判断是否是编辑模式
    if (options.id) {
      this.isEdit = true
      this.addressId = options.id
      this.loadAddressDetail()
    }
  },

  methods: {
    /**
     * 加载地址详情（编辑模式）
     */
    async loadAddressDetail() {
      try {
        uni.showLoading({ title: '加载中...' })

        const res = await getAddressDetail(this.addressId)

        uni.hideLoading()

        if (res.code === 200 && res.data) {
          const data = res.data
          this.formData = {
            contactName: data.contactName || '',
            contactPhone: data.contactPhone || '',
            province: data.province || '',
            city: data.city || '',
            district: data.district || '',
            detailAddress: data.detailAddress || '',
            isDefault: data.isDefault || 0,
            latitude: data.latitude,
            longitude: data.longitude
          }

          // 设置省市区
          if (data.province && data.city && data.district) {
            this.regionValue = [data.province, data.city, data.district]
            this.regionText = `${data.province} ${data.city} ${data.district}`
          }

          console.log('✅ 地址详情加载成功:', this.formData)
        } else {
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 加载地址详情失败:', error)
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        })
      }
    },

    /**
     * 省市区选择改变
     */
    onRegionChange(e) {
      const value = e.detail.value
      this.regionValue = value
      this.regionText = value.join(' ')
      this.formData.province = value[0]
      this.formData.city = value[1]
      this.formData.district = value[2]
      this.showRegionPicker = false
    },

    /**
     * 默认地址开关改变
     */
    onDefaultChange(e) {
      this.formData.isDefault = e.detail.value ? 1 : 0
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.contactName.trim()) {
        uni.showToast({
          title: '请输入联系人姓名',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.contactPhone.trim()) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return false
      }

      // 验证手机号格式
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.formData.contactPhone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.province || !this.formData.city || !this.formData.district) {
        uni.showToast({
          title: '请选择所在地区',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.detailAddress.trim()) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        })
        return false
      }

      return true
    },

    /**
     * 保存地址
     */
    async saveAddress() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }

      try {
        uni.showLoading({ title: '保存中...' })

        // 构造请求数据
        const requestData = {
          ...this.formData
        }

        // 编辑模式需要传ID
        if (this.isEdit && this.addressId) {
          requestData.id = this.addressId
        }

        const res = await saveAddress(requestData)

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({
            title: this.isEdit ? '修改成功' : '添加成功',
            icon: 'success',
            duration: 1500
          })

          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 保存地址失败:', error)
        uni.showToast({
          title: '保存失败，请稍后重试',
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
.address-edit-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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

.nav-back,
.nav-save {
  width: 50px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
}

.nav-back {
  font-size: 24px;
  color: #333;
}

.nav-save {
  color: #667eea;
  font-weight: 600;
  justify-content: flex-end;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

/* 表单内容 */
.form-content {
  margin-top: 54px;
  padding: 10px 15px;
}

.form-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 500;
}

.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input {
  width: 100%;
  height: 40px;
  font-size: 15px;
  color: #333;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  padding: 5px 0;
}

/* 选择器 */
.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.picker-text {
  font-size: 15px;
  color: #333;
}

.picker-placeholder {
  font-size: 15px;
  color: #999;
}

.picker-arrow {
  font-size: 20px;
  color: #999;
}

/* 开关 */
.form-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-label {
  display: flex;
  align-items: center;
}

.switch-icon {
  font-size: 18px;
  margin-right: 8px;
}

.switch-text {
  font-size: 15px;
  color: #333;
}
</style>
