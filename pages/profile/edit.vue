<template>
  <view class="profile-edit-container">
    <!-- 头像上传区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @tap="chooseAvatar">
        <image
          class="avatar-image"
          :src="formData.avatar || defaultAvatar"
          mode="aspectFill"
        ></image>
        <view class="avatar-mask">
          <text class="camera-icon">📷</text>
          <text class="change-text">更换头像</text>
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          class="form-input"
          v-model="formData.nickname"
          placeholder="请输入昵称（2-20位）"
          maxlength="20"
        />
      </view>

      <!-- 性别 -->
      <view class="form-item">
        <text class="form-label">性别</text>
        <picker
          mode="selector"
          :range="genderOptions"
          :range-key="'label'"
          :value="genderIndex"
          @change="onGenderChange"
        >
          <view class="picker-value">
            {{ formData.gender !== null ? genderOptions[genderIndex].label : '请选择' }}
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 邮箱 -->
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          class="form-input"
          v-model="formData.email"
          placeholder="请输入邮箱（可选）"
        />
      </view>

      <!-- 手机号（只读） -->
      <view class="form-item disabled">
        <text class="form-label">手机号</text>
        <view class="form-value">
          <text>{{ userInfo.mobile || '未绑定' }}</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ disabled: !isFormValid }"
        :disabled="!isFormValid"
        @tap="saveProfile"
      >
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { fetchUserInfo, updateUserInfo } from '@/api/user.js'
import { uploadAvatar } from '@/api/upload.js'
import { getUserInfo, setUserInfo } from '@/utils/token.js'

export default {
  data() {
    return {
      userInfo: {},
      defaultAvatar: 'https://via.placeholder.com/120',
      formData: {
        nickname: '',
        avatar: '',
        gender: null,
        email: ''
      },
      genderOptions: [
        { label: '保密', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 }
      ],
      genderIndex: 0,
      uploading: false
    }
  },

  computed: {
    // 表单验证
    isFormValid() {
      const { nickname } = this.formData
      return nickname && nickname.length >= 2 && nickname.length <= 20
    }
  },

  onLoad() {
    this.loadUserInfo()
  },

  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const result = await fetchUserInfo()
        if (result.data) {
          this.userInfo = result.data

          // 填充表单数据
          this.formData = {
            nickname: result.data.nickname || '',
            avatar: result.data.avatar || '',
            gender: result.data.gender,
            email: result.data.email || ''
          }

          // 设置性别选择器的索引
          if (result.data.gender !== null && result.data.gender !== undefined) {
            this.genderIndex = this.genderOptions.findIndex(
              item => item.value === result.data.gender
            )
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)

        // 如果API失败，使用本地缓存
        const localUserInfo = getUserInfo()
        if (localUserInfo) {
          this.userInfo = localUserInfo
          this.formData = {
            nickname: localUserInfo.nickname || '',
            avatar: localUserInfo.avatar || '',
            gender: localUserInfo.gender,
            email: localUserInfo.email || ''
          }
        }
      }
    },

    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'], // 压缩图
        sourceType: ['album', 'camera'], // 从相册选择或拍照
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadAvatar(tempFilePath)
        }
      })
    },

    // 上传头像
    async uploadAvatar(filePath) {
      if (this.uploading) {
        uni.showToast({
          title: '上传中，请稍候',
          icon: 'none'
        })
        return
      }

      this.uploading = true

      uni.showLoading({
        title: '上传中...'
      })

      try {
        const result = await uploadAvatar(filePath)

        if (result.code === 200 && result.data) {
          this.formData.avatar = result.data

          uni.showToast({
            title: '上传成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
      } finally {
        this.uploading = false
        uni.hideLoading()
      }
    },

    // 性别选择
    onGenderChange(e) {
      const index = e.detail.value
      this.genderIndex = index
      this.formData.gender = this.genderOptions[index].value
    },

    // 保存个人资料
    async saveProfile() {
      if (!this.isFormValid) {
        return
      }

      // 验证邮箱格式（如果填写了）
      if (this.formData.email) {
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailReg.test(this.formData.email)) {
          uni.showToast({
            title: '邮箱格式不正确',
            icon: 'none'
          })
          return
        }
      }

      uni.showLoading({
        title: '保存中...'
      })

      try {
        // 只提交有值的字段
        const updateData = {}
        if (this.formData.nickname) updateData.nickname = this.formData.nickname
        if (this.formData.avatar) updateData.avatar = this.formData.avatar
        if (this.formData.gender !== null && this.formData.gender !== undefined) {
          updateData.gender = this.formData.gender
        }
        if (this.formData.email) updateData.email = this.formData.email

        const result = await updateUserInfo(updateData)

        if (result.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })

          // 重新获取用户信息
          await this.loadUserInfo()

          // 更新本地存储
          const updatedUserInfo = getUserInfo()
          if (updatedUserInfo) {
            setUserInfo(updatedUserInfo)
          }

          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.profile-edit-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 头像区域 */
.avatar-section {
  background: #fff;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 100rpx;
  border: 4rpx solid #f5f5f5;
}

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 100rpx 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 32rpx;
  line-height: 1;
}

.change-text {
  font-size: 20rpx;
  color: #fff;
  margin-top: 4rpx;
}

.avatar-tip {
  font-size: 26rpx;
  color: #999;
}

/* 表单区域 */
.form-section {
  background: #fff;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 150rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.form-value {
  flex: 1;
  font-size: 28rpx;
  color: #666;
}

.form-item.disabled {
  background: #f8f8f8;
}

.form-item.disabled .form-label,
.form-item.disabled .form-value {
  color: #999;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  font-size: 40rpx;
  color: #999;
  font-weight: bold;
}

/* 保存按钮 */
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #07c160;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.submit-btn::after {
  border: none;
}

.submit-btn.disabled {
  background: #ccc;
  color: #999;
}
</style>
