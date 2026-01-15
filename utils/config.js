/**
 * 后端API配置
 */

// 后端API基础地址 (切换为 cpolar 地址以支持手机 4G/5G 访问)
export const BASE_URL = 'https://213df68.r18.cpolar.top'

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
