# serverless-associate-waf

Associate a regional WAF with the AWS API Gateway used by your Serverless stack.

## Install

`npm install serverless-associate-waf --save-dev`

## Configuration

Add the plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-associate-waf
```

Add your custom configuration:

```yaml
custom:
  associateWaf:
    name: myRegionalWaf
```

| Property | Required | Type     | Default | Description                                                    |
|----------|----------|----------|---------|----------------------------------------------------------------|
| `name`   |  `true`  | `string` |         | The name of the regional WAF to associate the API Gateway with |

## Usage

Configuration of your `serverless.yml` is all you need.

There are no custom commands, just run: `sls deploy`
