var config = require('../config');
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
// websiteConfig
