const database = require('../database/database');
const jwt = require('jsonwebtoken');

// JWT를 사용해 로그인 상태를 확인하는 미들웨어
const verifyInfoToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: 'Token is invalid or expired' });
    req.user = decoded; // 인증된 사용자 정보 저장
    next();
  });
};

//====================특정 회원 정보를 조회======================
const getMemberInfo = async (req, res) => {
  try {
    const member_num = req.user.memberNum; // 인증된 사용자 ID 가져오기

    const query = `
      SELECT 
          member_num,
          member_id,
          member_email,
          member_phone,
          member_gender,
          member_nickname,
          TO_CHAR(member_birth_date, 'YY.MM.DD') AS member_birth_date,
          member_status,
          member_join_date,
          member_leave_date,
          marketing_consent
      FROM member
      WHERE member_num = $1;
    `;

    const result = await database.query(query, [member_num]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//====================회원 닉네임 변경 이력 조회======================
const getMemberNicknames = async (req, res) => {
  try {
    const { member_num } = req.params;

    const query = `
      SELECT 
          new_nickname,
          TO_CHAR(change_date, 'YY.MM.DD HH24:MI') AS change_date
      FROM member_nickname
      WHERE member_num = $1
      ORDER BY change_date DESC;
    `;

    const result = await database.query(query, [member_num]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No nickname change history found for this member' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching nickname change history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//====================회원 정보 수정======================
const updateMemberInfo = async (req, res) => {
  try {
    const { member_num } = req.params;
    const { member_email, member_phone, member_nickname, marketing_consent } =
      req.body;

    // 먼저, 기존 회원 정보에서 현재 닉네임을 가져옵니다.
    const getCurrentNicknameQuery = `
      SELECT member_nickname
      FROM member
      WHERE member_num = $1;
    `;
    const currentNicknameResult = await database.query(
      getCurrentNicknameQuery,
      [member_num]
    );

    if (currentNicknameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const currentNickname = currentNicknameResult.rows[0].member_nickname;

    // 회원 정보 업데이트 쿼리
    const updateQuery = `
      UPDATE member
      SET 
        member_email = COALESCE($1, member_email),
        member_phone = COALESCE($2, member_phone),
        member_nickname = COALESCE($3, member_nickname),
        marketing_consent = COALESCE($4, marketing_consent)
      WHERE member_num = $5
      RETURNING member_num, member_id, member_email, member_phone, member_nickname, marketing_consent;
    `;

    const updateValues = [
      member_email,
      member_phone,
      member_nickname,
      marketing_consent,
      member_num,
    ];

    const updateResult = await database.query(updateQuery, updateValues);

    if (updateResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Member not found or no changes made' });
    }

    // 닉네임이 변경된 경우 member_nickname 테이블에 이력을 추가합니다.
    if (member_nickname && member_nickname !== currentNickname) {
      const nicknameChangeQuery = `
        INSERT INTO member_nickname (member_num, new_nickname, change_date)
        VALUES ($1, $2, NOW());
      `;
      await database.query(nicknameChangeQuery, [member_num, member_nickname]);
    }

    // 수정된 회원 정보 반환
    res.status(200).json({
      message: 'Member information updated successfully',
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating member info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  verifyInfoToken,
  getMemberInfo,
  getMemberNicknames,
  updateMemberInfo,
};
