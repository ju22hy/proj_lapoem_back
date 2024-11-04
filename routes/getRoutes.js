const router = require('express').Router();
const { getBookList } = require('../controllers/getBookList');
const { verifyToken } = require('../controllers/authController');
const communityController = require('../controllers/communityController');

router.get('/book-list', getBookList);
router.get('/community', communityController.getCommunityPosts);
// 토큰 검증 라우트
router.get('/verify', verifyToken);

module.exports = router; // router 모듈 내보내기
