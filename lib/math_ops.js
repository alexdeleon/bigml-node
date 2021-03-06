/**
 * Copyright 2017-2018 BigML
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

"use strict";

var NODEJS = ((typeof module !== 'undefined') && module.exports);
var PATH = (NODEJS) ? "./" : "";

var constants = require(PATH + 'constants');
var nj = require('numjs');

exports = {
  broadcast: function (fn) {
    var broadcaster = function (xs) {
      var result = [], index, len;
      if (xs.length == 0) {
        return result;
      }
      else if (xs[0].constructor === Array) {
        result = [];
        for (index = 0, len = xs.length; index < len; index++) {
          result.push(fn(xs[index]));
        }
        return result;
      } else {
        return fn(xs);
      }
    };
    return broadcaster;
  },

  plus: function (mat, vec) {
    var newMat = [], newRow = [], row, index1, len1, index2, len2;
    for (index1 = 0, len1 = mat.length; index1 < len1; index1++) {
      row = mat[index1];
      newRow = [];
      for (index2 = 0, len2 = row.length; index2 < len2; index2++) {
        newRow.push(row[index2] + vec[index2]);
      }
      newMat.push(newRow);
    }
    return newMat;
  },

  minus: function (mat, vec) {
    var newMat = [], newRow = [], row, index1, len1, index2, len2;
    for (index1 = 0, len1 = mat.length; index1 < len1; index1++) {
      row = mat[index1];
      newRow = [];
      for (index2 = 0, len2 = row.length; index2 < len2; index2++) {
        newRow.push(row[index2] - vec[index2]);
      }
      newMat.push(newRow);
    }
    return newMat;
  },

  times: function (mat, vec) {
    var newMat = [], newRow = [], row, index1, len1, index2, len2;
    for (index1 = 0, len1 = mat.length; index1 < len1; index1++) {
      row = mat[index1];
      newRow = [];
      for (index2 = 0, len2 = row.length; index2 < len2; index2++) {
        newRow.push(row[index2] * vec[index2]);
      }
      newMat.push(newRow);
    }
    return newMat;
  },

  divide: function (mat, vec) {
    var newMat = [], newRow = [], row, index1, len1, index2, len2;
    for (index1 = 0, len1 = mat.length; index1 < len1; index1++) {
      row = mat[index1];
      newRow = [];
      for (index2 = 0, len2 = row.length; index2 < len2; index2++) {
        newRow.push(row[index2] / vec[index2]);
      }
      newMat.push(newRow);
    }
    return newMat;
  },

  sigmoid: function(mat) {
    return nj.sigmoid(mat).tolist();
  },

  dot: function(mat1, mat2) {
    var index1, len1, index2, len2, output = [], row1, row2, newRow;
    for (index1 = 0, len1 = mat1.length; index1 < len1; index1++) {
      row1 = mat1[index1];
      newRow = [];
      for (index2 = 0, len2 = mat2.length; index2 < len2; index2++) {
        row2 = mat2[index2];
        newRow = newRow.concat(nj.dot(row1, row2).tolist());
      }
      output.push(newRow);
    }
    return output;
  },

  batchNorm: function(X, mean, stdev, offset, scale) {
    var normVals = exports.divide(exports.minus(X, mean), stdev);
    return exports.plus(exports.times(normVals, scale), offset);
  },

  softplus: function(xs) {
    var newXs = [], index, len, x;
    for (index = 0, len = xs.length; index < len; index++) {
      x = xs[index];
      if (x < constants.LARGE_EXP) {
        newXs.push(Math.log(Math.exp(x) + 1));
      } else {
        newXs.push(x);
      }
    }
    return newXs;
  },

  softmax: function(xs) {
    return nj.softmax(xs).tolist();
  }
}


var ACTIVATORS = {
  'tanh': exports.broadcast(function (xs) {
    var x, newXs = [], index, len;
    for (index = 0, len = xs.length; index < len; index++) {
      x = xs[index];
      newXs.push(Math.tanh(x));
    }
    return newXs;
  }),
  'sigmoid': exports.broadcast(exports.sigmoid),
  'softplus': exports.broadcast(exports.softplus),
  'relu': exports.broadcast(function(xs) {
    var x, newXs = [], index, len;
    for (index = 0, len = xs.length; index < len; index++) {
      x = xs[index];
      if (x <= 0) {
        x = 0;
      }
      newXs.push(x);
    }
    return newXs;
  }),
  'softmax': exports.broadcast(exports.softmax),
  'identity': exports.broadcast(function(xs) {
      var x, newXs = [], index, len;
      for (index = 0, len = xs.length; index < len; index++) {
        x = xs[index];
        newXs.push(1.0 * x);
      }
      return newXs;
    })};


exports.initLayers = function (layers) {
  // check whether we need to parse it
  return layers;
};


exports.destandardize = function (vec, vStats) {
  // vStats constains vMean, vStdev
  var newVec = [], v, index, len;
  for (index = 0, len = vec.length; index < len; index++) {
    v = vec[index];
    newVec.push(v[0] * vStats[1] + vStats[0]);
  }
  return newVec;
};


exports.toWidth = function (mat, width) {
  var output = [], index2, index1, len1, row, newRow = [], ntiles;
  if (width > mat[0].length) {
    ntiles = Math.round(Math.ceil(width / (0.0 + mat[0].length)));
  } else {
    ntiles = 1;
  }
  for (index1 = 0, len1 = mat.length; index1 < len1; index1++) {
    row = mat[index1];
    for (index2 = 0; index2 < ntiles; index2++) {
      newRow = newRow.concat(row);
    }
    newRow = newRow.slice(0, width);
    output.push(newRow);
  }
  return output;
};


exports.addResiduals = function (residuals, identities) {
  var toAdd = exports.toWidth(identities, residuals[0].length),
    newResiduals = [], index, len, newRow, index1, len1, index2, len2, vrow,
    rrow, r, v;
  if (toAdd[0].length != residuals[0].length) {
    throw new Error("Residuals.");
  }
  for (index1 = 0, len1 = toAdd.length; index1 < len1; index1++) {
    vrow = toAdd[index1];
    rrow = residuals[index1];
    newRow = [];
    for (index2 = 0, len2 = rrow.length; index2 < len2; index2++) {
      r = rrow[index2];
      v = vrow[index2];
      newRow.push(r + v);
    }
    newResiduals.push(newRow);
  }
  return newResiduals;
};


exports.propagate = function (xIn, layers) {
  var lastX = xIn, identities = xIn, w, m, s, b, g, afn, index, len, layer,
    xDotw, nextIn;
  for (index = 0, len = layers.length; index < len; index++) {
    layer = layers[index];
    w = layer.weights;
    m = layer.mean;
    s = layer.stdev;
    b = layer.offset;
    g = layer.scale;

    afn = layer['activation_function'];
    xDotw = exports.dot(lastX, w);
    if (typeof m !== 'undefined' && m !== null  &&
        typeof s !== 'undefined' && s !== null) {
      nextIn = exports.batchNorm(xDotw, m, s, b, g)
    } else {
      nextIn = exports.plus(xDotw, b);
    }
    if (layer.residuals) {
      nextIn = exports.addResiduals(nextIn, identities);
      lastX = ACTIVATORS[afn](nextIn);
      identities = lastX;
    } else {
      lastX = ACTIVATORS[afn](nextIn);
    }
  }
  return lastX;
};

exports.sumAndNormalize = function(youts, isRegression) {
  var ysums = [], index, row, len, sumRow, index2, len2, outDist = [],
    isRegression, ysum, rowSum, index3, len3, newRow, yout, sum, norm;
  for (index = 0, len = youts[0].length; index < len; index++) {
    sumRow = [];
    row = youts[0][index];
    for (index2 = 0, len2 = row.length; index2 < len2; index2++) {
      sum = 0.0;
      for (index3 = 0, len3 = youts.length; index3 < len3; index3++) {
        yout = youts[index3];
        sum += yout[index][index2];
      }
      sumRow.push(sum);
    }
    ysums.push(sumRow);
  }

  outDist = [];
  if (isRegression) {
    for (index = 0, len = ysums.length; index < len; index++) {
      ysum = ysums[index];
      norm = ysums.length;
      outDist.push([ysum[0] / norm]);
    }
  } else {
    for (index = 0, len = ysums.length; index < len; index++) {
      ysum = ysums[index];
      rowSum = ysum.reduce(function(a, b) { return a + b; }, 0.0);
      for (index2 = 0, len2 = ysum.length; index2 < len2; index2++) {
        ysum[index2] /= rowSum;
      }
      outDist.push(ysum);
    }
  }
  return outDist;
}

if (NODEJS) {
  module.exports = exports;
}
