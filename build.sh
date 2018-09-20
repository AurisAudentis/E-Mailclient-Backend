#!/usr/bin/env bash
set -e
npm i

rm -rf ./build/*
tsc --build tsconfig.json
cp package.json ./build/
~/Dropbox/Scripts/filetoserver -p -d"MailBack" ./build/
ssh maxiem@maxiemgeldhof.com pm2 reload MailBack