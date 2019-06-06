// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var fs = require('fs-extra');
fs.copySync('static/', 'dist/', { filter: (src, dst) => /\.(css|less)$/ });
