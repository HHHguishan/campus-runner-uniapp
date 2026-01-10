/**
 * 管理员订单列表接口调试测试
 *
 * 用于验证前端传递的参数格式是否正确
 */

import { getAdminOrderList } from '@/api/admin.js'

// 测试用例
const testCases = [
  {
    name: '测试1：查询全部订单',
    params: {
      status: null,          // ✅ 正确：null 表示全部
      orderType: '',
      abnormalType: '',
      startTime: '',
      endTime: '',
      keyword: '',
      current: 1,
      size: 10
    }
  },
  {
    name: '测试2：查询单个状态（待接单）',
    params: {
      status: 1,             // ✅ 正确：单个数字
      orderType: '',
      abnormalType: '',
      startTime: '',
      endTime: '',
      keyword: '',
      current: 1,
      size: 10
    }
  },
  {
    name: '测试3：查询配送中订单',
    params: {
      status: 2,             // ✅ 正确：单个数字
      orderType: '',
      abnormalType: '',
      startTime: '',
      endTime: '',
      keyword: '',
      current: 1,
      size: 10
    }
  },
  {
    name: '测试4：错误的参数格式（不应该出现）',
    params: {
      status: "1,2",         // ❌ 错误：字符串
      orderType: '',
      abnormalType: '',
      startTime: '',
      endTime: '',
      keyword: '',
      current: 1,
      size: 10
    }
  }
]

/**
 * 执行测试
 */
export async function runTests() {
  console.log('========== 开始测试管理员订单列表接口 ==========\n')

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]

    console.log(`\n${testCase.name}`)
    console.log('请求参数：', JSON.stringify(testCase.params, null, 2))

    // 检查参数类型
    console.log('status 参数类型：', typeof testCase.params.status)
    console.log('status 参数值：', testCase.params.status)

    // 只测试前3个正确的用例
    if (i < 3) {
      try {
        const res = await getAdminOrderList(testCase.params)
        console.log('✅ 请求成功，响应码：', res.code)
        if (res.code === 200) {
          console.log('✅ 返回数据：', res.data)
        } else {
          console.log('❌ 请求失败：', res.message)
        }
      } catch (error) {
        console.error('❌ 请求异常：', error)
      }
    } else {
      console.log('⚠️  跳过错误的测试用例（仅供对比）')
    }

    console.log('----------------------------------------')
  }

  console.log('\n========== 测试完成 ==========')
}

/**
 * 在小程序中运行测试
 * 1. 打开浏览器控制台
 * 2. 在控制台输入：testAdminOrderList()
 * 3. 查看测试结果
 */
export async function testAdminOrderList() {
  console.log('开始测试管理员订单列表接口...')

  // 测试用例1：查询全部订单
  console.log('\n【测试1】查询全部订单')
  try {
    const res = await getAdminOrderList({
      status: null,
      current: 1,
      size: 10
    })
    console.log('✅ 成功，响应：', res)
  } catch (error) {
    console.error('❌ 失败，错误：', error)
  }

  // 测试用例2：查询单个状态
  console.log('\n【测试2】查询单个状态（待接单）')
  try {
    const res = await getAdminOrderList({
      status: 1,
      current: 1,
      size: 10
    })
    console.log('✅ 成功，响应：', res)
  } catch (error) {
    console.error('❌ 失败，错误：', error)
  }

  console.log('\n测试完成！')
}

// 将测试函数挂载到全局对象上，方便在控制台调用
if (typeof window !== 'undefined') {
  window.testAdminOrderList = testAdminOrderList
  window.runTests = runTests
}
