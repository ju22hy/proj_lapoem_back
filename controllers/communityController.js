const pool = require('../database/database'); // database 연결 파일

// 모든 게시글 가져오기
exports.getCommunityPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        community.posts_id, 
        community.post_title, 
        community.post_content, 
        community.post_created_at, 
        community.post_status, 
        community.visibility,
        member.member_nickname,
        member.member_email
      FROM 
        community
      JOIN 
        member ON community.member_num = member.member_num
      WHERE 
        community.post_deleted_at IS NULL
      ORDER BY 
        community.post_created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '게시글을 불러오지 못했습니다.' });
  }
};

// 새 게시글 생성하기
exports.createCommunityPost = async (req, res) => {
  const { member_num, post_title, post_content, post_status, visibility } =
    req.body;

  if (!member_num) {
    return res
      .status(400)
      .json({ message: '작성자 정보(member_num)가 누락되었습니다.' });
  }
  if (!post_title) {
    return res.status(400).json({ message: '제목을 입력해야 합니다.' });
  }
  if (!post_content) {
    return res.status(400).json({ message: '내용을 입력해야 합니다.' });
  }

  // post_status와 visibility 값 검증
  const validStatuses = ['active', 'inactive'];
  if (post_status && !validStatuses.includes(post_status)) {
    return res
      .status(400)
      .json({ message: `유효하지 않은 상태 값입니다: ${post_status}` });
  }

  if (visibility !== true && visibility !== false) {
    return res
      .status(400)
      .json({ message: 'visibility 필드는 true 또는 false여야 합니다.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO community (member_num, post_title, post_content, post_created_at, post_status, visibility) VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *',
      [member_num, post_title, post_content, post_status, visibility]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '게시글 생성에 실패했습니다.' });
  }
};
