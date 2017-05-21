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
  var testConfig = {
    domain: 'test.domain',
    region: constants.defaultRegion
  }

  var expectedResult = {
    Bucket: 'test.domain',
  }

  var result = config.bucketConfig(testConfig)
  t.deepEqual(result, expectedResult)
  t.end()
})

// websiteConfig
