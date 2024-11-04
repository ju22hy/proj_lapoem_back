const express = require('express');
const router = express.Router();
const { joinUser, loginUser, logoutUser } = require('../controllers/authController'); // authController를 사용
const communityController = require('../controllers/communityController');

// 회원가입 라우트 설정
router.post('/join', joinUser);
// 로그인 라우트 설정
router.post('/login', loginUser);
// 로그아웃 라우트 설정
router.post('/logout', logoutUser); // 추가된 부분
// 커뮤니티 생성 라우트 설정
router.post('/community', communityController.createCommunityPost);

module.exports = router;
