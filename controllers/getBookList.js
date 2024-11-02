const database = require('../database/database');

exports.getBookList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // 기본 페이지는 1
    const limit = parseInt(req.query.limit, 10) || 10; // 기본 페이지 크기는 20
    const category = req.query.category; // 카테고리 필터 추가

    const offset = (page - 1) * limit;

    // 기본 쿼리와 조건 설정
    let query = `
      SELECT book_id, book_title,book_cover, book_author,book_publisher, genre_tag_name, isbn, book_description, book_price, publish_date,genre_tag_id,is_book_best,book_status
      FROM book
      WHERE book_status IS NOT false  -- book_status가 false인 책을 제외
    `;

    // 카테고리 필터가 있을 경우 WHERE 조건 추가
    if (category) {
      query += ` AND genre_tag_name = $3`; // SQL 인젝션 방지를 위해 $3를 사용해 파라미터 바인딩
    }

    // 정렬 및 페이징 추가
    query += `
    ORDER BY 
      CASE WHEN book_author = '한강' THEN 1 ELSE 0 END DESC,          -- '한강' 저자 우선 출력
      CASE WHEN is_book_best = true THEN 1 ELSE 0 END DESC,           -- 베스트셀러인 책 우선 출력
      CASE WHEN genre_tag_name = '한국 소설' THEN 1 ELSE 0 END DESC,  -- '한국 소설' 우선 출력
      CASE WHEN is_book_best = true THEN 1 ELSE 0 END DESC,           -- 베스트셀러인 책 우선 출력
      publish_date DESC,                                              -- 최신 출판일 우선 출력
      genre_tag_id ASC                                                 -- 그다음으로 장르 ID 순으로 정렬
    LIMIT $1 OFFSET $2
  `;

    // 총 책 개수를 세는 쿼리
    let countQuery = `SELECT COUNT(*) FROM book WHERE book_status IS NOT false`;
    if (category) {
      countQuery += ` AND genre_tag_name = $1`;
    }

    // 파라미터 설정
    const queryParams = category ? [category, limit, offset] : [limit, offset];
    const countParams = category ? [category] : [];

    // 총 책 개수를 가져오기 위한 쿼리 실행
    const totalBooksResult = await database.query(countQuery, countParams);
    const totalBooks = parseInt(totalBooksResult.rows[0].count, 10);

    // 현재 페이지의 책 목록을 가져오기 위한 쿼리 실행
    const allBooks = await database.query(query, queryParams);

    if (!allBooks.rows.length) {
      return res.status(404).json({ message: 'No books found' });
    }

    return res.status(200).json({
      data: allBooks.rows,
      currentPage: page,
      totalBooks: totalBooks, // 전체 책 개수 전달
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
