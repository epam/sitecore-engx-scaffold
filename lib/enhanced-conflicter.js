'use strict';
const path = require('path');
const Conflicter = require('yeoman-generator/lib/util/conflicter');

class EnhancedConflicter extends Conflicter {
  constructor(adapter, force) {
    super(adapter, force);

    this._forceUpdateFilePaths = new Set();
  }

  _registerForceUpdate(filePath) {
    this._forceUpdateFilePaths.add(filePath);
  }

  collision(file, cb) {
    if (!this._forceUpdateFilePaths.has(file.path)) {
      super.collision(file, cb);
      return;
    }

    this.adapter.log.force(path.relative(process.cwd(), file.path));
    cb('force');
  }
}

module.exports = EnhancedConflicter;
