# Morning Muse AI

스마트폰용 AI 모닝콜 앱 "WakeUp AI"를 만들어줘.

[화면 구성 및 기능]

1. 메인 화면:

   - 알람 시간 설정 (시간 및 분 선택)

   - 목소리 톤 선택 (다정한 친구, 엄격한 교관, 밝은 아나운서)

   - '알람 저장' 버튼

2. 알람 울림 테스트 버튼:

   - 메인 화면 하단에 '전화 수신 테스트' 버튼 배치 (눌렀을 때 즉시 전화 화면으로 이동)

3. 전화 수신 화면 (전화 온 것처럼 커스텀 UI):

   - 실제 스마트폰에 전화가 온 것처럼 커스텀 전화 수신 화면 표시

   - 상단에 "AI 모닝콜" 문구와 프로필 아이콘

   - 초록색 '전화 받기' 버튼과 빨간색 '거절' 버튼

4. 전화 받기 클릭 후 동작:

   - 전화 받기를 누르면 "통화 중 (00:05)" 타이머 작동

   - 브라우저 기본 음성(TTS)으로 아래 멘트를 읽어주기:

     "좋은 아침이에요! 지금은 설정하신 시간입니다. 오늘 하루도 당신의 멋진 도전을 응원해요!"

   - 하단에 "통화 종료" 버튼 배치

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ac85edcb-8dbb-4b0e-8320-ddfc467bce82).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
