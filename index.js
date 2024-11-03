const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const PORT = '8002';

const app = express(); //express 모듈을 사용하기 위해 app 변수에 할당

app.use(express.json()); //express 모듈의 json()메소드를 사용한다.
app.use(cookieParser()); // 쿠키 파서 추가

// 환경에 따른 CORS 설정
const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL // 배포 환경에서는 시크릿에서 받은 배포 URL 사용
    : 'http://localhost:3002'; // 로컬 개발 환경에서는 localhost 사용

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
