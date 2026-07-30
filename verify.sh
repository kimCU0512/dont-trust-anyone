#!/usr/bin/env bash
# 검증 단일 진입점 — 모든 태스크는 이 스크립트가 통과해야 완료로 인정된다.
set -euo pipefail

echo "== 1/4 lint =="
npm run lint

echo "== 2/4 typecheck =="
npx tsc --noEmit

echo "== 3/4 test =="
npx vitest run

echo "== 4/4 build =="
npm run build

echo "VERIFY PASSED"
