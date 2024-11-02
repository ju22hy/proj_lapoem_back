const database = require('../database/database');

exports.getBookList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // 기본 페이지는 1
    const limit = parseInt(req.query.limit, 10) || 10; // 기본 페이지 크기는 20
    const category = req.query.category; // 카테고리 필터 추가

    const offset = (page - 1) * limit;

    // 기본 쿼리와 조건 설정
    let query = `
      SELECT book_id, book_title,book_cover, book_author,book_publisher, genre_tag_name, isbn, book_description, book_price
      FROM book
    `;

    // 카테고리 필터가 있을 경우 WHERE 조건 추가
    const queryParams = [limit, offset];
    if (category) {
      query += ` WHERE genre_tag_name = $3`; // SQL 인젝션 방지를 위해 $3를 사용해 파라미터 바인딩
      queryParams.unshift(category); // category를 첫 번째 파라미터로 추가 (LIMIT과 OFFSET은 이후)
    }

    // 페이징을 위한 LIMIT과 OFFSET 추가
    query += ` LIMIT $1 OFFSET $2`;

    const allBooks = await database.query(query, queryParams);

    if (!allBooks.rows.length) {
      return res.status(404).json({ message: 'No books found' });
    }

    return res.status(200).json({
      data: allBooks.rows,
      currentPage: page,
      totalBooks: allBooks.rowCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
