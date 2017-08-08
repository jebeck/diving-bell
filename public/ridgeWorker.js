console.log('Worker starting');

('use strict');
(function() {
  self.webgazer = self.webgazer || {};
  self.webgazer.util = self.webgazer.util || {};
  self.webgazer.mat = self.webgazer.mat || {};

  /**
     * Eye class, represents an eye patch detected in the video stream
     * @param {ImageData} patch - the image data corresponding to an eye
     * @param {Number} imagex - x-axis offset from the top-left corner of the video canvas
     * @param {Number} imagey - y-axis offset from the top-left corner of the video canvas
     * @param {Number} width  - width of the eye patch
     * @param {Number} height - height of the eye patch
     */
  self.webgazer.util.Eye = function(patch, imagex, imagey, width, height) {
    this.patch = patch;
    this.imagex = imagex;
    this.imagey = imagey;
    this.width = width;
    this.height = height;
  };

  //Data Window class
  //operates like an array but 'wraps' data around to keep the array at a fixed windowSize
  /**
     * DataWindow class - Operates like an array, but 'wraps' data around to keep the array at a fixed windowSize
     * @param {Number} windowSize - defines the maximum size of the window
     * @param {Array} data - optional data to seed the DataWindow with
     **/
  self.webgazer.util.DataWindow = function(windowSize, data) {
    this.data = [];
    this.windowSize = windowSize;
    this.index = 0;
    this.length = 0;
    if (data) {
      this.data = data.slice(data.length - windowSize, data.length);
      this.length = this.data.length;
    }
  };

  /**
     * [push description]
     * @param  {*} entry - item to be inserted. It either grows the DataWindow or replaces the oldest item
     * @return {DataWindow} this
     */
  self.webgazer.util.DataWindow.prototype.push = function(entry) {
    if (this.data.length < this.windowSize) {
      this.data.push(entry);
      this.length = this.data.length;
      return this;
    }

    //replace oldest entry by wrapping around the DataWindow
    this.data[this.index] = entry;
    this.index = (this.index + 1) % this.windowSize;
    return this;
  };

  /**
     * Get the element at the ind position by wrapping around the DataWindow
     * @param  {Number} ind index of desired entry
     * @return {*}
     */
  self.webgazer.util.DataWindow.prototype.get = function(ind) {
    return this.data[this.getTrueIndex(ind)];
  };

  /**
     * Gets the true this.data array index given an index for a desired element
     * @param {Number} ind - index of desired entry
     * @return {Number} index of desired entry in this.data
     */
  self.webgazer.util.DataWindow.prototype.getTrueIndex = function(ind) {
    if (this.data.length < this.windowSize) {
      return ind;
    } else {
      //wrap around ind so that we can traverse from oldest to newest
      return (ind + this.index) % this.windowSize;
    }
  };

  /**
     * Append all the contents of data
     * @param {Array} data - to be inserted
     */
  self.webgazer.util.DataWindow.prototype.addAll = function(data) {
    for (var i = 0; i < data.length; i++) {
      this.push(data[i]);
    }
  };

  //Helper functions
  /**
     * Grayscales an image patch. Can be used for the whole canvas, detected face, detected eye, etc.
     * @param  {Array} imageData - image data to be grayscaled
     * @param  {Number} imageWidth  - width of image data to be grayscaled
     * @param  {Number} imageHeight - height of image data to be grayscaled
     * @return {Array} grayscaledImage
     */
  self.webgazer.util.grayscale = function(imageData, imageWidth, imageHeight) {
    //TODO implement ourselves to remove dependency
    return tracking.Image.grayscale(imageData, imageWidth, imageHeight, false);
  };

  /**
     * Increase contrast of an image
     * @param {Array} grayscaleImageSrc - grayscale integer array
     * @param {Number} step - sampling rate, control performance
     * @param {Array} destinationImage - array to hold the resulting image
     */
  self.webgazer.util.equalizeHistogram = function(
    grayscaleImageSrc,
    step,
    destinationImage
  ) {
    //TODO implement ourselves to remove dependency
    return objectdetect.equalizeHistogram(
      grayscaleImageSrc,
      step,
      destinationImage
    );
  };

  self.webgazer.util.threshold = function(data, threshold) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] > threshold ? 255 : 0;
    }
    return data;
  };

  self.webgazer.util.correlation = function(data1, data2) {
    const length = Math.min(data1.length, data2.length);
    let count = 0;
    for (let i = 0; i < length; i++) {
      if (data1[i] === data2[i]) {
        count++;
      }
    }
    return count / Math.max(data1.length, data2.length);
  };

  /**
     * Gets an Eye object and resizes it to the desired resolution
     * @param  {webgazer.util.Eye} eye - patch to be resized
     * @param  {Number} resizeWidth - desired width
     * @param  {Number} resizeHeight - desired height
     * @return {webgazer.util.Eye} resized eye patch
     */
  self.webgazer.util.resizeEye = function(eye, resizeWidth, resizeHeight) {
    var canvas = document.createElement('canvas');
    canvas.width = eye.width;
    canvas.height = eye.height;

    canvas.getContext('2d').putImageData(eye.patch, 0, 0);

    var tempCanvas = document.createElement('canvas');

    tempCanvas.width = resizeWidth;
    tempCanvas.height = resizeHeight;

    // save the canvas into temp canvas
    tempCanvas
      .getContext('2d')
      .drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        resizeWidth,
        resizeHeight
      );

    return tempCanvas
      .getContext('2d')
      .getImageData(0, 0, resizeWidth, resizeHeight);
  };

  /**
     * Checks if the prediction is within the boundaries of the viewport and constrains it
     * @param  {Array} prediction [x,y] - predicted gaze coordinates
     * @return {Array} constrained coordinates
     */
  self.webgazer.util.bound = function(prediction) {
    if (prediction.x < 0) prediction.x = 0;
    if (prediction.y < 0) prediction.y = 0;
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    if (prediction.x > w) {
      prediction.x = w;
    }

    if (prediction.y > h) {
      prediction.y = h;
    }
    return prediction;
  };

  /**
     * Write statistics in debug paragraph panel
     * @param {HTMLElement} para - The <p> tag where write data
     * @param {Object} stats - The stats data to output
     */
  function debugBoxWrite(para, stats) {
    var str = '';
    for (var key in stats) {
      str += key + ': ' + stats[key] + '\n';
    }
    para.innerText = str;
  }

  /**
     * Constructor of DebugBox object,
     * it insert an paragraph inside a div to the body, in view to display debug data
     * @param {Number} interval - The log interval
     * @constructor
     */
  self.webgazer.util.DebugBox = function(interval) {
    this.para = document.createElement('p');
    this.div = document.createElement('div');
    this.div.appendChild(this.para);
    document.body.appendChild(this.div);

    this.buttons = {};
    this.canvas = {};
    this.stats = {};
    var updateInterval = interval || 300;
    (function(localThis) {
      setInterval(function() {
        debugBoxWrite(localThis.para, localThis.stats);
      }, updateInterval);
    })(this);
  };

  /**
     * Add stat data for log
     * @param {String} key - The data key
     * @param {*} value - The value
     */
  self.webgazer.util.DebugBox.prototype.set = function(key, value) {
    this.stats[key] = value;
  };

  /**
     * Initialize stats in case where key does not exist, else
     * increment value for key
     * @param {String} key - The key to process
     * @param {Number} incBy - Value to increment for given key (default: 1)
     * @param {Number} init - Initial value in case where key does not exist (default: 0)
     */
  self.webgazer.util.DebugBox.prototype.inc = function(key, incBy, init) {
    if (!this.stats[key]) {
      this.stats[key] = init || 0;
    }
    this.stats[key] += incBy || 1;
  };

  /**
     * Create a button and register the given function to the button click event
     * @param {String} name - The button name to link
     * @param {Function} func - The onClick callback
     */
  self.webgazer.util.DebugBox.prototype.addButton = function(name, func) {
    if (!this.buttons[name]) {
      this.buttons[name] = document.createElement('button');
      this.div.appendChild(this.buttons[name]);
    }
    var button = this.buttons[name];
    this.buttons[name] = button;
    button.addEventListener('click', func);
    button.innerText = name;
  };

  /**
     * Search for a canvas elemenet with name, or create on if not exist.
     * Then send the canvas element as callback parameter.
     * @param {String} name - The canvas name to send/create
     * @param {Function} func - The callback function where send canvas
     */
  self.webgazer.util.DebugBox.prototype.show = function(name, func) {
    if (!this.canvas[name]) {
      this.canvas[name] = document.createElement('canvas');
      this.div.appendChild(this.canvas[name]);
    }
    var canvas = this.canvas[name];
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    func(canvas);
  };

  /**
     * Kalman Filter constructor
     * Kalman filters work by reducing the amount of noise in a models.
     * https://blog.cordiner.net/2011/05/03/object-tracking-using-a-kalman-filter-matlab/
     *
     * @param {Array.<Array.<Number>>} F - transition matrix
     * @param {Array.<Array.<Number>>} Q - process noise matrix
     * @param {Array.<Array.<Number>>} H - maps between measurement vector and noise matrix
     * @param {Array.<Array.<Number>>} R - defines measurement error of the device
     * @param {Array} P_initial - the initial state
     * @param {Array} X_initial - the initial state of the device
     */
  self.webgazer.util.KalmanFilter = function(F, H, Q, R, P_initial, X_initial) {
    this.F = F; // State transition matrix
    this.Q = Q; // Process noise matrix
    this.H = H; // Transformation matrix
    this.R = R; // Measurement Noise
    this.P = P_initial; //Initial covariance matrix
    this.X = X_initial; //Initial guess of measurement
  };

  /**
     * Get Kalman next filtered value and update the internal state
     * @param {Array} z - the new measurement
     * @return {Array}
     */
  self.webgazer.util.KalmanFilter.prototype.update = function(z) {
    // Here, we define all the different matrix operations we will need
    var add = numeric.add,
      sub = numeric.sub,
      inv = numeric.inv,
      identity = numeric.identity;
    var mult = webgazer.mat.mult,
      transpose = webgazer.mat.transpose;
    //TODO cache variables like the transpose of H

    // prediction: X = F * X  |  P = F * P * F' + Q
    var X_p = mult(this.F, this.X); //Update state vector
    var P_p = add(mult(mult(this.F, this.P), transpose(this.F)), this.Q); //Predicted covaraince

    //Calculate the update values
    var y = sub(z, mult(this.H, X_p)); // This is the measurement error (between what we expect and the actual value)
    var S = add(mult(mult(this.H, P_p), transpose(this.H)), this.R); //This is the residual covariance (the error in the covariance)

    // kalman multiplier: K = P * H' * (H * P * H' + R)^-1
    var K = mult(P_p, mult(transpose(this.H), inv(S))); //This is the Optimal Kalman Gain

    //We need to change Y into it's column vector form
    for (var i = 0; i < y.length; i++) {
      y[i] = [y[i]];
    }

    //Now we correct the internal values of the model
    // correction: X = X + K * (m - H * X)  |  P = (I - K * H) * P
    this.X = add(X_p, mult(K, y));
    this.P = mult(sub(identity(K.length), mult(K, this.H)), P_p);
    return transpose(mult(this.H, this.X))[0]; //Transforms the predicted state back into it's measurement form
  };
})();

