const router = require('express').Router();
const { getBookList } = require('../controllers/getBookList');
const { getSearchBooks } = require('../controllers/getSearchBooks');
const { verifyToken } = require('../controllers/authController');

router.get('/book-list', getBookList);
router.get('/search-books', getSearchBooks);

// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router; // router 모듈 내보내기
