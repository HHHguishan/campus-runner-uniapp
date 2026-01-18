/**
 * 后端API配置
 */

// 后端API基础地址 (切换为局域网 IP 直连)
export const BASE_URL = 'http://192.168.1.6:9090'

// API版本
export const API_VERSION = '/api'

// 完整的API基础路径
export const API_BASE_URL = BASE_URL + API_VERSION

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 30000

// Token存储的key
export const TOKEN_KEY = 'Authorization'

// 用户信息存储的key
export const USER_INFO_KEY = 'userInfo'

// 百度地图微信小程序AK
export const BAIDU_MAP_AK = 'qL6Hd380Yo4rEmR1rNZvwkl63e7Jo1lC'
