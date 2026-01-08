<template>
  <view class="address-list-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="iconfont">‹</text>
      </view>
      <view class="nav-title">地址管理</view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 地址列表 -->
    <view class="address-content">
      <scroll-view
        scroll-y
        class="scroll-container"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <!-- 地址卡片列表 -->
        <view class="address-list">
          <view
            class="address-item"
            v-for="item in addressList"
            :key="item.id"
            @click="selectAddress(item)"
          >
            <!-- 默认标签 -->
            <view class="default-badge" v-if="item.isDefault === 1">
              <text>默认</text>
            </view>

            <!-- 地址信息 -->
            <view class="address-info">
              <view class="contact-header">
                <text class="contact-name">{{ item.contactName }}</text>
                <text class="contact-phone">{{ item.contactPhone }}</text>
              </view>
              <view class="address-name">
                <text>{{ item.addressName }}</text>
              </view>
              <view class="address-detail">
                <text>{{ item.detail }}</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-buttons">
              <view class="btn-edit" @click.stop="editAddress(item)">
                <text class="iconfont">✏️</text>
                <text>编辑</text>
              </view>
              <view class="btn-delete" @click.stop="deleteAddress(item.id)">
                <text class="iconfont">🗑️</text>
                <text>删除</text>
              </view>
            </view>

            <!-- 设置默认 -->
            <view class="set-default" @click.stop="setDefault(item.id)" v-if="item.isDefault !== 1">
              <text class="iconfont">⭐</text>
              <text>设为默认</text>
            </view>
          </view>

          <!-- 空状态 -->
          <view class="empty-state" v-if="addressList.length === 0 && !loading">
            <text class="empty-icon">📍</text>
            <text class="empty-text">暂无收货地址</text>
            <text class="empty-tip">点击下方按钮添加地址</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="bottom-bar">
      <button class="btn-add" @click="addAddress">
        <text class="iconfont">+</text>
        <text>添加新地址</text>
      </button>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal-mask" v-if="showDeleteModal" @click="showDeleteModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-title">确认删除</view>
        <view class="modal-message">确定要删除这个地址吗？</view>
        <view class="modal-buttons">
          <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
          <button class="btn-confirm" @click="confirmDelete">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAddressList, saveAddress, deleteAddress } from '@/api/address.js'

export default {
  data() {
    return {
      addressList: [],
      loading: false,
      refreshing: false,
      showDeleteModal: false,
      deleteId: null,
      fromOrder: false, // 是否来自订单页面
      addressField: '' // 地址字段：pickup-取件地址, delivery-送达地址
    }
  },

  onLoad(options) {
    // 判断是否从订单页进入
    if (options.from === 'order') {
      this.fromOrder = true
      this.addressField = options.field || '' // pickup 或 delivery
    }
    this.loadAddressList()
  },

  onShow() {
    // 从编辑页返回时刷新列表
    this.loadAddressList()
  },

  methods: {
    /**
     * 加载地址列表
     */
    async loadAddressList() {
      try {
        this.loading = true
        const res = await getAddressList()

        if (res.code === 200) {
          this.addressList = res.data || []
          console.log('✅ 地址列表加载成功:', this.addressList)
        } else {
          uni.showToast({
            title: res.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('❌ 加载地址列表失败:', error)
        uni.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true
      await this.loadAddressList()
      this.refreshing = false
    },

    /**
     * 加载更多（预留）
     */
    loadMore() {
      // 如果需要分页可以在这里实现
    },

    /**
     * 添加新地址
     */
    addAddress() {
      uni.navigateTo({
        url: '/pages/address/edit'
      })
    },

    /**
     * 编辑地址
     */
    editAddress(item) {
      uni.navigateTo({
        url: `/pages/address/edit?id=${item.id}`
      })
    },

    /**
     * 选择地址（从订单页进入时）
     */
    selectAddress(item) {
      if (this.fromOrder) {
        // 返回订单页并传递地址信息
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]

        if (prevPage) {
          // 根据field字段判断是取件地址还是送达地址
          if (this.addressField === 'pickup') {
            prevPage.$vm.formData.pickupAddress = item
          } else if (this.addressField === 'delivery') {
            prevPage.$vm.formData.deliveryAddress = item
          }

          // 触发订单页重新计算价格
          if (prevPage.$vm.calculatePrice) {
            prevPage.$vm.calculatePrice()
          }

          uni.navigateBack()
        }
      } else {
        // 正常编辑
        this.editAddress(item)
      }
    },

    /**
     * 删除地址
     */
    deleteAddress(id) {
      this.deleteId = id
      this.showDeleteModal = true
    },

    /**
     * 确认删除
     */
    async confirmDelete() {
      if (!this.deleteId) return

      try {
        uni.showLoading({ title: '删除中...' })

        const res = await deleteAddress(this.deleteId)

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          // 刷新列表
          await this.loadAddressList()
        } else {
          uni.showToast({
            title: res.message || '删除失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 删除地址失败:', error)
        uni.showToast({
          title: '删除失败，请稍后重试',
          icon: 'none'
        })
      } finally {
        this.showDeleteModal = false
        this.deleteId = null
      }
    },

    /**
     * 设置默认地址
     */
    async setDefault(id) {
      try {
        uni.showLoading({ title: '设置中...' })

        const address = this.addressList.find(item => item.id === id)
        if (!address) return

        const res = await saveAddress({
          ...address,
          isDefault: 1
        })

        uni.hideLoading()

        if (res.code === 200) {
          uni.showToast({
            title: '设置成功',
            icon: 'success'
          })
          // 刷新列表
          await this.loadAddressList()
        } else {
          uni.showToast({
            title: res.message || '设置失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('❌ 设置默认地址失败:', error)
        uni.showToast({
          title: '设置失败，请稍后重试',
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
.address-list-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
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

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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

/* 内容区域 */
.address-content {
  flex: 1;
  margin-top: 44px;
  margin-bottom: 70px;
  overflow: hidden;
}

.scroll-container {
  height: 100%;
}

/* 地址列表 */
.address-list {
  padding: 10px 15px;
}

.address-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.default-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
}

.address-info {
  margin-bottom: 12px;
}

.contact-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 12px;
}

.contact-phone {
  font-size: 14px;
  color: #666;
}

.address-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  margin: 8px 0;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.btn-edit,
.btn-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
}

.btn-edit {
  background-color: #f0f0f0;
  color: #333;
}

.btn-delete {
  background-color: #fff0f0;
  color: #ff4d4f;
}

.btn-edit .iconfont,
.btn-delete .iconfont {
  margin-right: 4px;
}

/* 设置默认 */
.set-default {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #ff9800;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #fff8e1;
}

.set-default .iconfont {
  margin-right: 4px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 13px;
  color: #ccc;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.btn-add {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 22px;
  border: none;
}

.btn-add .iconfont {
  margin-right: 6px;
  font-size: 18px;
}

/* 删除确认弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 320px;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
}

.modal-message {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-buttons button {
  flex: 1;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  font-size: 15px;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
