# 어르신 돌봄 대시보드 (Elder Care Dashboard)

## 📋 프로젝트 소개
혼자 계신 어르신의 건강과 안전을 통합적으로 관리하고, 웹캠을 통해 넘어짐과 같은 위험 상황을 감지하여 보호자에게 알리는 것을 목표로 하는 웹 기반 모니터링 플랫폼입니다.

## 🚀 시작하기 (Getting Started)
이 섹션은 프로젝트를 로컬 컴퓨터에 설정하고 실행하는 방법을 안내합니다.

### ✅ 사전 요구 사항 (Prerequisites)
프로젝트를 실행하기 위해 아래 프로그램들이 설치되어 있어야 합니다.
*   [Python](https://www.python.org/downloads/) (3.10 이상 권장)
*   [Node.js](https://nodejs.org/ko/) (LTS 버전 권장)

### ⚙️ 설치 및 설정 (Installation & Setup)
Git 저장소를 복제한 후, 백엔드와 프론트엔드를 각각 설정해야 합니다.

**1. 백엔드 설정 (Backend)**
```bash
# 1. 백엔드 폴더로 이동합니다.
cd backend

# 2. 파이썬 가상 환경을 생성합니다.
python -m venv venv

# 3. 가상 환경을 활성화합니다.
# Windows:
venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

# 4. 필요한 라이브러리를 설치합니다.
pip install -r requirements.txt
```

**2. 프론트엔드 설정 (Frontend)**
```bash
# 1. 프론트엔드 폴더로 이동합니다.
cd frontend

# 2. 필요한 라이브러리를 설치합니다. (시간이 다소 걸릴 수 있습니다.)
npm install
```

## ▶️ 실행하기 (Running the Application)

이 프로젝트는 백엔드 서버가 프론트엔드의 빌드 파일을 직접 제공하는 방식으로 작동합니다. 따라서 실행 전 프론트엔드 빌드가 필요합니다.

**1. 프론트엔드 빌드**
```bash
# frontend 폴더에서 아래 명령어를 실행하여 UI를 빌드합니다.
npm run build
```

**2. 백엔드 서버 실행**
```bash
# backend 폴더에서 아래 명령어를 실행하여 서버를 시작합니다.
python main.py
```
서버가 시작되면 잠시 후 웹 브라우저에 대시보드 화면이 자동으로 열립니다.

---
**앱 종료:** 앱을 완전히 종료하려면, 반드시 대시보드 우측 상단의 **'Quit Application'** 버튼을 클릭해야 합니다.
