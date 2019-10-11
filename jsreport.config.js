module.exports = {
  name: 'fop-pdf',
  main: 'lib/fop.js',
  optionsSchema: {
    extensions: {
      'fop-pdf': {
        type: 'object',
        properties: {
          maxOutputSize: { type: 'number' },
          maxLogEntrySize: { type: 'number' }
        }
      }
    }
  },
  hasPublicPart: false
}
