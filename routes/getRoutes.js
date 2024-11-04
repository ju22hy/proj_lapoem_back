const express = require('express');
const router = express.Router();
const {
  getBookList,
  getBookByCategory,
  getAllCategories,
} = require('../controllers/getBookList');
const { getSearchBooks } = require('../controllers/getSearchBooks');
const { verifyToken } = require('../controllers/authController');
const { getNewBook } = require('../controllers/getNewBook');
const {
  getCommunityPosts,
  getCommunityPostById,
} = require('../controllers/communityController');

router.get('/book-list', getBookList);
router.get('/community', getCommunityPosts);
router.get('/community/:postId', getCommunityPostById);
router.get('/search-books', getSearchBooks);
router.get('/search-category', getBookByCategory);
router.get('/all-categories', getAllCategories);
router.get('/new-book', getNewBook);

// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router;
