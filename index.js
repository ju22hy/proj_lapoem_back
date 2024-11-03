require('dotenv').config(); //.env 파일 사용 설정
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const PORT = '8002';

const app = express(); //express 모듈을 사용하기 위해 app 변수에 할당

app.use(express.json()); //express 모듈의 json()메소드를 사용한다.
app.use(cookieParser()); // 쿠키 파서 추가

// 환경에 따른 CORS 설정
const allowedOrigin = process.env.API_URL || 'http://localhost:3002'; // API_URL 환경변수 사용

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

//http, https 프로토콜을 사용하는 서버 간의 통신을 허용한다.

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(require('./routes/getRoutes')); // getRoutes 경로 설정
app.use(require('./routes/postRoutes')); // postRoutes 경로 설정

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
