const express = require('express');
const router = express.Router();

// 컨트롤러 선언
const {
  getBookList,
  getBookByCategory,
  getAllCategories,
} = require('../controllers/getBookList');
const {
  getBookDetail,
  getBookReviews,
} = require('../controllers/BookDetailController');
const { getSearchBooks } = require('../controllers/getSearchBooks');
const { getNewBook } = require('../controllers/getNewBook');
const { getBestBook } = require('../controllers/getBestBook');

const { verifyToken } = require('../controllers/authController');
const {
  getMemberInfo,
  getMemberNicknames,
} = require('../controllers/memberInfoController'); //회원정보 get

const {
  getCommunityPosts,
  getCommunityPostById,
  getCommentsByPostId,
  getHotTopics,
  getTopUsers,
} = require('../controllers/communityController');
const { getUserStats } = require('../controllers/communityController');
const {
  getThreads,
  checkThreadExistence,
  searchThreads,
} = require('../controllers/threadController');

const getTerms = require('../controllers/authController').getTerms;

// get Url
router.get('/book-list', getBookList);
router.get('/book-list/:bookId', getBookDetail);
router.get('/book-list/:bookId/reviews', getBookReviews);
router.get('/community', getCommunityPosts);
router.get('/community/:postId', getCommunityPostById);
router.get('/community/:postId/comments', getCommentsByPostId);
router.get('/user/stats', getUserStats);
router.get('/hot-topics', getHotTopics);
router.get('/top-users', getTopUsers);
router.get('/search-books', getSearchBooks);
router.get('/search-category', getBookByCategory);
router.get('/all-categories', getAllCategories);
router.get('/new-book', getNewBook);
router.get('/best-book', getBestBook);
router.get('/threads', getThreads);
router.get('/threads/exists/:book_id', checkThreadExistence);
router.get('/search-threads', searchThreads);
router.get('/terms', getTerms); // 약관 조회 라우트
router.get('/members/:member_num', getMemberInfo); // id로 회원 정보 조회
router.get('/members/:member_num/nicknames', getMemberNicknames); // id로 회원 정보 조회

// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router;
