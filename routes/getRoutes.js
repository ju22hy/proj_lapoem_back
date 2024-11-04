const router = require('express').Router();
const {
  getBookList,
  getBookByCategory,
  getAllCategories,
} = require('../controllers/getBookList');
const { getSearchBooks } = require('../controllers/getSearchBooks');
const { verifyToken } = require('../controllers/authController');
const communityController = require('../controllers/communityController');

router.get('/book-list', getBookList);
router.get('/community', communityController.getCommunityPosts);
router.get('/search-books', getSearchBooks);
router.get('/search-category', getBookByCategory);
router.get('/all-categories', getAllCategories);

// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router; // router 모듈 내보내기
