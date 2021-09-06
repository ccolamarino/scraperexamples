#!/bin/bash

set -eo pipefail

IMAGE_TAG=$1
if [ ! $IMAGE_TAG ]
then
    export IMAGE_TAG=`whoami`-`date -u "+%Y-%m-%d-%H-%M"`
fi
echo "Using $IMAGE_TAG as IMAGE_TAG"
export DOCKER_BUILDKIT=1
docker build -f ./Dockerfile.scrapers . -t 695567787164.dkr.ecr.us-west-2.amazonaws.com/scraper-lambda:$IMAGE_TAG
docker login -u AWS -p `aws ecr get-login-password` 695567787164.dkr.ecr.us-west-2.amazonaws.com
docker push 695567787164.dkr.ecr.us-west-2.amazonaws.com/scraper-lambda:$IMAGE_TAG
AWS_REGION=us-west-2 aws lambda update-function-code --function-name "$FAKE"Scraper --image-uri "695567787164.dkr.ecr.us-west-2.amazonaws.com/scraper-lambda:$IMAGE_TAG"
