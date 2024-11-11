const database = require("../database/database");

// 스레드 상세 조회
exports.getThreadDetail = async (req, res) => {
  const { thread_num } = req.params;

  try {
    const query = `
      SELECT 
        thread.thread_num,
        book.book_cover,
        book.book_title,
        thread.thread_created_at,
        thread.thread_status,
        COUNT(DISTINCT thread_main.member_num) AS participant_count,
        COUNT(thread_main.thread_content) AS total_comments
      FROM thread
      JOIN book ON thread.book_id = book.book_id
      LEFT JOIN thread_main ON thread.thread_num = thread_main.thread_num
      WHERE thread.thread_num = $1 AND thread.thread_status = true
      GROUP BY thread.thread_num, book.book_cover, book.book_title, thread.thread_created_at, thread.thread_status
    `;
    const values = [thread_num];
    const result = await database.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "스레드를 찾을 수 없습니다." });
    }

    const threadData = result.rows[0];

    // `thread_created_at` 필드를 원하는 한국어 형식으로 변환
    const createdAt = new Date(threadData.thread_created_at);
    threadData.thread_created_at = createdAt.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });

    console.log("Formatted Query result:", threadData);
    res.status(200).json(threadData);
  } catch (error) {
    console.error("Error fetching thread details:", error);
    res
      .status(500)
      .json({ message: "스레드 정보를 가져오는 중 오류가 발생했습니다." });
  }
};

// 댓글 작성
exports.createThreadComment = async (req, res) => {
  try {
    const { member_num, thread_content } = req.body;
    const { thread_num } = req.params;

    // 로그인 여부 확인
    const userCheckQuery = `
      SELECT * FROM member 
      WHERE member_num = $1 AND member_status = 'active'
    `;
    const userCheckResult = await database.query(userCheckQuery, [member_num]);

    if (userCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "회원 로그인이 필요합니다." });
    }

    // 댓글 길이 제한 확인
    if (thread_content.length > 300) {
      return res
        .status(400)
        .json({ message: "댓글은 최대 300자까지 작성할 수 있습니다." });
    }

    // 댓글 삽입
    const insertCommentQuery = `
      INSERT INTO thread_main (thread_num, member_num, thread_content, thread_content_created_at, thread_status) 
      VALUES ($1, $2, $3, NOW(), true) RETURNING thread_content_num
    `;
    const insertCommentValues = [thread_num, member_num, thread_content];
    const insertCommentResult = await database.query(
      insertCommentQuery,
      insertCommentValues
    );

    res.status(201).json({
      message: "댓글이 성공적으로 작성되었습니다.",
      comment_num: insertCommentResult.rows[0].thread_content_num,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "댓글 작성에 실패했습니다." });
  }
};

// 대댓글 작성 함수
exports.createThreadReply = async (req, res) => {
  const { member_num, thread_content_num2, thread_content } = req.body;

  try {
    // 로그인한 사용자 확인
    const userCheckQuery = `
      SELECT * FROM member WHERE member_num = $1 AND member_status = 'active'
    `;
    const userCheckResult = await database.query(userCheckQuery, [member_num]);

    if (userCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "회원 로그인이 필요합니다." });
    }

    // 대댓글 길이 제한
    if (thread_content.length > 300) {
      return res
        .status(400)
        .json({ message: "대댓글은 최대 300자까지 가능합니다." });
    }

    // 부모 댓글의 thread_num을 가져오기
    const parentThreadNumQuery = `
      SELECT thread_num FROM thread_main WHERE thread_content_num = $1
    `;
    const parentThreadNumResult = await database.query(parentThreadNumQuery, [
      thread_content_num2,
    ]);

    if (parentThreadNumResult.rows.length === 0) {
      return res.status(404).json({ message: "부모 댓글을 찾을 수 없습니다." });
    }

    const thread_num = parentThreadNumResult.rows[0].thread_num;

    // 대댓글 저장 쿼리
    const replyQuery = `
      INSERT INTO thread_main (thread_num, member_num, thread_content, thread_content_num2, thread_content_created_at, thread_status)
      VALUES ($1, $2, $3, $4, NOW(), true)
      RETURNING thread_content_num
    `;
    const replyValues = [
      thread_num,
      member_num,
      thread_content,
      thread_content_num2,
    ];
    const replyResult = await database.query(replyQuery, replyValues);

    res.status(201).json({
      message: "대댓글이 성공적으로 등록되었습니다.",
      reply_id: replyResult.rows[0].thread_content_num,
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ message: "대댓글 등록 중 오류가 발생했습니다." });
  }
};

