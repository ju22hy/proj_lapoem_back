const database = require('../database/database');

//====================특정 회원 정보를 조회======================
const getMemberInfo = async (req, res) => {
  try {
    const { member_num } = req.params;

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

module.exports = {
  getMemberInfo,
  getMemberNicknames,
};
