#!/bin/bash

set -eo pipefail

IMAGE_TAG=$1
export DOCKER_BUILDKIT=1
docker build -f ./Dockerfile.scraper_workers . -t 695567787164.dkr.ecr.us-west-2.amazonaws.com/scraper-worker:$IMAGE_TAG
docker push 695567787164.dkr.ecr.us-west-2.amazonaws.com/scraper-worker:$IMAGE_TAG
