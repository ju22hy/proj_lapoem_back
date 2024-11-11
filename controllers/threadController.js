const database = require("../database/database");

// 스레드가 이미 존재하는지 확인
exports.checkThreadExistence = async (req, res) => {
  try {
    const { book_id } = req.params;

    const threadExists = await database.query(
      "SELECT * FROM thread WHERE book_id = $1",
      [book_id]
    );

    if (threadExists.rows.length > 0) {
      return res.status(200).json({ exists: true });
    }

    res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Error checking thread existence:", error);
    res.status(500).json({ message: "스레드 존재 여부 확인에 실패했습니다." });
  }
};

// 스레드 생성
exports.createThread = async (req, res) => {
  try {
    const { book_id, member_num, thread_content } = req.body;
    console.log("Received data:", { book_id, member_num, thread_content });

    // 로그인 여부 확인
    const userCheckQuery =
      "SELECT * FROM member WHERE member_num = $1 AND member_status = 'active'";
    const userCheckResult = await database.query(userCheckQuery, [member_num]);

    if (userCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "회원 로그인이 필요합니다." });
    }

    // 데이터 확인 단계
    if (!book_id || !member_num || !thread_content) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    // thread 테이블에 데이터 삽입
    const newThreadQuery = `
      INSERT INTO thread (book_id, thread_status, thread_created_at) 
      VALUES ($1, $2, NOW()) 
      RETURNING thread_num
    `;
    const newThreadValues = [book_id, true];
    const newThreadResult = await database.query(
      newThreadQuery,
      newThreadValues
    );
    const newThreadNum = newThreadResult.rows[0].thread_num;

    console.log("New thread created with thread_num:", newThreadNum);

    // thread_main 테이블에 첫 번째 댓글 삽입
    const newThreadMainQuery = `
      INSERT INTO thread_main (thread_num, member_num, thread_content, thread_content_created_at, thread_status) 
      VALUES ($1, $2, $3, NOW(), $4)
    `;
    const newThreadMainValues = [
      newThreadNum,
      member_num,
      thread_content,
      true,
    ];
    await database.query(newThreadMainQuery, newThreadMainValues);

    res.status(201).json({
      message: "스레드가 성공적으로 생성되었습니다.",
      thread_num: newThreadNum,
    });
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ message: "스레드 생성에 실패했습니다." });
  }
};

