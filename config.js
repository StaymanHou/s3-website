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

var defaultWebsiteConfig = {
  Bucket: '', /* required */
  WebsiteConfiguration: { /* required */
    IndexDocument: {
      Suffix: defaultConfig().index /* required */
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

function websiteConfig(config) {
  var transformedConfig = {
    Bucket: config.domain
  };

  if (config.redirectall) {
    websiteConfig.WebsiteConfiguration = {
      RedirectAllRequestsTo: { HostName: config.redirectall }
    }
  }

  if (config.index && !config.redirectall) {
    websiteConfig.WebsiteConfiguration.IndexDocument.Suffix = config.index
  }

  if (config.error && !config.redirectall) {
    websiteConfig.WebsiteConfiguration.ErrorDocument = { Key: config.error }
  }

  if (config.routes && !config.redirectall) {
    websiteConfig.WebsiteConfiguration.RoutingRules = loadRoutes(config.routes)
  }

  return Object.assign(
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
