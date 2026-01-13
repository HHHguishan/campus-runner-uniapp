import { get, post, del } from '../utils/request.js'

/**
 * 校园圈子（论坛）相关接口
 */

// 1. 发布帖子
export const createPost = (data) => {
  return post('/forum/post', data)
}

// 2. 帖子列表（分页+筛选）
// params: { page, size, tag, keyword, orderBy }
export const getPostList = (params) => {
  return get('/forum/post/list', params)
}

// 3. 帖子详情
export const getPostDetail = (id) => {
  return get(`/forum/post/${id}`)
}

// 4. 删除帖子
export const deletePost = (id) => {
  return del(`/forum/post/${id}`)
}

// 5. 点赞/取消点赞
export const likePost = (id) => {
  return post(`/forum/post/${id}/like`)
}

// 6. 我的帖子
export const getMyPosts = (params) => {
  return get('/forum/post/my', params)
}

// 7. 发表评论
export const addComment = (data) => {
  return post('/forum/comment', data)
}

// 8. 评论列表
// params: { postId, page, size, orderBy }
export const getCommentList = (params) => {
  return get('/forum/comment/list', params)
}

// 9. 删除评论
export const deleteComment = (id) => {
  return del(`/forum/comment/${id}`)
}
