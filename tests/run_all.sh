#!/usr/bin/env bash
# Runs every browser test. Needs: pip install playwright && python -m playwright install chromium
cd "$(dirname "$0")"
python3 ../build.py >/dev/null
fail=0
for t in test_slice.py test_mechanics.py test_menus.py test_input.py test_layout.py test_gen.py test_http.py test_perf.py test_bot.py; do
  echo "== $t"; python3 "$t" > "/tmp/hb_$t.log" 2>&1 || fail=1
  grep -aE "^(BAD|SUMMARY|ERRORS)" "/tmp/hb_$t.log"
done
exit $fail
