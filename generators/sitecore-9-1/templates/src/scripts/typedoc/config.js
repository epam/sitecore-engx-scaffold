module.exports = {
  out: '../documentation',
  module: 'commonjs',
  target: 'es5',
  mode: 'file',
  exclude: ['**/node_modules/**/*.*', '**/*.test.ts', '**/scripts/**/*.*'],
  experimentalDecorators: true,
  includeDeclarations: false,
  excludeExternals: true,
  ignoreCompilerErrors: true,
  verbose: true,
  hideGenerator: true,
};
