#!/bin/bash

set -eo pipefail

SANDBOX=$(ls -d node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome_sandbox)
chmod 4755 "$SANDBOX"
cp -p "$SANDBOX" /usr/local/sbin/chrome-devel-sandbox