(function() {
  'use strict';

  self.webgazer = self.webgazer || {};
  self.webgazer.mat = self.webgazer.mat || {};

  /**
     * Transposes an mxn array
     * @param {Array.<Array.<Number>>} matrix - of 'M x N' dimensionality
     * @return {Array.<Array.<Number>>} transposed matrix
     */
  self.webgazer.mat.transpose = function(matrix) {
    var m = matrix.length;
    var n = matrix[0].length;
    var transposedMatrix = new Array(n);

    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        if (i === 0) transposedMatrix[j] = new Array(m);
        transposedMatrix[j][i] = matrix[i][j];
      }
    }

    return transposedMatrix;
  };

  /**
     * Get a sub-matrix of matrix
     * @param {Array.<Array.<Number>>} matrix - original matrix
     * @param {Array.<Number>} r - Array of row indices
     * @param {Number} j0 - Initial column index
     * @param {Number} j1 - Final column index
     * @returns {Array} The sub-matrix matrix(r(:),j0:j1)
     */
  self.webgazer.mat.getMatrix = function(matrix, r, j0, j1) {
    var X = new Array(r.length),
      m = j1 - j0 + 1;

    for (var i = 0; i < r.length; i++) {
      X[i] = new Array(m);
      for (var j = j0; j <= j1; j++) {
        X[i][j - j0] = matrix[r[i]][j];
      }
    }
    return X;
  };

  /**
     * Get a submatrix of matrix
     * @param {Array.<Array.<Number>>} matrix - original matrix
     * @param {Number} i0 - Initial row index
     * @param {Number} i1 - Final row index
     * @param {Number} j0 - Initial column index
     * @param {Number} j1 - Final column index
     * @return {Array} The sub-matrix matrix(i0:i1,j0:j1)
     */
  self.webgazer.mat.getSubMatrix = function(matrix, i0, i1, j0, j1) {
    var size = j1 - j0 + 1,
      X = new Array(i1 - i0 + 1);

    for (var i = i0; i <= i1; i++) {
      var subI = i - i0;

      X[subI] = new Array(size);

      for (var j = j0; j <= j1; j++) {
        X[subI][j - j0] = matrix[i][j];
      }
    }
    return X;
  };

  /**
     * Linear algebraic matrix multiplication, matrix1 * matrix2
     * @param {Array.<Array.<Number>>} matrix1
     * @param {Array.<Array.<Number>>} matrix2
     * @return {Array.<Array.<Number>>} Matrix product, matrix1 * matrix2
     */
  self.webgazer.mat.mult = function(matrix1, matrix2) {
    if (matrix2.length != matrix1[0].length) {
      console.log('Matrix inner dimensions must agree.');
    }

    var X = new Array(matrix1.length),
      Bcolj = new Array(matrix1[0].length);

    for (var j = 0; j < matrix2[0].length; j++) {
      for (var k = 0; k < matrix1[0].length; k++) {
        Bcolj[k] = matrix2[k][j];
      }
      for (var i = 0; i < matrix1.length; i++) {
        if (j === 0) X[i] = new Array(matrix2[0].length);

        var Arowi = matrix1[i];
        var s = 0;
        for (var k = 0; k < matrix1[0].length; k++) {
          s += Arowi[k] * Bcolj[k];
        }
        X[i][j] = s;
      }
    }
    return X;
  };

  /**
     * LUDecomposition to solve A*X = B, based on WEKA code
     * @param {Array.<Array.<Number>>} A - left matrix of equation to be solved
     * @param {Array.<Array.<Number>>} B - right matrix of equation to be solved
     * @return {Array.<Array.<Number>>} X so that L*U*X = B(piv,:)
     */
  self.webgazer.mat.LUDecomposition = function(A, B) {
    var LU = new Array(A.length);

    for (var i = 0; i < A.length; i++) {
      LU[i] = new Array(A[0].length);
      for (var j = 0; j < A[0].length; j++) {
        LU[i][j] = A[i][j];
      }
    }

    var m = A.length;
    var n = A[0].length;
    var piv = new Array(m);
    for (var i = 0; i < m; i++) {
      piv[i] = i;
    }
    var pivsign = 1;
    var LUrowi = new Array();
    var LUcolj = new Array(m);
    // Outer loop.
    for (var j = 0; j < n; j++) {
      // Make a copy of the j-th column to localize references.
      for (var i = 0; i < m; i++) {
        LUcolj[i] = LU[i][j];
      }
      // Apply previous transformations.
      for (var i = 0; i < m; i++) {
        LUrowi = LU[i];
        // Most of the time is spent in the following dot product.
        var kmax = Math.min(i, j);
        var s = 0;
        for (var k = 0; k < kmax; k++) {
          s += LUrowi[k] * LUcolj[k];
        }
        LUrowi[j] = LUcolj[i] -= s;
      }
      // Find pivot and exchange if necessary.
      var p = j;
      for (var i = j + 1; i < m; i++) {
        if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
          p = i;
        }
      }
      if (p != j) {
        for (var k = 0; k < n; k++) {
          var t = LU[p][k];
          LU[p][k] = LU[j][k];
          LU[j][k] = t;
        }
        var k = piv[p];
        piv[p] = piv[j];
        piv[j] = k;
        pivsign = -pivsign;
      }
      // Compute multipliers.
      if ((j < m) & (LU[j][j] != 0)) {
        for (var i = j + 1; i < m; i++) {
          LU[i][j] /= LU[j][j];
        }
      }
    }
    if (B.length != m) {
      console.log('Matrix row dimensions must agree.');
    }
    for (var j = 0; j < n; j++) {
      if (LU[j][j] === 0) {
        console.log('Matrix is singular.');
      }
    }
    var nx = B[0].length;
    var X = self.webgazer.mat.getMatrix(B, piv, 0, nx - 1);
    // Solve L*Y = B(piv,:)
    for (var k = 0; k < n; k++) {
      for (var i = k + 1; i < n; i++) {
        for (var j = 0; j < nx; j++) {
          X[i][j] -= X[k][j] * LU[i][k];
        }
      }
    }
    // Solve U*X = Y;
    for (var k = n - 1; k >= 0; k--) {
      for (var j = 0; j < nx; j++) {
        X[k][j] /= LU[k][k];
      }
      for (var i = 0; i < k; i++) {
        for (var j = 0; j < nx; j++) {
          X[i][j] -= X[k][j] * LU[i][k];
        }
      }
    }
    return X;
  };

  /**
     * Least squares solution of A*X = B, based on WEKA code
     * @param {Array.<Array.<Number>>} A - left side matrix to be solved
     * @param {Array.<Array.<Number>>} B - a matrix with as many rows as A and any number of columns.
     * @return {Array.<Array.<Number>>} X - that minimizes the two norms of QR*X-B.
     */
  self.webgazer.mat.QRDecomposition = function(A, B) {
    // Initialize.
    var QR = new Array(A.length);

    for (var i = 0; i < A.length; i++) {
      QR[i] = new Array(A[0].length);
      for (var j = 0; j < A[0].length; j++) {
        QR[i][j] = A[i][j];
      }
    }
    var m = A.length;
    var n = A[0].length;
    var Rdiag = new Array(n);
    var nrm;

    // Main loop.
    for (var k = 0; k < n; k++) {
      // Compute 2-norm of k-th column without under/overflow.
      nrm = 0;
      for (var i = k; i < m; i++) {
        nrm = Math.hypot(nrm, QR[i][k]);
      }
      if (nrm != 0) {
        // Form k-th Householder vector.
        if (QR[k][k] < 0) {
          nrm = -nrm;
        }
        for (var i = k; i < m; i++) {
          QR[i][k] /= nrm;
        }
        QR[k][k] += 1;

        // Apply transformation to remaining columns.
        for (var j = k + 1; j < n; j++) {
          var s = 0;
          for (var i = k; i < m; i++) {
            s += QR[i][k] * QR[i][j];
          }
          s = -s / QR[k][k];
          for (var i = k; i < m; i++) {
            QR[i][j] += s * QR[i][k];
          }
        }
      }
      Rdiag[k] = -nrm;
    }
    if (B.length != m) {
      console.log('Matrix row dimensions must agree.');
    }
    for (var j = 0; j < n; j++) {
      if (Rdiag[j] === 0) console.log('Matrix is rank deficient');
    }
    // Copy right hand side
    var nx = B[0].length;
    var X = new Array(B.length);
    for (var i = 0; i < B.length; i++) {
      X[i] = new Array(B[0].length);
    }
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < B[0].length; j++) {
        X[i][j] = B[i][j];
      }
    }
    // Compute Y = transpose(Q)*B
    for (var k = 0; k < n; k++) {
      for (var j = 0; j < nx; j++) {
        var s = 0.0;
        for (var i = k; i < m; i++) {
          s += QR[i][k] * X[i][j];
        }
        s = -s / QR[k][k];
        for (var i = k; i < m; i++) {
          X[i][j] += s * QR[i][k];
        }
      }
    }
    // Solve R*X = Y;
    for (var k = n - 1; k >= 0; k--) {
      for (var j = 0; j < nx; j++) {
        X[k][j] /= Rdiag[k];
      }
      for (var i = 0; i < k; i++) {
        for (var j = 0; j < nx; j++) {
          X[i][j] -= X[k][j] * QR[i][k];
        }
      }
    }
    return self.webgazer.mat.getSubMatrix(X, 0, n - 1, 0, nx - 1);
  };
})();

