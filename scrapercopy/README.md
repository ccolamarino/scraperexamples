# `scraper-lambda`

> TODO: description

## Running the scraper as a script

In order to run the stack as browserless you'll need to set up a .env like the following:

```bash
# .env
BROWSER_ENDPOINT=ws://localhost:3000
```

and run the following command

```bash
docker run -p 3000:3000 browserless/chrome
```

After the container on top is running, you can execute the script to run the scraper

```bash
yarn scrape
```

this script will grab all urls in the file `run/urls.yaml` and write the output in `output-{date}.json` (check `urls-example.yml` for reference)

## Creating new scrapers:

Simply run `yarn generate name` and check the file `src/providers/name/scraper.ts`

## Package and upload to Lambda

Before attempting to build and deploy to Lambda; it's good to validate you have all the right dependencies and that the scraper code runs locally:

1. Run `yarn install && yarn build` in the scraper repository root
3. Run `yarn scrape` to run the scraper on files in your `runs/urls.yaml` file (see above for details)

Assuming none of those generate any errors, `cd` back to the repository root and run the following:

```bash
% ./docker_deploy.sh
```

If you do not specify any arguments, the script will use your login name plus the current time (in UTC minutes) as the image tag.

Run `yarn install` and `./docker_deploy.sh` to package and upload to Lambda. Note admin permission is required.

### Using FakeScraper

To test and debug issues related to running in the Lambda environment, we have created a FakeScraper lambda function that is not
connected to any inputs or outputs. (The Lambda environment sets a `SUPPRESS_OUTPUT` environment variable to avoid sending SNS
notifications or saving output to S3.) To deploy an updated version of the code to FakeScraper, just run the following before
running the `docker_deploy` script and the script will update the code in FakeScraper.

```bash
export FAKE=Fake
```

Use the AWS console or command line to invoke the lambda function with test input and inspect output any logs or output to
confirm your code works as expected before deploying to the production Scraper instance.

## Environment Variables

The Scraper Lambda directly uses the following environment variables:

- `AWS_LAMBDA_FUNCTION_NAME`: Used to detect we are running in the Lambda environment. By default, SNS and S3 integration will be
  enabled when this is set.
- `SUPPRESS_OUTPUT`: Set this variable to any non-empty value to disable S3 and SNS integration
- `USE_S3`: Set this variable to any non-empty value to enable S3 integration locally, or to enable only S3 integration in conjunction with
  SUPPRESS_OUTPUT
- `USE_SNS`: Set this variable to any non-empty value to enable SNS integration locally, or to enable only S3 integration in conjunction with
