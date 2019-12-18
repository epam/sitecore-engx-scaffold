'use strict';
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const shell = require('node-powershell');
const chalk = require('chalk');

const guid = function (input) {
  if (!input || input.length < 1) { // no parameter supplied
    return uuidv4(); // return guid v4() uuid
  } else { // create a consistent (non-random!) UUID
    let hash = crypto.createHash('sha256').update(input.toString()).digest('hex').substring(0, 36);
    let chars = hash.split('');
    chars[8] = '-';
    chars[13] = '-';
    // chars[14] = '4';
    chars[18] = '-';
    // chars[19] = '8';
    chars[23] = '-';
    hash = chars.join('');
    return hash;
  }
};

module.exports = {
  escapeRegExp: function (input) {
    if (typeof input === 'undefined') {
      return '';
    }
    return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  },
  guid: guid,
  generateHashBasedItemIdsInYamlFile: function (content, path, replaceParentID) {
    let result = content;

    const pathRegex = new RegExp(/^Path: ((\/[^/\r\n]+(?:\/[^/\r\n]+)+)\/(?:[^/\r\n]+))$/, 'gm');
    const matches = pathRegex.exec(result);

    if (matches.length > 2) {
      const ymlPath = matches[1];
      const ymlParentPath = matches[2];

      // Replace template item ID with ID generated from path hash
      const hashedID = guid(ymlPath);
      result = result.replace(/^ID: ".+?"$/gmi, 'ID: "' + hashedID + '"');

      // Generate Parent hash-based ID only for Layers Roots
      if (replaceParentID) {
        const hashedParentID = guid(ymlParentPath);
        result = result.replace(/^Parent: ".+?"$/gmi, 'Parent: "' + hashedParentID + '"');
      }
    }

    return result;
  },

  addCredentialsToWindowsVault: async function (ip, username, password) {
    const ps = new shell({
      executionPolicy: 'Unrestricted'
    });

    ps.addCommand(`cmdkey /delete:${ip}; cmdkey /add:${ip} /user:${username} /pass:${password};`);

    try {
      const output = await ps.invoke();
      console.log(chalk.green.bold('SUCCESS: credentials added to Windows Vault'));
      console.log(output);
    } catch (err) {
      console.log(chalk.red.bold('FAILED: failed to add credentials'));
      console.log(chalk.red.bold(err));
    } finally {
      ps.dispose();
    }
  },

  getCommonPath: function (filePath) {
    if (Array.isArray(filePath)) {
      filePath = filePath
        .filter(notNullOrExclusion)
        .map(this.getCommonPath.bind(this));

      return commondir(filePath);
    }

    const globStartIndex = filePath.indexOf('*');
    if (globStartIndex !== -1) {
      filePath = filePath.substring(0, globStartIndex + 1);
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return filePath;
    }

    return path.dirname(filePath);
  },
  
  getFileName: function(filePath)
  {
	  return path.basename(filePath);
  }
}