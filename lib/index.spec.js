const AssociateWafPlugin = require('.')
const Serverless = require('serverless/lib/Serverless')
const AwsProvider = jest.genMockFromModule('serverless/lib/plugins/aws/provider/awsProvider')
const CLI = jest.genMockFromModule('serverless/lib/classes/CLI')

describe('AssociateWafPlugin', () => {
  let plugin
  let serverless
  let options

  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.serviceObject = {
      name: 'my-service'
    }
    options = {}
    serverless.setProvider('aws', new AwsProvider(serverless))
    serverless.cli = new CLI(serverless)
  })

  describe('constructor', () => {
    beforeEach(() => {
      plugin = new AssociateWafPlugin(serverless, options)
    })

    it('should set the provider to instance of AwsProvider', () => {
      expect(plugin.provider).toBeInstanceOf(AwsProvider)
    })

    it('should have access to the serverless instance', () => {
      expect(plugin.serverless).toEqual(serverless)
    })
  })

  describe('without configuration', () => {
    it('should default to empty config if missing object "custom"', () => {
      serverless.service.custom = undefined
      plugin = new AssociateWafPlugin(serverless, options)

      expect(plugin.config).toEqual({})
    })

    it('should default to empty config if missing object "custom.associateWaf"', () => {
      serverless.service.custom = {}
      plugin = new AssociateWafPlugin(serverless, options)

      expect(plugin.config).toEqual({})
    })

    it('should default to empty config if null object "custom.associateWaf"', () => {
      serverless.service.custom = {
        associateWaf: null
      }
      plugin = new AssociateWafPlugin(serverless, options)

      expect(plugin.config).toEqual({})
    })

    it('should not set hooks if missing property "custom.associateWaf.name"', () => {
      serverless.service.custom = {
        associateWaf: {}
      }
      plugin = new AssociateWafPlugin(serverless, options)

      expect(plugin.hooks).not.toHaveProperty('after:deploy:deploy')
    })

    it('should not set hooks if empty property "custom.associateWaf.name"', () => {
      serverless.service.custom = {
        associateWaf: {
          name: ''
        }
      }
      plugin = new AssociateWafPlugin(serverless, options)

      expect(plugin.hooks).not.toHaveProperty('after:deploy:deploy')
    })
  })

  describe('with configuration', () => {
    beforeEach(() => {
      serverless.service.custom = {
        associateWaf: {
          name: 'stage-service-name'
        }
      }
      plugin = new AssociateWafPlugin(serverless, options)
    })

    it('should set config', () => {
      expect(plugin.config).toBeTruthy()
    })

    it('should set hooks', () => {
      expect(plugin.hooks).toHaveProperty('after:deploy:deploy')
    })
  })

  describe('associateWaf()', () => {
    const mockStackResources = {
      StackResourceSummaries: [
        {
          LogicalResourceId: 'some',
          PhysicalResourceId: 'thing'
        },
        {
          LogicalResourceId: 'ApiGatewayRestApi',
          PhysicalResourceId: 'theRestApiId'
        }
      ]
    }

    beforeEach(() => {
      serverless.service.custom = {
        associateWaf: {
          name: 'some-waf-name'
        }
      }

      plugin = new AssociateWafPlugin(serverless, options)
    })

    it('should not lookup REST API ID from CloudFormation stack if specified by provider configuration', async () => {
      plugin.serverless.service.provider.apiGateway = {
        restApiId: 'something'
      }
      plugin.provider.request.mockResolvedValueOnce({})

      await plugin.associateWaf()

      expect(plugin.provider.request).not.toHaveBeenCalledWith('CloudFormation', expect.anything(), expect.anything())
    })

    it('should log info when unable to find REST API ID from CloudFormation stack', async () => {
      plugin.provider.request.mockResolvedValueOnce({})

      await plugin.associateWaf()

      expect(plugin.serverless.cli.log).toHaveBeenLastCalledWith(expect.stringContaining('Unable to determine REST API ID'))
    })

    it('should log info when unable to find WAF', async () => {
      plugin.provider.request
        .mockResolvedValueOnce(mockStackResources)
        .mockResolvedValueOnce({})

      await plugin.associateWaf()

      expect(plugin.serverless.cli.log).toHaveBeenLastCalledWith(expect.stringContaining('Unable to find WAF named'))
    })

    it('should log error when exception caught', async () => {
      const spy = jest.spyOn(console, 'error')
      const errorMessage = 'Some AWS provider error'
      plugin.provider.request
        .mockRejectedValueOnce(new Error(errorMessage))

      await plugin.associateWaf()

      expect(spy).toHaveBeenLastCalledWith(expect.stringContaining(errorMessage))
    })

    it('should associate WAF', async () => {
      const mockWebAcls = {
        WebACLs: [
          {
            Name: 'skip-waf-name',
            WebACLId: 'skip-waf-id'
          },
          {
            Name: 'some-waf-name',
            WebACLId: 'some-waf-id'
          }
        ]
      }

      plugin.provider.request
        .mockResolvedValueOnce(mockStackResources)
        .mockResolvedValueOnce(mockWebAcls)

      await plugin.associateWaf()

      expect(plugin.serverless.cli.log).toHaveBeenLastCalledWith(expect.stringContaining('Associating WAF...'))
    })
  })
})