var ridgeParameter = Math.pow(10, -5);
var resizeWidth = 10;
var resizeHeight = 6;
var dataWindow = 700;
var trailDataWindow = 10;
var trainInterval = 500;

var screenXClicksArray = new self.webgazer.util.DataWindow(dataWindow);
var screenYClicksArray = new self.webgazer.util.DataWindow(dataWindow);
var eyeFeaturesClicks = new self.webgazer.util.DataWindow(dataWindow);

var screenXTrailArray = new self.webgazer.util.DataWindow(trailDataWindow);
var screenYTrailArray = new self.webgazer.util.DataWindow(trailDataWindow);
var eyeFeaturesTrail = new self.webgazer.util.DataWindow(trailDataWindow);

var dataClicks = new self.webgazer.util.DataWindow(dataWindow);
var dataTrail = new self.webgazer.util.DataWindow(dataWindow);

/**
 * Performs ridge regression, according to the Weka code.
 * @param {array} y corresponds to screen coordinates (either x or y) for each of n click events
 * @param {array of arrays} X corresponds to gray pixel features (120 pixels for both eyes) for each of n clicks
 * @param {array} ridge ridge parameter
 * @return{array} regression coefficients
 */
function ridge(y, X, k) {
  var nc = X[0].length;
  var m_Coefficients = new Array(nc);
  var xt = self.webgazer.mat.transpose(X);
  var solution = new Array();
  var success = true;
  do {
    var ss = self.webgazer.mat.mult(xt, X);
    // Set ridge regression adjustment
    for (var i = 0; i < nc; i++) {
      ss[i][i] = ss[i][i] + k;
    }

    // Carry out the regression
    var bb = self.webgazer.mat.mult(xt, y);
    for (var i = 0; i < nc; i++) {
      m_Coefficients[i] = bb[i][0];
    }
    try {
      var n =
        m_Coefficients.length != 0
          ? m_Coefficients.length / m_Coefficients.length
          : 0;
      if (m_Coefficients.length * n != m_Coefficients.length) {
        console.log('Array length must be a multiple of m');
      }
      solution =
        ss.length == ss[0].length
          ? self.webgazer.mat.LUDecomposition(ss, bb)
          : self.webgazer.mat.QRDecomposition(ss, bb);

      for (var i = 0; i < nc; i++) {
        m_Coefficients[i] = solution[i][0];
      }
      success = true;
    } catch (ex) {
      k *= 10;
      console.log(ex);
      success = false;
    }
  } while (!success);
  return m_Coefficients;
}

