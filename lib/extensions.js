'use strict';
const path = require('path');

module.exports = {

  withConflictExclusions: function(BaseGenerator) {
    return class extends BaseGenerator {
      constructor(args, opts) {
        super(args, opts);

        this._conflictExclusions = [];
        this._extendConflicter();
      }

      _updateFileContent(filePath, pipeline, options) {
        const { force } = options || {};

        super._updateFileContent(filePath, pipeline);

        if (force === true) {
          this._conflictExclusions.push(filePath);
        }
      }

      _extendConflicter() {
        const self = this;

        const collision = self.conflicter.collision;
        self.conflicter.collision = function(file, cb) {
          if (!self._conflictExclusions.includes(file.path)) {
            collision.call(this, file, cb);
            return;
          }

          this.adapter.log.force(path.relative(process.cwd(), file.path));
          cb('write');
        };
      }
    };
  },

}
