const database = require('../database/database');

// =================신간 도서 등록=======================
exports.postNewBooks = async (req, res) => {
  const {
    book_cover,
    book_publisher,
    publish_date,
    isbn,
    book_description,
    book_price,
    is_book_best = false, // 기본값 false
    book_status = true, // 기본값 true
    book_title,
    book_author,
    genre_tag_name,
  } = req.body;

  // book_price에 "원" 자동 추가
  const formattedBookPrice =
    typeof book_price === 'number' ? `${book_price}원` : book_price;

  // genre_tag_name과 genre_tag_id 매칭
  const genreMapping = {
    역사: 1,
    판타지: 2,
    '과학(SF)': 3,
    '추리/미스터리': 4,
    한국소설: 5,
    일본소설: 6,
    '시/희곡': 7,
    '인문/교양': 8,
    '독서/비평': 9,
    서양철학: 10,
    동양철학: 11,
    '미학/예술철학': 12,
    '심리학/정신분석학': 13,
    경제: 14,
    경영일반: 15,
    '트렌드/미래예측': 16,
    '마케팅/브랜드': 17,
    '투자/재테크': 18,
    인터넷비즈니스: 19,
    '기업/경영자스토리': 20,
  };

  const genre_tag_id = genreMapping[genre_tag_name];

  // 필수 필드 확인
  if (
    !book_cover ||
    !book_publisher ||
    !publish_date ||
    !isbn ||
    !book_description ||
    !formattedBookPrice ||
    !book_title ||
    !book_author ||
    !genre_tag_name ||
    !genre_tag_id
  ) {
    return res
      .status(400)
      .json({ message: 'All fields are required or invalid genre_tag_name.' });
  }

  try {
    const query = `
      INSERT INTO book (
        book_cover, 
        book_publisher, 
        publish_date, 
        isbn, 
        book_description, 
        book_price, 
        book_create_date, 
        is_book_best, 
        book_status, 
        book_title, 
        book_author, 
        genre_tag_name, 
        genre_tag_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12
      ) RETURNING *
    `;

    const values = [
      book_cover,
      book_publisher,
      publish_date,
      isbn,
      book_description,
      formattedBookPrice,
      is_book_best,
      book_status,
      book_title,
      book_author,
      genre_tag_name,
      genre_tag_id,
    ];

    const { rows } = await database.query(query, values);
    const newBook = rows[0];

    return res.status(201).json({
      message: 'New book added successfully.',
      newBook,
    });
  } catch (error) {
    console.error('Error adding new book:', error);
    return res
      .status(500)
      .json({ message: 'Failed to add new book.', error: error.message });
  }
};
