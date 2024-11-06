const express = require('express');
const router = express.Router();

// 컨트롤러 선언
const {
  getBookList,
  getBookByCategory,
  getAllCategories,
} = require('../controllers/getBookList');
const getBookDetail = require('../controllers/getBookDetail');
const { getBookReviews } = require('../controllers/getBookReviews');
const { getBookReviewById } = require('../controllers/getReviewById');

const { getSearchBooks } = require('../controllers/getSearchBooks');
const { verifyToken } = require('../controllers/authController');
const { getNewBook } = require('../controllers/getNewBook');
const { getBestBook } = require('../controllers/getBestBook');
const {
  getCommunityPosts,
  getCommunityPostById,
  getCommentsByPostId,
} = require('../controllers/communityController');

// get Url
router.get('/book-list', getBookList);
router.get('/book-list/:bookId', getBookDetail);
router.get('/book-list/:bookId/reviews', getBookReviews);
router.get('/book-list/:bookId/reviews/:reviewId', getBookReviewById);
router.get('/community', getCommunityPosts);
router.get('/community/:postId', getCommunityPostById);
router.get('/community/:postId/comments', getCommentsByPostId);
router.get('/search-books', getSearchBooks);
router.get('/search-category', getBookByCategory);
router.get('/all-categories', getAllCategories);
router.get('/new-book', getNewBook);
router.get('/best-book', getBestBook);

// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router;
