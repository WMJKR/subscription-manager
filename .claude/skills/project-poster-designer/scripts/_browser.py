"""check_overflow.py와 export_pdf.py가 공유하는 헤드리스 크롬/엣지 탐색 도우미."""
import os

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def find_browser():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    raise SystemExit(
        "Chrome/Edge를 못 찾았습니다. _browser.py의 CHROME_CANDIDATES에 실제 설치 경로를 추가하세요."
    )


def to_file_url(path):
    abs_path = os.path.abspath(path).replace("\\", "/")
    return "file:///" + abs_path
