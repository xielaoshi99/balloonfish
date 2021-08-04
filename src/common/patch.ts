/**
 * !!! ensure process.cwd() correct
 */
process.chdir(__dirname.slice(0, __dirname.lastIndexOf('dist')))
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
