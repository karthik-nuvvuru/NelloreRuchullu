#!/usr/bin/env python3
"""
NelloreRuchullu - Unified Test Runner

This script:
1. Cleans old artifacts (screenshots, videos, reports)
2. Runs Python pytest for backend API tests
3. Runs Playwright for frontend E2E tests
4. Generates HTML test report
5. Saves demo assets

Usage: python run_tests.py
"""

import os
import sys
import shutil
import subprocess
import json
from datetime import datetime
from pathlib import Path

# Project root
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "backend"
WEB_DIR = ROOT_DIR / "web"
TEST_RESULTS_DIR = ROOT_DIR / "test-results"
SCREENSHOTS_DIR = WEB_DIR / "tests" / "screenshots"
REPORT_DIR = WEB_DIR / "tests" / "report"
DEMO_DIR = ROOT_DIR / "tests" / "demo"

# ANSI colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def log(msg: str, color: str = RESET):
    print(f"{color}{msg}{RESET}")


def clean_artifacts():
    """Clean old test artifacts."""
    log("\n🧹 Cleaning old artifacts...", BLUE)

    dirs_to_clean = [
        TEST_RESULTS_DIR,
        SCREENSHOTS_DIR,
        REPORT_DIR,
    ]

    for dir_path in dirs_to_clean:
        if dir_path.exists():
            shutil.rmtree(dir_path)
            log(f"  Removed: {dir_path}")
        dir_path.mkdir(parents=True, exist_ok=True)

    # Clean demo dir but don't remove it
    DEMO_DIR.mkdir(parents=True, exist_ok=True)

    log("  ✅ Cleanup complete\n")


def run_backend_tests() -> bool:
    """Run Python pytest for backend tests."""
    log("\n🐍 Running Backend Tests (pytest)...", BLUE)
    log("=" * 50)

    # Ensure test db exists
    os.chdir(BACKEND_DIR)

    # Run pytest with coverage if available
    # Need to set PYTHONPATH to include backend dir so 'app' module is found
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    cmd = [
        str(ROOT_DIR / ".venv" / "bin" / "pytest"),
        "tests/",
        "-v",
        "--tb=short",
    ]

    try:
        result = subprocess.run(cmd, capture_output=False, text=True, env=env)
        if result.returncode == 0:
            log("✅ Backend tests PASSED\n", GREEN)
            return True
        else:
            log(f"❌ Backend tests FAILED (exit code: {result.returncode})\n", RED)
            return False
    except Exception as e:
        log(f"❌ Error running backend tests: {e}\n", RED)
        return False


def run_frontend_tests() -> bool:
    """Run Playwright E2E tests."""
    log("\n🎭 Running Frontend E2E Tests (Playwright)...", BLUE)
    log("=" * 50)

    os.chdir(WEB_DIR)

    # Ensure node_modules are installed
    if not (WEB_DIR / "node_modules").exists():
        log("  Installing npm dependencies...", YELLOW)
        subprocess.run(["npm", "install"], check=True)

    # Run playwright tests
    cmd = [
        "npx", "playwright",
        "test",
        "--reporter=list",
    ]

    try:
        result = subprocess.run(cmd, capture_output=False, text=True)
        if result.returncode == 0:
            log("✅ Frontend tests PASSED\n", GREEN)
            return True
        else:
            log(f"❌ Frontend tests FAILED (exit code: {result.returncode})\n", RED)
            return False
    except Exception as e:
        log(f"❌ Error running frontend tests: {e}\n", RED)
        return False


