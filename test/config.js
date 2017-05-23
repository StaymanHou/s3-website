var config = require('../config')
var constants = require('../constants')
var test = require('tape')

// mergeConfig
test('it should update only given values', function (t) {
  var result = config.mergeConfig({domain: 'test.domain'})
  var expectedResult = Object.assign({}, {domain: 'test.domain'}, config.defaultConfig())
  t.deepEqual(result, expectedResult)
  t.end();
})
test('it should handle no given values', function (t) {
  var result = config.mergeConfig()
  var expectedResult = config.defaultConfig()
  t.deepEqual(result, expectedResult)
  t.end()
})

// bucketConfig
test('it should include bucketConfig', function (t) {
  var testConfig = {
    domain: 'test.domain',
    bucketConfig: {
      ACL: 'public-read'
    }
  }

  var expectedResult = {
    Bucket: 'test.domain',
    ACL: 'public-read'
  }

  var result = config.bucketConfig(testConfig)
  t.deepEqual(result, expectedResult)
  t.end()
})

test('it should not set location constraint for default location', function (t) {
  var defaultRegionConfig = {
    domain: 'test.domain',
    region: constants.defaultRegion
  }

  var nonDefaultRegionConfig = {
    domain: 'test.domain',
    region: constants.regions.euWest1
  }

  var expectedDefaultRegionResult = {
    Bucket: 'test.domain',
  }

  var expectedNonDefaultRegionResult = {
    Bucket: 'test.domain',
    CreateBucketConfiguration: {
      LocationConstraint: constants.regions.euWest1
    }
  }

  var defaultRegionResult = config.bucketConfig(defaultRegionConfig)
  var nonDefaultRegionResult = config.bucketConfig(nonDefaultRegionConfig)
  t.deepEqual(defaultRegionResult, expectedDefaultRegionResult)
  t.deepEqual(nonDefaultRegionResult, expectedNonDefaultRegionResult)
  t.end()
})

// websiteConfig
test('it should include websiteConfig', function (t) {
  var testConfig = {
    domain: 'test.domain',
    websiteConfig: {
      WebsiteConfiguration: {
        ErrorDocument: {
          Key: 'Test Error'
        }
      }
    }
  }

  var expectedResult = {
    Bucket: 'test.domain',
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: 'Test Error'
      }
    }
  }

  var result = config.websiteConfig(testConfig)
  t.deepEqual(result, expectedResult)
  t.end()
})
