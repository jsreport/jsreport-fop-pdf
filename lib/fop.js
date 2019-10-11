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

          return new Promise(function (resolve, reject) {
            childProcess.execFile(
              fopFile,
              childArgs,
              {
                maxBuffer: definition.options.maxOutputSize
              },
              function (error, stdout, stderr) {
                reporter.logger.info('Rastering pdf child process end.', request)

                if (error !== null) {
                  reporter.logger.error('fop exec error ' + error, request)
                  error.weak = true
                  return reject(error)
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
