import os
import sys
import subprocess
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
TARGET_DIR = r"C:\Users\tiwar\rudra_logistics"

MD_FILES = [
    "prd.md",
    "architecture.md",
    "rules.md",
    "design.md",
    "task.md",
    "memory.md"
]

CSS_STYLE = """
<style>
@page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
    @bottom-center {
        content: counter(page);
    }
}
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 10.5pt;
    max-width: 900px;
    margin: 0 auto;
    padding: 10px;
}
h1 {
    color: #0f172a;
    font-size: 22pt;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 8px;
    margin-top: 0;
    page-break-after: avoid;
}
h2 {
    color: #1e293b;
    font-size: 16pt;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 6px;
    margin-top: 1.8em;
    page-break-after: avoid;
}
h3 {
    color: #334155;
    font-size: 12.5pt;
    margin-top: 1.4em;
    page-break-after: avoid;
}
p, li {
    font-size: 10.5pt;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
    page-break-inside: avoid;
}
th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
    font-size: 9.5pt;
}
th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
}
tr:nth-child(even) {
    background-color: #f8fafc;
}
code {
    font-family: "Cascadia Code", Consolas, "Courier New", monospace;
    font-size: 9pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 5px;
    border-radius: 4px;
}
pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: "Cascadia Code", Consolas, "Courier New", monospace;
    font-size: 9pt;
    overflow-x: auto;
    page-break-inside: avoid;
    line-height: 1.4;
}
pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
}
blockquote {
    border-left: 4px solid #3b82f6;
    margin: 1.2em 0;
    padding: 6px 16px;
    background-color: #f8fafc;
    color: #475569;
}
hr {
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 1.8em 0;
}
ul, ol {
    padding-left: 24px;
}
li {
    margin-bottom: 4px;
}
.badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 8.5pt;
    font-weight: bold;
    border-radius: 4px;
    background: #e2e8f0;
}
</style>
"""

def convert_md_to_pdf(md_filename):
    md_path = os.path.join(TARGET_DIR, md_filename)
    base_name = os.path.splitext(md_filename)[0]
    html_path = os.path.join(TARGET_DIR, f"{base_name}.html")
    pdf_path = os.path.join(TARGET_DIR, f"{base_name}.pdf")

    if not os.path.exists(md_path):
        print(f"Skipping {md_filename}: File not found.")
        return False

    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    html_body = markdown.markdown(
        md_content,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"]
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{base_name.upper()} - Project Rudra-Logistics</title>
    {CSS_STYLE}
</head>
<body>
    {html_body}
</body>
</html>"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    # Edge Headless Print to PDF Command
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"[SUCCESS] Converted: {md_filename} -> {base_name}.pdf ({size_kb:.1f} KB)")
        # Clean temporary HTML
        if os.path.exists(html_path):
            os.remove(html_path)
        return True
    else:
        print(f"[FAIL] Failed to create {base_name}.pdf. Error: {result.stderr}")
        return False

if __name__ == "__main__":
    print("==================================================")
    print("  PROJECT RUDRA-LOGISTICS: MD TO PDF GENERATOR   ")
    print("==================================================")
    success_count = 0
    for filename in MD_FILES:
        if convert_md_to_pdf(filename):
            success_count += 1
    print("==================================================")
    print(f"Conversion complete! {success_count}/{len(MD_FILES)} PDFs generated.")
