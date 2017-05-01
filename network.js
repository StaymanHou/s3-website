// TODO extract networky things
function deleteFile (s3, config, file, cb) {
  var params = {
    Bucket: config.domain,
    Key: normalizeKey(config.prefix, file)
  }
  logUpdate('Removing: ' + file)
  s3.deleteObject(params, function (err, data) {
    if (err && cb) { return cb(err, data, file) }
    if (cb) { cb(err, data, file) }
  })
}

function uploadFile (s3, config, file, cb) {
  var params = {
    Bucket: config.domain,
    Key: normalizeKey(config.prefix, file),
    Body: fs.createReadStream(path.join(config.uploadDir, file)),
    ContentType: mime.lookup(file)
  }

  logUpdate('Uploading: ' + file)
  s3.putObject(params, function (err, data) {
    if (err && cb) { return cb(err, data, file) }
    if (cb) { cb(err, data, file) }
  })
}
