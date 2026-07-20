"""
포스터 HTML이 420mm x 594mm 안에 들어가는지 헤드리스 크롬으로 실측한다.

브라우저로 직접 열어서 눈으로 확인하는 것보다 이 스크립트가 더 믿을 만하다 —
포스터는 mm 단위의 실물 크기(약 1587x2245px)라 화면에서 잘려 보이는 것과
실제로 콘텐츠가 594mm를 넘겨 흘러넘치는 것을 눈으로는 구분하기 어렵다.

사용법:
    python check_overflow.py <포스터.html> [너비mm] [높이mm]

기본값은 A2 세로(420 x 594). 다른 비율의 포스터라면 인자로 override.
"""
import os
import re
import subprocess
import sys
import tempfile

from _browser import find_browser, to_file_url

MM_PER_PX = 25.4 / 96


def measure(html_path):
    with open(html_path, encoding="utf-8") as f:
        html = f.read()

    inject = (
        '<script>window.addEventListener("load", function(){'
        'document.title = "H:" + document.body.scrollHeight + "|W:" + document.body.scrollWidth;'
        "});</script>"
    )
    if "</head>" in html:
        measured_html = html.replace("</head>", inject + "</head>", 1)
    else:
        measured_html = inject + html

    fd, tmp_path = tempfile.mkstemp(suffix=".html")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(measured_html)

    browser = find_browser()
    try:
        result = subprocess.run(
            [
                browser,
                "--headless=new",
                "--disable-gpu",
                "--virtual-time-budget=3000",
                "--dump-dom",
                to_file_url(tmp_path),
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
    finally:
        os.remove(tmp_path)

    match = re.search(r"<title>H:(\d+)\|W:(\d+)</title>", result.stdout)
    if not match:
        raise SystemExit(
            "측정 실패. stdout/stderr:\n" + result.stdout[-800:] + "\n" + result.stderr[-800:]
        )
    return int(match.group(1)) * MM_PER_PX, int(match.group(2)) * MM_PER_PX


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # Windows 콘솔 기본 코드페이지에서 한글 깨짐 방지
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    html_path = sys.argv[1]
    target_w = float(sys.argv[2]) if len(sys.argv) > 2 else 420
    target_h = float(sys.argv[3]) if len(sys.argv) > 3 else 594

    height_mm, width_mm = measure(html_path)

    ok = True
    for label, actual, target in (("높이", height_mm, target_h), ("너비", width_mm, target_w)):
        delta = actual - target
        if delta > 1:
            print(f"[FAIL] {label}: {actual:.1f}mm (목표 {target:.0f}mm) — {delta:.1f}mm 흘러넘침")
            ok = False
        else:
            print(f"[OK]   {label}: {actual:.1f}mm (목표 {target:.0f}mm)")

    if not ok:
        print(
            "\n흘러넘치는 콘텐츠가 있습니다. 보통 flex 컨테이너 체인에 min-height:0이 "
            "빠져서(특히 img/svg를 감싼 부분) 생기는 문제입니다 — assets/poster-template.html의 "
            ".showcase 관련 주석 참고. 텍스트를 줄이거나 여백/이미지 크기를 조정한 뒤 다시 실행하세요."
        )
        sys.exit(1)
    print("\n594mm 한 장 안에 모두 들어갑니다.")


if __name__ == "__main__":
    main()