// 스레드 목록 가져오기
exports.getThreads = async (req, res) => {
  // console.log("getThreads API 호출됨");

  try {
    const { query, page = 1, limit = 6 } = req.query;
    const offset = (page - 1) * limit;

    // console.log("query:", query);
    // console.log("page:", page, "limit:", limit, "offset:", offset);

    let getThreadsQuery, threadsParams;

    if (query) {
      // query가 있는 경우
      getThreadsQuery = `
        SELECT 
          thread.thread_num, 
          thread.book_id, 
          book.book_title, 
          book.book_author, 
          book.book_publisher, 
          book.book_cover,
          COUNT(thread_main.member_num) AS participant_count
        FROM 
          thread
        LEFT JOIN 
          book ON thread.book_id = book.book_id
        LEFT JOIN 
          thread_main ON thread.thread_num = thread_main.thread_num
        WHERE (book.book_title ILIKE '%' || $1::text || '%' OR book.book_author ILIKE '%' || $1::text || '%') 
          AND thread.thread_status = 'true'
        GROUP BY 
          thread.thread_num, 
          book.book_id, 
          book.book_title, 
          book.book_author, 
          book.book_publisher, 
          book.book_cover
        LIMIT $2 OFFSET $3
      `;
      threadsParams = [query, limit, offset];
    } else {
      // query가 없는 경우
      getThreadsQuery = `
        SELECT 
          thread.thread_num, 
          thread.book_id, 
          book.book_title, 
          book.book_author, 
          book.book_publisher, 
          book.book_cover,
          COUNT(thread_main.member_num) AS participant_count
        FROM 
          thread
        LEFT JOIN 
          book ON thread.book_id = book.book_id
        LEFT JOIN 
          thread_main ON thread.thread_num = thread_main.thread_num
        WHERE thread.thread_status = 'true'
        GROUP BY 
          thread.thread_num, 
          book.book_id, 
          book.book_title, 
          book.book_author, 
          book.book_publisher, 
          book.book_cover
        LIMIT $1 OFFSET $2
      `;
      threadsParams = [limit, offset];
    }

    // console.log("threadsParams:", threadsParams);

    const threadsResult = await database.query(getThreadsQuery, threadsParams);
    const threadsWithParticipants = threadsResult.rows;

    // console.log("threadsWithParticipants", threadsWithParticipants);

    // 전체 스레드 수 계산
    const totalCountQuery = query
      ? `SELECT COUNT(*) AS total_count FROM thread LEFT JOIN book ON thread.book_id = book.book_id WHERE (book.book_title ILIKE '%' || $1::text || '%' OR book.book_author ILIKE '%' || $1::text || '%') AND thread.thread_status = 'true'`
      : `SELECT COUNT(*) AS total_count FROM thread WHERE thread.thread_status = 'true'`;
    const totalCountParams = query ? [query] : [];
    const totalCountResult = await database.query(
      totalCountQuery,
      totalCountParams
    );
    const totalCount = totalCountResult.rows[0]?.total_count || 0;

    // console.log("totalCount:", totalCount);

    res.status(200).json({
      threads: threadsWithParticipants,
      totalCount: parseInt(totalCount, 10),
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).json({
      message: "스레드 목록 조회에 실패했습니다.",
      error: error.message,
    });
  }
};

// 스레드 검색
exports.searchThreads = async (req, res) => {
  try {
    const { keyword } = req.query;

    console.log("Received search query:", keyword); // 검색어 확인

    // 검색 조건 설정
    const searchCondition = keyword
      ? `WHERE (book.book_title ILIKE '%' || $1::text || '%' OR book.book_author ILIKE '%' || $1::text || '%') 
        AND thread.thread_status IS TRUE`
      : `WHERE thread.thread_status IS TRUE`;

    const searchQuery = `
      SELECT thread.thread_num, thread.book_id, book.book_title, book.book_author, 
            book.book_publisher, book.book_cover, COUNT(thread_main.member_num) AS participant_count
      FROM book
      LEFT JOIN thread ON book.book_id = thread.book_id
      LEFT JOIN thread_main ON thread.thread_num = thread_main.thread_num
      ${searchCondition}
      GROUP BY thread.thread_num, book.book_id, book.book_title, book.book_author, 
              book.book_publisher, book.book_cover
    `;

    console.log("Executing search query:", searchQuery); // 쿼리문 확인
    console.log("Search parameters:", keyword ? [keyword] : []); // 파라미터 확인

    // 파라미터가 있는 경우와 없는 경우 구분하여 쿼리 실행
    const result = keyword
      ? await database.query(searchQuery, [keyword])
      : await database.query(searchQuery);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "해당 책의 스레드가 없습니다." });
    }

    res.status(200).json({ threads: result.rows });
  } catch (error) {
    console.error("Error searching threads:", error);
    res.status(500).json({ message: "스레드 검색 중 오류가 발생했습니다." });
  }
};

// 스레드 상세 조회
exports.getThreadDetail = async (req, res) => {
  try {
    const { thread_num } = req.params;
    if (!thread_num) {
      return res.status(400).json({ message: "스레드 번호가 필요합니다." });
    }

    // 스레드 정보와 관련 사용자 및 책 정보 조회
    const query = `
      SELECT 
        tm.thread_content, 
        tm.thread_content_created_at,
        m.member_nickname, 
        b.book_title, 
        b.book_author, 
        b.book_cover
      FROM thread_main tm
      LEFT JOIN member m ON tm.member_num = m.member_num
      LEFT JOIN thread t ON tm.thread_num = t.thread_num
      LEFT JOIN book b ON t.book_id = b.book_id
      WHERE tm.thread_num = $1
      ORDER BY tm.thread_content_created_at
    `;
    const values = [thread_num];
    const result = await database.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "스레드를 찾을 수 없습니다." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching thread details:", error);
    res
      .status(500)
      .json({ message: "스레드 상세정보를 가져오는데 실패했습니다." });
  }
};
