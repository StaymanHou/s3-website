var defaultConfig = {
  index: 'index.html',
  region: 'us-east-1',
  uploadDir: '.',
  prefix: '',
  corsConfiguration: [],
  enableCloudfront: false,
  retries: 20
}

var templateConfig = Object.assign({},
  defaultConfig,
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
      Suffix: defaultConfig.index /* required */
    }
  }
}

module.exports = {
  defaultConfig: defaultConfig,
  templateConfig: templateConfig,
  defaultBucketConfig: defaultBucketConfig,
  defaultWebsiteConfig: defaultWebsiteConfig,
}
