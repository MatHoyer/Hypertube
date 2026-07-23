until ./mc alias set local http://minio:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}; do sleep 1; done
./mc mb -p local/movies || true
sed -e "s|__CLIENT_URL__|${CLIENT_URL}|g" /minio-cors-config.xml
./mc cors set local/movies /minio-cors-config.xml
./mc mb -p local/images || true
./mc anonymous set download local/images