def generate_html_report(backend_passed: bool, frontend_passed: bool):
    """Generate HTML test report."""
    log("\n📊 Generating HTML Report...", BLUE)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Collect screenshots
    screenshots = []
    if SCREENSHOTS_DIR.exists():
        for img in SCREENSHOTS_DIR.glob("*.png"):
            screenshots.append({
                "name": img.name,
                "path": str(img.relative_to(ROOT_DIR)),
            })

    # Collect test results from Playwright JSON
    test_results = {}
    results_file = REPORT_DIR / "results.json"
    if results_file.exists():
        try:
            with open(results_file) as f:
                test_results = json.load(f)
        except Exception:
            pass

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NelloreRuchullu - Test Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ color: #ed6c02; margin-bottom: 20px; }}
        .summary {{ display: flex; gap: 20px; margin-bottom: 30px; }}
        .card {{ background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .card h2 {{ color: #333; margin-bottom: 10px; font-size: 1.1rem; }}
        .status {{ font-size: 2rem; font-weight: bold; }}
        .passed {{ color: #22c55e; }}
        .failed {{ color: #ef4444; }}
        .skipped {{ color: #f59e0b; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }}
        .screenshot {{ background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .screenshot img {{ width: 100%; height: auto; display: block; }}
        .screenshot .name {{ padding: 10px; background: #f9f9f9; font-size: 0.9rem; color: #666; }}
        .timestamp {{ color: #999; font-size: 0.9rem; margin-top: 20px; text-align: center; }}
        .overall {{ flex: 1; }}
        .backend {{ flex: 1; }}
        .frontend {{ flex: 1; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🍛 NelloreRuchullu - Test Report</h1>

        <div class="summary">
            <div class="card overall">
                <h2>Overall Status</h2>
                <div class="status {'passed' if (backend_passed and frontend_passed) else 'failed'}">
                    {"✅ ALL TESTS PASSED" if (backend_passed and frontend_passed) else "❌ SOME TESTS FAILED"}
                </div>
            </div>
            <div class="card backend">
                <h2>Backend (pytest)</h2>
                <div class="status {'passed' if backend_passed else 'failed'}">
                    {"✅ PASSED" if backend_passed else "❌ FAILED"}
                </div>
            </div>
            <div class="card frontend">
                <h2>Frontend (Playwright)</h2>
                <div class="status {'passed' if frontend_passed else 'failed'}">
                    {"✅ PASSED" if frontend_passed else "❌ FAILED"}
                </div>
            </div>
        </div>

        <h2 style="margin-bottom: 15px;">📸 Screenshots</h2>
        <div class="grid">
"""

    for shot in screenshots:
        html_content += f"""
            <div class="screenshot">
                <img src="{shot['path']}" alt="{shot['name']}">
                <div class="name">{shot['name']}</div>
            </div>
"""

    html_content += f"""
        </div>

        <div class="timestamp">
            Report generated: {timestamp}<br>
            NelloreRuchullu v1.0.0
        </div>
    </div>
</body>
</html>
"""

    report_file = REPORT_DIR / "index.html"
    with open(report_file, "w") as f:
        f.write(html_content)

    log(f"  ✅ HTML report saved to: {report_file}\n")


def save_demo_assets():
    """Save demo assets (screenshots and videos)."""
    log("\n💾 Saving Demo Assets...", BLUE)

    DEMO_DIR.mkdir(parents=True, exist_ok=True)

    # Copy screenshots to demo dir
    if SCREENSHOTS_DIR.exists():
        for img in SCREENSHOTS_DIR.glob("*.png"):
            dest = DEMO_DIR / img.name
            shutil.copy2(img, dest)
            log(f"  Copied: {img.name}")

    # Copy videos from test-results if they exist
    if TEST_RESULTS_DIR.exists():
        for video in TEST_RESULTS_DIR.glob("*.webm"):
            dest = DEMO_DIR / video.name
            shutil.copy2(video, dest)
            log(f"  Copied: {video.name}")

    log("  ✅ Demo assets saved\n")


def main():
    """Main entry point."""
    log("\n" + "=" * 60, BLUE)
    log("🍛 NelloreRuchullu - Test Suite", BLUE)
    log("=" * 60 + "\n", BLUE)

    # Step 1: Clean artifacts
    clean_artifacts()

    # Step 2: Run backend tests
    backend_passed = run_backend_tests()

    # Step 3: Run frontend tests
    frontend_passed = run_frontend_tests()

    # Step 4: Generate HTML report
    generate_html_report(backend_passed, frontend_passed)

    # Step 5: Save demo assets
    save_demo_assets()

    # Summary
    log("\n" + "=" * 60, BLUE)
    log("📋 Test Summary", BLUE)
    log("=" * 60)
    log(f"  Backend Tests:  {'✅ PASSED' if backend_passed else '❌ FAILED'}")
    log(f"  Frontend Tests: {'✅ PASSED' if frontend_passed else '❌ FAILED'}")
    log("=" * 60 + "\n")

    if backend_passed and frontend_passed:
        log("🎉 All tests passed! 🎉\n", GREEN)
        return 0
    else:
        log("⚠️  Some tests failed. Please review the report.\n", RED)
        return 1


if __name__ == "__main__":
    sys.exit(main())
