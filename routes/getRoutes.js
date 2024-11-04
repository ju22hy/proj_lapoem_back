const express = require("express");
const router = express.Router();
const {
  getBookList,
  getBookByCategory,
  getAllCategories,
} = require("../controllers/getBookList");
const { getSearchBooks } = require("../controllers/getSearchBooks");
const { verifyToken } = require("../controllers/authController");
const communityController = require("../controllers/communityController");
const { getNewBook } = require("../controllers/getNewBook");

router.get("/book-list", getBookList);
router.get("/community", communityController.getCommunityPosts);
router.get("/search-books", getSearchBooks);
router.get("/search-category", getBookByCategory);
router.get("/all-categories", getAllCategories);
router.get("/new-book", getNewBook);

// 토큰 검증 라우트
router.get("/verify", verifyToken);

module.exports = router;
