const router = require('express').Router();
const { getBookList } = require('../controllers/getBookList');

router.get('/book-list', getBookList);

module.exports = router; // router 모듈 내보내기
