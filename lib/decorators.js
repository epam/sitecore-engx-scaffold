'use strict';
const EnhancedConflicter = require('./enhanced-conflicter.js');

module.exports = {

  withEnhancedConflicter: function(Generator) {
    return class extends Generator {
      constructor(args, opts) {
        super(args, opts);

        this.conflicter = new EnhancedConflicter(this.conflicter.adapter, this.conflicter.force);
      }

      _updateFileContent(filePath, transformations, options) {
        const { force, ...restOptions } = { force: false, ...options };

        super._updateFileContent(filePath, transformations, restOptions);

        if (force === true) {
          this.conflicter._registerForceUpdate(filePath);
        }
      }
    };
  },

}
