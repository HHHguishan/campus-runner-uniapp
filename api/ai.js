import request from '@/utils/request'
import { API_BASE_URL } from '@/utils/config'
import { getToken } from '@/utils/token'

/**
 * 启动 AI 流式对话 (由于是 SSE，uniapp 建议使用插件或定制封装)
 * 这里给出一个基于 uni.request 模拟流式的方案
 */
export const getAiChatStream = (message, sessionId = 'default', onMessage, onComplete, onError) => {
    const token = getToken()
    const baseUrl = API_BASE_URL

    // uniapp 在小程序端对 SSE 支持有限，建议 H5 使用 EventSource，小程序使用 request 的 chunk
    // 为了跨端，这里演示逻辑：
    const requestTask = uni.request({
        url: `${baseUrl}/ai/chat/stream?message=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(sessionId)}`,
        method: 'GET',
        header: {
            'Authorization': token ? `Bearer ${token}` : ''
        },
        enableChunked: true, // 开启分块接收
        success: (res) => {
            onComplete && onComplete()
        },
        fail: (err) => {
            onError && onError(err)
        }
    })

    // 监听分块响应
    requestTask.onChunkReceived((res) => {
        // res.data 是 ArrayBuffer
        const unit8Array = new Uint8Array(res.data)
        const text = new TextDecoder('utf-8').decode(unit8Array)
        onMessage && onMessage(text)
    })

    return requestTask
}

/**
 * 获取聊天历史记录
 */
export const getAiChatHistory = (sessionId = 'default') => {
    return request({
        url: `/ai/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
        method: 'GET'
    })
}

/**
 * 清空聊天历史
 */
export const getAiChatSessions = () => {
    return request({
        url: '/ai/chat/sessions',
        method: 'GET'
    })
}

export const clearAiHistory = (sessionId = 'default') => {
    return request({
        url: `/ai/chat/history?sessionId=${encodeURIComponent(sessionId)}`,
        method: 'DELETE'
    })
}
