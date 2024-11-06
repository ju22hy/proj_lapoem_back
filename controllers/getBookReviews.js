const database = require('../database/database');

// 특정 책에 대한 리뷰 목록을 가져오는 컨트롤러
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    // bookId가 없을 경우 오류 반환
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required.' });
    }

    // 특정 책에 대한 리뷰와 작성자 정보를 가져오기 위한 쿼리
    const query = `
      SELECT 
        r.review_num,
        r.review_content,
        r.rating,
        to_char(r.review_created_at, 'DD.MM.YY (HH24:MI)') AS review_created_at,
        m.member_num,
        m.member_nickname,
        m.member_gender,
        to_char(m.member_birth_date, 'DD.MM.YY') AS member_birth_date
      FROM 
        book_review r
      JOIN 
        member m ON r.member_num = m.member_num
      WHERE 
        r.book_id = $1 AND r.review_status = 'active'
      ORDER BY 
        r.review_created_at DESC
    `;

    // 쿼리 실행
    const result = await database.query(query, [bookId]);

    // 리뷰 목록 반환
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    res.status(500).json({ error: 'An error occurred while fetching reviews' });
  }
};

module.exports = { getBookReviews };
