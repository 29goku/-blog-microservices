#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="blog-microservices"
SERVICES=(eureka-server api-gateway user-service post-service comment-service like-dislike-service tag-service)

cd "$(dirname "$0")/.."

for svc in "${SERVICES[@]}"; do
  echo "Building blog/${svc}:local..."
  docker build -f "${svc}/Dockerfile" -t "blog/${svc}:local" .
done

for svc in "${SERVICES[@]}"; do
  echo "Loading blog/${svc}:local into kind cluster ${CLUSTER_NAME}..."
  kind load docker-image "blog/${svc}:local" --name "${CLUSTER_NAME}"
done