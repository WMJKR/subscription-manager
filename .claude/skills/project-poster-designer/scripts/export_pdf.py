"""
포스터 HTML을 인쇄용 PDF로 내보낸다. 헤드리스 크롬으로 실제 렌더링한 뒤
지정한 물리 크기(기본 A2 세로 420mm x 594mm) 그대로 PDF 한 장을 뽑는다.

사용법:
    python export_pdf.py <포스터.html> [출력.pdf] [너비mm] [높이mm]

출력 경로를 생략하면 입력 파일과 같은 이름에 .pdf 확장자를 붙여 같은 폴더에 저장한다.
배경색·이미지는 기본으로 인쇄되도록 --print-to-pdf 플래그를 구성해뒀다
(직접 프린트 대화상자를 쓰면 "배경 그래픽" 옵션을 켜야 하지만, 이 스크립트는 그 걱정이 없다).
"""
import os
import subprocess
import sys

from _browser import find_browser, to_file_url

MM_PER_INCH = 25.4


def export(html_path, pdf_path, width_mm=420, height_mm=594):
    browser = find_browser()
    args = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=3000",
        f"--print-to-pdf={os.path.abspath(pdf_path)}",
        "--print-to-pdf-no-header",
        "--no-pdf-header-footer",
        "--no-margins",
        f"--paper-width={width_mm / MM_PER_INCH:.4f}",
        f"--paper-height={height_mm / MM_PER_INCH:.4f}",
        to_file_url(html_path),
    ]
    result = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30)
    if not os.path.exists(pdf_path):
        raise SystemExit(
            "PDF 생성 실패. stdout/stderr:\n" + result.stdout[-800:] + "\n" + result.stderr[-800:]
        )


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    html_path = sys.argv[1]
    pdf_path = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(html_path)[0] + ".pdf"
    width_mm = float(sys.argv[3]) if len(sys.argv) > 3 else 420
    height_mm = float(sys.argv[4]) if len(sys.argv) > 4 else 594

    export(html_path, pdf_path, width_mm, height_mm)
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"저장됨: {pdf_path} ({size_kb:.0f}KB, {width_mm:.0f}mm x {height_mm:.0f}mm)")
    print("PDF를 뽑기 전에 check_overflow.py로 먼저 크기를 확인하는 걸 추천합니다 — "
          "HTML이 이미 흘러넘치면 PDF도 그대로 흘러넘친 채 잘려서 나옵니다.")


if __name__ == "__main__":
    main()
