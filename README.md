# serverless-associate-waf

[![Build Status](https://travis-ci.org/MikeSouza/serverless-associate-waf.svg?branch=master)](https://travis-ci.org/MikeSouza/serverless-associate-waf)
[![Coverage Status](https://coveralls.io/repos/github/MikeSouza/serverless-associate-waf/badge.svg?branch=master)](https://coveralls.io/github/MikeSouza/serverless-associate-waf?branch=master)

Associate a regional WAF with the AWS API Gateway used by your Serverless stack.

## Install

`npm install serverless-associate-waf --save-dev`

## Configuration

Add the plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-associate-waf
```

### Associating a Regional WAF with the API Gateway

Add your custom configuration:

```yaml
custom:
  associateWaf:
    name: myRegionalWaf
```

| Property | Required | Type     | Default | Description                                                    |
|----------|----------|----------|---------|----------------------------------------------------------------|
| `name`   |  `true`  | `string` |         | The name of the regional WAF to associate the API Gateway with |

### Disassociating a Regional WAF from the API Gateway

Remove the `associateWaf` element from your custom configurtation and deploy the application. The plugin must stay in the plugins list of `serverless.yml` in order for the WAF to be disassociated.

## Usage

Configuration of your `serverless.yml` is all you need.

There are no custom commands, just run: `sls deploy`
