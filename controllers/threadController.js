// controllers/threadController.js
const database = require("../database/database"); // database 객체가 제대로 연결되어 있어야 합니다

exports.checkThreadExistence = async (req, res) => {
  try {
    const { book_id } = req.params;

    // 스레드가 이미 존재하는지 확인
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

exports.createThread = async (req, res) => {
  try {
    const { book_id, member_num, thread_content } = req.body;
    console.log("Received data:", { book_id, member_num, thread_content });

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

exports.getThreads = async (req, res) => {
  try {
    // 모든 스레드 가져오기
    const getThreadsQuery = `
      SELECT t.thread_num, t.book_id, b.book_title, b.book_author, b.book_publisher, 
            COUNT(tm.member_num) AS participant_count
      FROM thread t
      LEFT JOIN book b ON t.book_id = b.book_id
      LEFT JOIN thread_main tm ON t.thread_num = tm.thread_num
      WHERE t.thread_status = true
      GROUP BY t.thread_num, t.book_id, b.book_title, b.book_author, b.book_publisher
    `;
    const threadsResult = await database.query(getThreadsQuery);
    const threadsWithParticipants = threadsResult.rows;

    res.status(200).json({ threads: threadsWithParticipants });
  } catch (error) {
    console.error("Error fetching threads:", error);
    res.status(500).json({ message: "스레드 목록 조회에 실패했습니다." });
  }
};
