var logUpdate = require('log-update')
var array = require('lodash/array')

function retry (s3, config, allFiles, currentResults, cb) {
  var results = {
    updated: [],
    uploaded: [],
    removed: [],
    errors: []
  }

  var retryFiles = {
    missing: [],
    changed: [],
    extra: currentResults.errors
  }

  function deletionDone (err, data, file) {
    if (err) {
      results.errors.push(file)
    } else {
      results.removed.push(file)
    }
    checkDone(retryFiles, results, function (err, results) {
      cb(err, mergeResults(currentResults, results))
    })
  }

  function uploadDone (err, data, file) {
    if (err) {
      results.errors.push(file)
    } else {
      results.uploaded.push(file)
    }
    checkDone(retryFiles, results, function (err, results) {
      cb(err, mergeResults(currentResults, results))
    })
  }

  logUpdate('Retrying failed actions')
  currentResults.errors.forEach(function (error) {
    if (allFiles.missing.find(function (file) { file === error })) {
      deleteFile(s3, config, error, deletionDone)
    } else {
      uploadFile(s3, config, error, uploadDone)
    }
  })
}

// Perform an action on an array of items, action will be invoked again after
// the prior item has finished
function sequentially (s3, config, action, files, cb, results = {done: [], errors: []}) {
  const index = results.done.length + results.errors.length
  action(s3, config, files[index], function (err, data, file) {
    if (err) {
      results.errors.push(file)
    } else {
      results.done.push(file)
    }

    if (index === files.length - 1) {
      return cb(err, data, results)
    }
    sequentially(s3, config, action, files, cb, results)
  })
}

function chunkedAction (s3, config, action, arr, cb) {
  var result = {
    done: [],
    errors: []
  }

  var numWorkers = 200
  var chunkSize = Math.ceil(arr.length / numWorkers)
  var chunks = array.chunk(arr, chunkSize)
  chunks.forEach(function (chunk) {
    new Promise(function (resolve, reject) {
      action(s3, config, chunk, function (err, data, results) {
        if (err) { console.error(err) }

        result.done = result.done.concat(results.done)
        result.errors = result.errors.concat(results.errors)

        var numFinished = result.done.length + result.errors.length
        if (numFinished === arr.length) { cb(err, data, result) }
        resolve()
      })
    }).catch(function (e) { console.error(e) })
  })

  return result
}

function checkDone (allFiles, results, cb) {
  var files = [allFiles.missing, allFiles.changed, allFiles.extra]
  var finished = [results.uploaded, results.updated, results.removed, results.errors]
  var totalFiles = files.reduce(function (prev, current) {
    return prev.concat(current)
  }, []).length
  var fileResults = finished.reduce(function (prev, current) {
    return prev.concat(current)
  }, []).length

  logUpdate('Finished Uploading ' + fileResults + ' of ' + totalFiles)
  if (fileResults >= totalFiles && cb) {
    if (results.errors.length > 0) { }
    if (totalFiles > 0) { logUpdate('Done Uploading') }
    cb(null, results)
  }
}

module.exports = {
  retry: retry,
  sequentially: sequentially,
  chunkedAction: chunkedAction,
  checkDone: checkDone
}
