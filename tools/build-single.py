#!/usr/bin/env python3
"""index.html + css/ + js/ 를 파일 하나로 합칩니다. (Claude 아티팩트처럼 단일 파일이 필요할 때 사용)
사용법: python3 tools/build-single.py [출력파일]   기본값: dist/single.html"""
import re, sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
def css(m):
    return '<style>\n' + open(os.path.join(root, m.group(1)), encoding='utf-8').read() + '</style>'
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', css, html)
# 로컬 js 는 하나의 IIFE 로 합칩니다 (외부 CDN 스크립트는 그대로 둠)
parts = []
def grab(m):
    parts.append((m.group(1), open(os.path.join(root, m.group(1)), encoding='utf-8').read())); return '@@JS@@'
html = re.sub(r'<script src="(js/[^"]+)"></script>\n?', grab, html)
cfg = [p for p in parts if p[0] == 'js/config.js']
rest = [p for p in parts if p[0] != 'js/config.js']
body = '\n'.join(c.replace('"use strict";\n', '', 1) for _, c in rest)
inline_cfg = '<script>' + cfg[0][1] + '</script>\n' if cfg else ''
first = html.index('@@JS@@')
# config 와 CDN 스크립트는 앞에, 앱 코드는 CDN 스크립트 뒤에 둡니다
html = html.replace('@@JS@@', '', len(parts))
cdn = re.search(r'<script src="https://[^"]+"></script>\n?', html)
html = html.replace(cdn.group(0), inline_cfg + cdn.group(0) + '<script>\n(function(){\n"use strict";\n' + body + '\n})();\n</script>\n')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist', 'single.html')
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print(out, len(html), 'bytes')
