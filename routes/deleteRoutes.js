const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const {
  deleteBookReview,
  verifyToken,
} = require('../controllers/postBookReview');

router.delete('/community/:postId', communityController.deleteCommunityPost);
router.delete(
  '/community/comment/:commentId',
  communityController.deleteComment
);

router.delete(
  '/book-list/:bookId/reviews/:reviewId',
  verifyToken,
  deleteBookReview
);

module.exports = router;