// 댓글 및 대댓글 조회
exports.getThreadComment = async (req, res) => {
  const { thread_num } = req.params;
  const { offset = 0, limit = 5 } = req.query;

  try {
    // 부모 댓글 쿼리 (상태값이 True/False 모두 가져옴)
    const parentCommentsQuery = `
      SELECT 
        thread_main.thread_content_num,
        thread_main.member_num,
        member.member_nickname,
        thread_main.thread_content,
        thread_main.thread_content_created_at,
        thread_main.thread_status,
        (SELECT COUNT(*) FROM thread_main AS reply 
         WHERE reply.thread_content_num2 = thread_main.thread_content_num 
           AND reply.thread_status = true) AS reply_count
      FROM thread_main
      JOIN member ON thread_main.member_num = member.member_num
      WHERE thread_main.thread_num = $1 
        AND thread_main.thread_content_num2 IS NULL
      ORDER BY thread_main.thread_content_created_at DESC
      OFFSET $2 LIMIT $3
    `;
    const parentCommentsValues = [thread_num, offset, limit];
    const parentCommentsResult = await database.query(
      parentCommentsQuery,
      parentCommentsValues
    );

    const comments = await Promise.all(
      parentCommentsResult.rows.map(async (comment) => {
        const is_active = comment.thread_status;

        // 대댓글 쿼리 (True 상태인 것만 최신순으로 가져오기)
        const repliesQuery = `
          SELECT 
            thread_main.thread_content_num,
            thread_main.member_num,
            member.member_nickname,
            thread_main.thread_content,
            thread_main.thread_content_created_at,
            thread_main.thread_status
          FROM thread_main
          JOIN member ON thread_main.member_num = member.member_num
          WHERE thread_main.thread_content_num2 = $1 
            AND thread_main.thread_status = true
          ORDER BY thread_main.thread_content_created_at DESC
          LIMIT 2 -- 최신 2개의 대댓글만 가져오기
        `;
        const repliesValues = [comment.thread_content_num];
        const repliesResult = await database.query(repliesQuery, repliesValues);

        // 대댓글 데이터 변환
        const replies = repliesResult.rows.map((reply) => ({
          thread_content_num: reply.thread_content_num,
          member_nickname: reply.member_nickname,
          thread_content: reply.thread_content,
          created_at: new Date(reply.thread_content_created_at).toLocaleString(
            "ko-KR",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: false,
            }
          ),
        }));

        return {
          thread_content_num: comment.thread_content_num,
          member_nickname: comment.member_nickname,
          thread_content: is_active
            ? comment.thread_content
            : "삭제된 댓글입니다",
          created_at: new Date(
            comment.thread_content_created_at
          ).toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          }),
          is_active,
          reply_count: comment.reply_count, // 총 대댓글 개수
          replies, // 최신 2개의 대댓글
        };
      })
    );

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res
      .status(500)
      .json({ message: "댓글 목록을 가져오는 중 오류가 발생했습니다." });
  }
};

// 댓글 및 대댓글 삭제 함수
exports.deleteThreadComment = async (req, res) => {
  const { commentId } = req.params; // 댓글의 ID (또는 대댓글의 ID)
  const { member_num } = req.body; // 요청한 사용자 정보

  try {
    // 로그인한 사용자가 댓글 작성자인지 확인
    const authorCheckQuery = `
      SELECT * FROM thread_main WHERE thread_content_num = $1 AND member_num = $2
    `;
    const authorCheckResult = await database.query(authorCheckQuery, [
      commentId,
      member_num,
    ]);

    if (authorCheckResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "본인이 작성한 댓글만 삭제할 수 있습니다." });
    }

    // 댓글을 소프트 삭제 처리 (상태만 false로 변경)
    const deleteQuery = `
      UPDATE thread_main SET thread_status = false WHERE thread_content_num = $1
    `;
    await database.query(deleteQuery, [commentId]);

    res.status(200).json({ message: "댓글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." });
  }
};
