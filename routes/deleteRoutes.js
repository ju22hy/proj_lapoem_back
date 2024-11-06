const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.delete('/community/:postId', communityController.deleteCommunityPost);
router.delete(
  '/community/comment/:commentId',
  communityController.deleteComment
);

module.exports = router;
