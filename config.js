var assert = require('assert')
var util = require('util')

function defaultConfig() {
  return {
    index: 'index.html',
    region: 'us-east-1',
    uploadDir: '.',
    prefix: '',
    corsConfiguration: [],
    enableCloudfront: false,
    retries: 20
  };
}

var templateConfig = Object.assign({},
  defaultConfig(),
  {
    domain: 'sample.bucket.name',
    corsConfiguration: [{
      AllowedMethods: [ /* required */
        'STRING_VALUE_REQUIRED'
        /* more items */
      ],
      AllowedOrigins: [ /* required */
        'STRING_VALUE_REQUIRED'
        /* more items */
      ],
      AllowedHeaders: [
        'STRING_VALUE'
        /* more items */
      ],
      ExposeHeaders: [
        'STRING_VALUE'
        /* more items */
      ],
      MaxAgeSeconds: 0
    }]
  }
)

var defaultBucketConfig = {
  Bucket: '' /* required */
}

var defaultWebsiteConfig = function() {
  return {
    Bucket: '', /* required */
    WebsiteConfiguration: { /* required */
      IndexDocument: {
        Suffix: defaultConfig().index /* required */
      }
    }
  }
}

function isDefaultRegion(config) {
  return config.region === 'us-east-1'
}

function mergeConfig(config, defaultConfig) {
  return Object.assign({}, defaultConfig || {}, config || {});
}

function bucketConfig(config) {
  var transformedConfig = { Bucket: config.domain };
  if(config.region && !isDefaultRegion(config)) {
    Object.assign(
      transformedConfig,
      {
        CreateBucketConfiguration: {
          LocationConstraint: config.region
        }
      }
    )
  }

  return Object.assign(
    transformedConfig,
    config.bucketConfig
  );
}

function loadRoutes (routesOrFile) {
  var routes
  if (typeof routesOrFile === 'string') {
    routes = require(path.resolve(__dirname, routesOrFile))
  } else {
    routes = routesOrFile
  }

  validateRoutes(routes)
  return routes
}

function validateRoutes (routes) {
  assert(Array.isArray(routes), 'Routes must be an array')

  var validProperties = {
    Condition: {
      HttpErrorCodeReturnedEquals: true,
      KeyPrefixEquals: true
    },
    Redirect: {
      HostName: true,
      Protocol: true,
      ReplaceKeyPrefixWith: true,
      ReplaceKeyWith: true,
      HttpRedirectCode: true
    }
  }

  routes.forEach(function (route, idx) {
    validateProps(route, validProperties)
    validateProps(route.Condition, validProperties.Condition)
    validateProps(route.Redirect, validProperties.Redirect)
  })
}

function validateProps (obj, props, idx) {
  var keys = Object.keys(obj)
  assert(keys.length > 0, util.format('Invalid route at index %s', idx))
  keys.forEach(function (key) {
    assert(props[key], util.format('Invalid route property %s at index %s', key, idx))
  })
}


function websiteConfig(config) {
  var transformedConfig = Object.assign(
    defaultWebsiteConfig(),
    { Bucket: config.domain}
  )

  if (config.redirectall) {
    transformedConfig.WebsiteConfiguration = {
      RedirectAllRequestsTo: { HostName: config.redirectall }
    }
  }

  if (config.index && !config.redirectall) {
    transformedConfig.WebsiteConfiguration.IndexDocument.Suffix = config.index
  }

  if (config.error && !config.redirectall) {
    transformedConfig.WebsiteConfiguration.ErrorDocument = { Key: config.error }
  }

  if (config.routes && !config.redirectall) {
    transformedConfig.WebsiteConfiguration.RoutingRules = loadRoutes(config.routes)
  }

  return Object.assign(
    defaultWebsiteConfig(),
    transformedConfig,
    config.websiteConfig
  );
}

function cloudfrontConfig() {
  return null;
}

module.exports = {
  mergeConfig: function(config) { return mergeConfig(config, defaultConfig()) },
  bucketConfig: bucketConfig,
  websiteConfig: websiteConfig,
  cloudfrontConfig: cloudfrontConfig,
  defaultConfig: defaultConfig,
  templateConfig: templateConfig,
  defaultBucketConfig: defaultBucketConfig,
  defaultWebsiteConfig: defaultWebsiteConfig,
};
