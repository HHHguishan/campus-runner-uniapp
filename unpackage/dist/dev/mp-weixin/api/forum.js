"use strict";
const utils_request = require("../utils/request.js");
const createPost = (data) => {
  return utils_request.post("/forum/post", data);
};
const getPostList = (params) => {
  return utils_request.get("/forum/post/list", params);
};
const getPostDetail = (id) => {
  return utils_request.get(`/forum/post/${id}`);
};
const deletePost = (id) => {
  return utils_request.del(`/forum/post/${id}`);
};
const likePost = (id) => {
  return utils_request.post(`/forum/post/${id}/like`);
};
const addComment = (data) => {
  return utils_request.post("/forum/comment", data);
};
const getCommentList = (params) => {
  return utils_request.get("/forum/comment/list", params);
};
const deleteComment = (id) => {
  return utils_request.del(`/forum/comment/${id}`);
};
exports.addComment = addComment;
exports.createPost = createPost;
exports.deleteComment = deleteComment;
exports.deletePost = deletePost;
exports.getCommentList = getCommentList;
exports.getPostDetail = getPostDetail;
exports.getPostList = getPostList;
exports.likePost = likePost;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/forum.js.map
