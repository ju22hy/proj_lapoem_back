const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { updateMemberInfo } = require('../controllers/memberInfoController');

router.patch('/community/:postId', communityController.updateCommunityPost);
router.patch('/members/:member_num', updateMemberInfo);

module.exports = router;
