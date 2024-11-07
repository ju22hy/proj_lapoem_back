const database = require('../database/database');

// 책 상세 정보 불러오기=================================================
const getBookDetail = async (req, res) => {
  const { bookId } = req.params;

  try {
    // 책 정보와 리뷰의 평균 평점 및 총 리뷰 개수 조회
    const query = `
        SELECT 
            b.book_id,
            b.book_cover,
            b.book_publisher,
            b.publish_date,
            b.isbn,
            b.book_description,
            b.book_price,
            b.is_book_best,
            b.book_title,
            b.book_author,
            b.genre_tag_name,
            CASE 
            WHEN AVG(br.rating) IS NULL THEN 0 
            ELSE ROUND(AVG(br.rating), 1) 
            END AS average_rating, -- NULL일 때는 0, 아닐 때는 소수점 1자리로 반올림
            COUNT(br.rating) AS review_count  -- 리뷰 개수
        FROM 
            book AS b
        LEFT JOIN 
            book_review AS br ON b.book_id = br.book_id
        WHERE 
            b.book_id = $1
        GROUP BY 
            b.book_id
    `;

    const result = await database.query(query, [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.json(result.rows[0]); // 첫 번째 책 정보 반환
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 책 리뷰 불러오기=================================================
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

module.exports = { getBookDetail, getBookReviews };
