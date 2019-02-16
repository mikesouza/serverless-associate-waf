# serverless-associate-waf

Associate a regional WAF with the AWS API Gateway used by your Serverless stack.

## Usage

Add plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-associate-waf
```

Add custom configuration to your `serverless.yml`:

```yaml
custom:
  associateWaf:
    name: myRegionalWaf
```

| Property | Required | Type     | Default | Description                                                    |
|----------|----------|----------|---------|----------------------------------------------------------------|
| `name`   |  `true`  | `string` |         | The name of the regional WAF to associate the API Gateway with |
