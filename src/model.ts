/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs';

// This is a helper class for loading and managing MNIST data specifically.
// It is a useful example of how you could create your own data manager class
// for arbitrary data though. It's worth a look :)
import { IMAGE_H, IMAGE_W, MnistData } from './data';

// This is a helper class for drawing loss graphs and MNIST images to the
// window. For the purposes of understanding the machine learning bits, you can
// largely ignore it
// import * as ui from './ui';

/**
 * Creates a convolutional neural network (Convnet) for the MNIST data.
 *
 * @returns {tf.Model} An instance of tf.Model.
 */
function createConvModel() {
  // Create a sequential neural network model. tf.sequential provides an API
  // for creating "stacked" models where the output from one layer is used as
  // the input to the next layer.
  const model = tf.sequential();

  // The first layer of the convolutional neural network plays a dual role:
  // it is both the input layer of the neural network and a layer that performs
  // the first convolution operation on the input. It receives the 28x28 pixels
  // black and white images. This input layer uses 16 filters with a kernel size
  // of 5 pixels each. It uses a simple RELU activation function which pretty
  // much just looks like this: __/
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_H, IMAGE_W, 1],
    kernelSize: 3,
    filters: 16,
    activation: 'relu'
  }));

  // After the first layer we include a MaxPooling layer. This acts as a sort of
  // downsampling using max values in a region instead of averaging.
  // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  // Our third layer is another convolution, this time with 32 filters.
  model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));

  // Max pooling again.
  model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

  // Add another conv2d layer.
  model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));

  // Now we flatten the output from the 2D filters into a 1D vector to prepare
  // it for input into our last layer. This is common practice when feeding
  // higher dimensional data to a final classification output layer.
  model.add(tf.layers.flatten({}));

  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));

  // Our last layer is a dense layer which has 10 output units, one for each
  // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
  // represent numbers, but it's the same idea if you had classes that
  // represented other entities like dogs and cats (two output classes: 0, 1).
  // We use the softmax function as the activation for the output layer as it
  // creates a probability distribution over our 10 classes so their output
  // values sum to 1.
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));

  return model;
}

/**
 * Creates a model consisting of only flatten, dense and dropout layers.
 *
 * The model create here has approximately the same number of parameters
 * (~31k) as the convnet created by `createConvModel()`, but is
 * expected to show a significantly worse accuracy after training, due to the
 * fact that it doesn't utilize the spatial information as the convnet does.
 *
 * This is for comparison with the convolutional network above.
 *
 * @returns {tf.Model} An instance of tf.Model.
 */
function createDenseModel() {
  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [IMAGE_H, IMAGE_W, 1] }));
  model.add(tf.layers.dense({ units: 42, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));
  return model;
}

/**
 * Compile and train the given model.
 *
 * @param {*} model The model to
 */
async function train(model: any, setState: any, trainingEpochs: number) {

  // Now that we've defined our model, we will define our optimizer. The
  // optimizer will be used to optimize our model's weight values during
  // training so that we can decrease our training loss and increase our
  // classification accuracy.

  // The learning rate defines the magnitude by which we update our weights each
  // training step. The higher the value, the faster our loss values converge,
  // but also the more likely we are to overshoot optimal parameters
  // when making an update. A learning rate that is too low will take too long
  // to find optimal (or good enough) weight parameters while a learning rate
  // that is too high may overshoot optimal parameters. Learning rate is one of
  // the most important hyperparameters to set correctly. Finding the right
  // value takes practice and is often best found empirically by trying many
  // values.
  const LEARNING_RATE = 0.01;

  // We are using rmsprop as our optimizer.
  // An optimizer is an iterative method for minimizing an loss function.
  // It tries to find the minimum of our loss function with respect to the
  // model's weight parameters.
  const optimizer = 'rmsprop';

  // We compile our model by specifying an optimizer, a loss function, and a
  // list of metrics that we will use for model evaluation. Here we're using a
  // categorical crossentropy loss, the standard choice for a multi-class
  // classification problem like MNIST digits.
  // The categorical crossentropy loss is differentiable and hence makes
  // model training possible. But it is not amenable to easy interpretation
  // by a human. This is why we include a "metric", namely accuracy, which is
  // simply a measure of how many of the examples are classified correctly.
  // This metric is not differentiable and hence cannot be used as the loss
  // function of the model.
  model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  // Batch size is another important hyperparameter. It defines the number of
  // examples we group together, or batch, between updates to the model's
  // weights during training. A value that is too low will update weights using
  // too few examples and will not generalize well. Larger batch sizes require
  // more memory resources and aren't guaranteed to perform better.
  const batchSize = 320;

  // Leave out the last 15% of the training data for validation, to monitor
  // overfitting during training.
  const validationSplit = 0.15;

  // Get number of training epochs from the UI.
  const trainEpochs = trainingEpochs;

  // We'll keep a buffer of loss and accuracy values over time.
  let trainBatchCount = 0;

  const trainData = data.getTrainData();
  const testData = data.getTestData();

  const totalNumBatches =
    Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) *
    trainEpochs;

  // During the long-running fit() call for model training, we include
  // callbacks, so that we can plot the loss and accuracy values in the page
  // as the training progresses.
  let valAcc: any;
  await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    callbacks: {
      onBatchEnd: async (batch: any, logs: any) => {
        trainBatchCount++;
        setState({
          status: `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}% complete`,
          loss: logs.loss,
          accuracy: logs.acc,
          set: 'train',
          trainBatchCount
        })
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch: any, logs: any) => {
        valAcc = logs.val_acc;
        setState({
          loss: logs.val_loss,
          accuracy: logs.val_acc,
          set: 'validation',
          trainBatchCount
        })
        await tf.nextFrame();
      }
    }
  });

  const testResult = model.evaluate(testData.xs, testData.labels);
  const testAccPercent = testResult[1].dataSync()[0] * 100;
  const finalValAccPercent = valAcc * 100;
  setState({
    status:
      `Final validation accuracy: ${finalValAccPercent.toFixed(1)}% 
       Final test accuracy: ${testAccPercent.toFixed(1)}%`
  });
}

function createModel(modelType: string) {
  let model;
  if (modelType === 'ConvNet') {
    model = createConvModel();
  } else if (modelType === 'DenseNet') {
    model = createDenseModel();
  } else {
    throw new Error(`Invalid model type: ${modelType}`);
  }
  return model;
}

let data: any;
async function load() {
  data = new MnistData();
  await data.load();
}

export const startTraining = async (setState: Function, trainingEpochs: number, modelType: string) => {

  console.log('Loading MNIST data...');
  await load();

  console.log('Creating model...');
  const model = createModel(modelType);
  model.summary();

  console.log('Starting model training...');
  await train(model, setState, trainingEpochs);
};
