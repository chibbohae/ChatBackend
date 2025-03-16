1. 백엔드 세팅 : db 세팅, 웹소켓 세팅
2. 프론트엔드 세팅 : 웹소켓 세팅
3. 프론트 백 연결 테스트
4. 로그인
5. 메세지 주고받기

mongodb 사용
1. 공식 탭추가
brew tap mongodb/brew

2. 설치
brew install mongodb-community

3. 저장할 폴더가 없다면
mkdir -p ~/mongodb-data

4. 백그라운드 서비스 (자동실행 재부팅해도 자동으로,,)
brew services start mongodb-community
5. 끌떄
brew services stop mongodb-community

6. 그냥 수동으로 켜기 
$ mongod --dbpath ~/mongodb-data
