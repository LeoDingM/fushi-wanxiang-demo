#!/usr/bin/env bash
# shared-rules are REUSED, not forked: copy the canonical ../shared-rules runtime files verbatim (playtest checks the hashes)
set -e; cd "$(dirname "$0")/.."; mkdir -p shared-rules
cp ../shared-rules/rules.js ../shared-rules/rules.data.js ../shared-rules/rules.json shared-rules/
echo "synced shared-rules $(md5sum shared-rules/rules.js | cut -c1-8)"
