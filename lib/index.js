'use strict'

const chalk = require('chalk')

const get = (obj, path, defaultValue) => {
  return path.split('.').filter(Boolean).every(step => !(step && !(obj = obj[step]))) ? obj : defaultValue
}

class AssociateWafPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.provider = this.serverless.providers.aws

    this.config = get(this.serverless.service, 'custom.associateWaf', {})

    this.hooks = {}

    this.hooks['after:deploy:deploy'] = this.updateWafAssociation.bind(this)
    this.hooks['before:remove:remove'] = this.disassociateWaf.bind(this)
  }

  defaultStackName() {
    return `${this.serverless.service.getServiceName()}-${this.provider.getStage()}`
  }

  getApiGatewayStageArn(restApiId) {
    return `arn:aws:apigateway:${this.provider.getRegion()}::/restapis/${restApiId}/stages/${this.provider.getStage()}`
  }

  async updateWafAssociation() {
    if ((this.config) && (this.config.name) && (this.config.name.trim().length != 0)){
      await this.associateWaf();
    } else {
      await this.disassociateWaf();
    }
  }

  async findWebAclByName(name) {
    const response = await this.provider.request('WAFRegional', 'listWebACLs', { Limit: 100 })
    if (response.WebACLs) {
      for (let webAcl of response.WebACLs) {
        if (name === webAcl.Name) {
          return webAcl.WebACLId
        }
      }
    }
  }

  async findStackResourceByLogicalId(stackName, logicalId) {
    const response = await this.provider.request('CloudFormation', 'listStackResources', { StackName: stackName })
    if (response.StackResourceSummaries) {
      for (let resourceSummary of response.StackResourceSummaries) {
        if (logicalId === resourceSummary.LogicalResourceId) {
          return resourceSummary
        }
      }
    }
  }

  async getRestApiId() {
    const apiGateway = this.serverless.service.provider.apiGateway
    if (apiGateway && apiGateway.restApiId) {
      return apiGateway.restApiId
    }

    const stackName = this.serverless.service.provider.stackName || this.defaultStackName();

    const stackResource = await this.findStackResourceByLogicalId(stackName, 'ApiGatewayRestApi')
    if (stackResource && stackResource.PhysicalResourceId) {
      return stackResource.PhysicalResourceId
    }
  }

  async associateWaf() {
    try {
      const restApiId = await this.getRestApiId()
      if (!restApiId) {
        this.serverless.cli.log('Unable to determine REST API ID')
        return
      }

      const webAclId = await this.findWebAclByName(this.config.name)
      if (!webAclId) {
        this.serverless.cli.log(`Unable to find WAF named '${this.config.name}'`)
        return
      }

      const params = {
        ResourceArn: this.getApiGatewayStageArn(restApiId),
        WebACLId: webAclId
      }

      this.serverless.cli.log('Associating WAF...')
      await this.provider.request('WAFRegional', 'associateWebACL', params)
    } catch (e) {
      console.error(chalk.red(`\n-------- Associate WAF Error --------\n${e.message}`))
    }
  }

  async disassociateWaf() {
    try {
      const restApiId = await this.getRestApiId()
      if (!restApiId) {
        this.serverless.cli.log('Unable to determine REST API ID')
        return
      }

      const params = {
        ResourceArn: this.getApiGatewayStageArn(restApiId)
      }

      const webACLForResource = await this.provider.request('WAFRegional', 'getWebACLForResource', params)
      if (webACLForResource.WebACLSummary){
        this.serverless.cli.log('Disassociating WAF...')
        await this.provider.request('WAFRegional', 'disassociateWebACL', params)
      }

    } catch (e) {
      console.error(chalk.red(`\n-------- Disassociate WAF Error --------\n${e.message}`))
    }
  }
}

module.exports = AssociateWafPlugin
