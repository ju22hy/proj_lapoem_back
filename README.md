# La Poem - 시적인 독서 체험을 위한 도서 커뮤니티 플랫폼

**La Poem**은 대화형 챗봇과 독서 토론, 커뮤니티 기능이 결합된 웹 기반 도서 커뮤니티 플랫폼입니다.  
사용자는 다양한 사람들과 책과 관련된 의견을 자유롭게 나눌 수 있으며, 챗봇 '스텔라(Stella)'를 통해 인공지능과의  
독서 토론도 경험할 수 있습니다.


> 본 프로젝트는 프론트엔드, 백엔드, 챗봇 서버로 분리하여 3개의 레포지토리로 구성되었습니다.

**Repository**
- [Frontend Repository] https://github.com/ju22hy/proj_lapoem_front
- [Backend Repository] https://github.com/ju22hy/proj_lapoem_back
- [Chatbot Repository] https://github.com/ju22hy/proj_lapoem_chatbot

**Notion**
- https://plausible-timimus-25c.notion.site/RPA_-1ce01307430b8186b1b3de8a9ccc1359

**Figma**
- https://www.figma.com/design/ojCd1Ylhu1SMN1M5jISATy/AICC_2nd_Lapoeme?node-id=0-1&t=3tWxu1O6znbWbvNB-1

---

## 🛠 기술 스택

| 기술 | 설명 |
|------|------|
| **Node.js** | JavaScript 기반의 런타임으로 비동기 I/O 처리에 강점. 빠른 서버 응답 처리에 적합 |
| **Express** | Node.js 환경에서 경량화된 웹 프레임워크로 RESTful API 구성에 용이 |
| **RESTful API** | HTTP 요청 방식에 따라 자원을 명확하게 구분하는 구조로, 클라이언트-서버 간의 명확한 역할 분리 가능 |
| **Jenkins** | (백/프/챗봇 배포 공동 사용) 프로젝트 전반의 배포 자동화에 활용 |
> ※ 배포 작업은 전담 팀원이 진행하였으며, 본 리포지토리는 API 서버 개발에 중점을 두고 있음

---

## 🙋🏻‍♀️ 담당 역할

- **Main / Thread On 페이지의 API 설계 및 구현**
  - 담당 페이지 관련 사용자/도서/스레드 API 엔드포인트 설계 및 CRD (Create / Read / Delete) 기능 구현
  - 스레드 기능 내 대댓글(Reply) 기능 DB부터 설계 및 로직 구현
- **데이터 무결성 유지 및 삭제 정책 관리**
  - 모든 콘텐츠에 대해 Soft Delete (비공개 처리) 정책 적용
  - 회원 탈퇴 시 연관된 콘텐츠를 일괄 정리하는 삭제 로직 별도 설계
- **담당 기능 DB 유지 보수 및 API 테스트 환경 구성**
  - 실제 운영 DB와 연동하여 API 테스트 및 기능 유지보수
  - Postman을 활용한 수동 테스트 및 콘솔 로깅을 통한 흐름 디버깅

---
## 회고 및 느낀점
이 프로젝트를 통해 백엔드 개발을 처음 경험하며, API 설계부터 데이터 흐름 제어, 비동기 로직 구현까지 경험할 수 있었습니다.
특히, 스레드 대댓글 기능의 구조 설계와 회원 탈퇴 시 데이터 일괄 삭제 처리는 직접 로직을 고민하고 구현하며 
백엔드 로직 설계의 중요성을 체감할 수 있었던 경험이었습니다.

초기에는 에러가 시각적으로 드러나지 않아 원인을 파악하는 데 어려움이 있었지만,
콘솔 로그를 활용해 데이터 흐름을 따라가며 문제를 해결하는 디버깅 능력을 키울 수 있었고, 
이후 유사 상황에서도 보다 빠르게 대응할 수 있게 되었습니다.

---

## 기타
> 실제 배포 시 페이지 이미지와 시연 영상은 PPT에서 확인 가능합니다.

- 📊 발표 ppt: https://docs.google.com/presentation/d/1_3Qnvyem_cIrD9mhtqh-EvrN_192ymu-qkAgFCW1fog/edit?usp=sharing
