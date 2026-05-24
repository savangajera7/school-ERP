#!/bin/bash
# Run ON THE SERVER (94.136.191.175) after copying nginx config.
set -euo pipefail

sudo mkdir -p /var/www/school-erp-web
sudo mkdir -p /var/www/schoolmanagementapi/wwwroot/downloads
sudo chown -R savan:www-data /var/www/school-erp-web /var/www/schoolmanagementapi/wwwroot/downloads
sudo chmod -R 775 /var/www/school-erp-web /var/www/schoolmanagementapi/wwwroot/downloads

if [ -f /tmp/nginx-school-erp-web.conf ]; then
  sudo cp /tmp/nginx-school-erp-web.conf /etc/nginx/sites-available/school-erp-web
  sudo ln -sf /etc/nginx/sites-available/school-erp-web /etc/nginx/sites-enabled/school-erp-web
  sudo nginx -t
  sudo systemctl reload nginx
  echo "Nginx site school-erp-web enabled."
fi

echo "Done. Web root: /var/www/school-erp-web"
echo "Downloads: /var/www/schoolmanagementapi/wwwroot/downloads"
