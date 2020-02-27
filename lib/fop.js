/*!
 * Copyright(c) 2014 Jan Blaha
 *
 * Recipe allowing to print pdf from apache fop
 */

var childProcess = require('child_process')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

function trimMessage (msg, maxLogEntrySize) {
  if (msg.length > maxLogEntrySize) {
    return msg.substring(0, maxLogEntrySize) + '...'
  }

  return msg
}

module.exports = function (reporter, definition) {
  definition.options = definition.options || {}
  definition.options.maxOutputSize = definition.options.maxOutputSize != null ? definition.options.maxOutputSize : 500 * 1024
  definition.options.maxLogEntrySize = definition.options.maxLogEntrySize != null ? definition.options.maxLogEntrySize : 1000

  reporter.extensionsManager.recipes.push({
    name: 'fop-pdf',
    execute: function (request, response) {
      reporter.logger.info('Rendering fop start.', request)

      return reporter
        .writeTempFile(uuid => `${uuid}.fo`, response.content)
        .then(function (result) {
          var foFilePath = result.pathToFile

          reporter.logger.info('Rastering pdf child process start.', request)

          var childArgs = ['-fo', foFilePath, '-pdf', foFilePath.replace('.fo', '.pdf')]

          var isWin = /^win/.test(process.platform)
          var fopFile = 'fop' + (isWin ? '.bat' : '')

          var timeout = reporter.getAvailableRenderTimeout(request)

          var execOptions = {
            maxBuffer: definition.options.maxOutputSize
          }

          if (timeout != null) {
            execOptions.timeout = timeout
            execOptions.killSignal = 'SIGTERM'
          }

          return new Promise(function (resolve, reject) {
            childProcess.execFile(
              fopFile,
              childArgs,
              execOptions,
              function (error, stdout, stderr) {
                var errToReject = error

                reporter.logger.info('Rastering pdf child process end.', request)

                if (errToReject !== null) {
                  reporter.logger.error('fop exec error ' + errToReject, request)

                  // for some reason killSignal does not work here, and instead fop returns code 143 when timeout
                  if (errToReject.killed && errToReject.code === 143 && execOptions.timeout != null) {
                    errToReject = new Error('Timeout Error: fop generation not completed after ' + execOptions.timeout + 'ms')
                  }

                  errToReject.weak = true
                  return reject(errToReject)
                }

                if (!fs.existsSync(childArgs[3])) {
                  return reject(new Error(stderr + stdout))
                }

                if (stdout) {
                  reporter.logger.debug('fop log (stdout): ' + trimMessage(stdout, definition.options.maxLogEntrySize), request)
                }

                if (stderr) {
                  reporter.logger.debug('fop log (stderr): ' + trimMessage(stderr, definition.options.maxLogEntrySize), request)
                }

                response.meta.contentType = 'application/pdf'
                response.meta.fileExtension = 'pdf'

                return fs.readFile(childArgs[3], function (err, buf) {
                  if (err) {
                    return reject(err)
                  }

                  response.content = buf
                  resolve(response)
                })
              }
            )
          })
        })
    }
  })
}