function getCurrentFixationIndex() {
  var index = 0;
  var recentX = this.screenXTrailArray.get(0);
  var recentY = this.screenYTrailArray.get(0);
  for (var i = this.screenXTrailArray.length - 1; i >= 0; i--) {
    var currX = this.screenXTrailArray.get(i);
    var currY = this.screenYTrailArray.get(i);
    var euclideanDistance = Math.sqrt(
      Math.pow(currX - recentX, 2) + Math.pow(currY - recentY, 2)
    );
    if (euclideanDistance > 72) {
      return i + 1;
    }
  }
  return i;
}

self.onmessage = function(event) {
  var data = event.data;
  var screenPos = data['screenPos'];
  var eyes = data['eyes'];
  var type = data['type'];
  if (type === 'click') {
    self.screenXClicksArray.push([screenPos[0]]);
    self.screenYClicksArray.push([screenPos[1]]);

    self.eyeFeaturesClicks.push(eyes);
  } else if (type === 'move') {
    self.screenXTrailArray.push([screenPos[0]]);
    self.screenYTrailArray.push([screenPos[1]]);

    self.eyeFeaturesTrail.push(eyes);
    self.dataTrail.push({ eyes: eyes, screenPos: screenPos, type: type });
  }
  self.needsTraining = true;
};

function retrain() {
  if (self.screenXClicksArray.length == 0) {
    return;
  }
  if (!self.needsTraining) {
    return;
  }
  var screenXArray = self.screenXClicksArray.data.concat(
    self.screenXTrailArray.data
  );
  var screenYArray = self.screenYClicksArray.data.concat(
    self.screenYTrailArray.data
  );
  var eyeFeatures = self.eyeFeaturesClicks.data.concat(
    self.eyeFeaturesTrail.data
  );

  var coefficientsX = ridge(screenXArray, eyeFeatures, ridgeParameter);
  var coefficientsY = ridge(screenYArray, eyeFeatures, ridgeParameter);
  self.postMessage({ X: coefficientsX, Y: coefficientsY });
  self.needsTraining = false;
}

setInterval(retrain, trainInterval);
