#!/usr/bin/env bash
PORT=${1:-8080}
echo "=================================================="
echo " Menjalankan RavenCard Local Web Server"
echo " Buka di browser: http://localhost:${PORT}"
echo "=================================================="
python3 -m http.server "${PORT}"
