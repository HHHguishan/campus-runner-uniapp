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
      <!-- 地址名称 -->
      <view class="form-item">
        <view class="form-label required">地址名称</view>
        <input
          class="form-input"
          v-model="formData.addressName"
          placeholder="请输入地址名称，如：北门菜鸟、学校宿舍"
          maxlength="20"
        />
        <view class="map-picker-btn" @click="chooseFromMap">
          <text class="iconfont">📍</text>
          <text>地图选点</text>
        </view>
      </view>

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

      <!-- 详细门牌号 -->
      <view class="form-item">
        <view class="form-label required">详细门牌号</view>
        <textarea
          class="form-textarea"
          v-model="formData.detail"
          placeholder="请输入详细门牌号，如：5号楼302室"
          maxlength="200"
          :show-confirm-bar="false"
        />
        <view class="coordinate-status" :class="{ 'error': isBeijingCoord, 'valid': hasCoords && !isBeijingCoord }">
          <text class="status-icon">{{ isBeijingCoord ? '⚠️' : (hasCoords ? '✅' : '❓') }}</text>
          <text class="status-text">{{ coordStatusText }}</text>
        </view>
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

    <!-- 底部保存按钮 -->
    <view class="bottom-save-bar">
      <button class="btn-save" @click="saveAddress">保存地址</button>
    </view>
  </view>
</template>

<script>
import { getAddressDetail, saveAddress } from '@/api/address.js'

export default {
  data() {
    return {
      isEdit: false, // 是否是编辑模式
      addressId: null, // 地址ID（编辑模式）
      regionText: '', // 地区文本（仅显示用）
      formData: {
        contactName: '',
        contactPhone: '',
        addressName: '', // 地址名称，如：北门菜鸟、学校宿舍
        detail: '', // 详细门牌号
        isDefault: 0,
        lat: null, // 纬度
        lng: null // 经度
      }
    }
  },

  computed: {
    hasCoords() {
      return this.formData.lat && this.formData.lng
    },
    isBeijingCoord() {
      if (!this.hasCoords) return false
      // 北京中心约在 39.9, 116.4
      return Math.abs(this.formData.lat - 39.9) < 0.1 && Math.abs(this.formData.lng - 116.4) < 0.1
    },
    coordStatusText() {
      if (!this.hasCoords) return '未设置定位坐标，请点击地图选点'
      if (this.isBeijingCoord && !this.formData.detail.includes('北京')) {
        return '检测到定位可能在异常区域（北京），请重选'
      }
      return `位置已设定 (${this.formData.lat.toFixed(3)}, ${this.formData.lng.toFixed(3)})`
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
            addressName: data.addressName || '',
            detail: data.detail || '',
            isDefault: data.isDefault || 0,
            lat: data.lat,
            lng: data.lng
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
     * 默认地址开关改变
     */
    onDefaultChange(e) {
      this.formData.isDefault = e.detail.value ? 1 : 0
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.addressName.trim()) {
        uni.showToast({
          title: '请输入地址名称',
          icon: 'none'
        })
        return false
      }

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

      if (!this.formData.detail.trim()) {
        uni.showToast({
          title: '请输入详细门牌号',
          icon: 'none'
        })
        return false
      }

      // 增加防呆检查：防止模拟器默认定位在背景（39.9/116.4）
      if (this.formData.lat && Math.abs(this.formData.lat - 39.9) < 0.1 && !this.formData.detail.includes('北京')) {
        uni.showToast({
          title: '检测到定位在异常区域（北京），请在地图选点重新选择',
          icon: 'none',
          duration: 3000
        })
        return false
      }

      return true
    },

    /**
     * 从地图选择位置
     */
    async chooseFromMap() {
      // 获取当前位置作为地图中心，避免默认北京
      let centerLat = 22.817
      let centerLng = 108.366
      try {
        const loc = await new Promise((resolve) => {
          uni.getLocation({ type: 'gcj02', success: resolve, fail: () => resolve(null) })
        })
        if (loc) {
          centerLat = loc.latitude
          centerLng = loc.longitude
        }
      } catch (e) {}

      uni.chooseLocation({
        latitude: centerLat,
        longitude: centerLng,
        success: (res) => {
          console.log('📍 [EDIT] 地图选点结果 Raw:', JSON.stringify(res))
          // 回填数据
          this.formData.addressName = res.name || ''
          this.formData.detail = res.address || ''
          this.formData.lat = res.latitude
          this.formData.lng = res.longitude
          
          uni.showToast({
            title: '位置已同步',
            icon: 'none'
          })
        },
        fail: (err) => {
          console.error('❌ 地图选点失败:', err)
          if (err.errMsg.indexOf('auth deny') > -1) {
            uni.showModal({
              title: '提示',
              content: '请在设置中开启位置权限',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting()
                }
              }
            })
          }
        }
      })
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

.map-picker-btn {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: #f0f4ff;
  color: #667eea;
  border-radius: 6px;
  font-size: 14px;
}

.map-picker-btn .iconfont {
  margin-right: 6px;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  padding: 5px 0;
}

.coordinate-status {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: all 0.3s;

  &.error {
    background-color: #fff1f0;
    border: 1px solid #ffccc7;
    .status-text { color: #ff4d4f; }
  }

  &.valid {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    .status-text { color: #52c41a; }
  }
}

.status-icon {
  margin-right: 8px;
  font-size: 14px;
}

.status-text {
  font-size: 12px;
  color: #8c8c8c;
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

/* 底部保存按钮 */
.bottom-save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.btn-save {
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  border: none;
  text-align: center;
}

.btn-save::after {
  border: none;
}
</style>
