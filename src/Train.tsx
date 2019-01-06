import React, { Component } from 'react';

import Progress from './Progress';

import { startTraining } from './model';

type TrainState = {
    status: string;
    trainBatchCount: number;
    loss: number;
    accuracy: number;
    set: string
}
type TrainProps = {}

class Train extends Component<TrainProps, TrainState> {
    constructor(props: TrainProps) {
        super(props);
        this.state = {
            status: '',
            trainBatchCount: null,
            loss: null,
            accuracy: null,
            set: null
        };
    }

    start = () => {
        startTraining(this.updateState);
    }

    updateState = (value: any) => {
        this.setState(value);
    }
    
    render() {
        return (
            <div className="train">
                <div className="details">
                    <section className='title-area'>
                        <h1>TensorFlow.js: Digit Recognizer with Layers</h1>
                        <p className='subtitle'>Train a model to recognize handwritten digits from the MNIST database using the tf.layers
                          api.
                    </p>
                    </section>

                    <section>
                        <p className='section-head'>Description</p>
                        <p>
                            This examples lets you train a handwritten digit recognizer using either a Convolutional Neural Network
                            (also known as a ConvNet or CNN) or a Fully Connected Neural Network (also known as a DenseNet).
                    </p>
                        <p>The MNIST dataset is used as training data.</p>
                    </section>

                    <section>
                        <p className='section-head'>Training Parameters</p>
                        <div>
                            <label>Model Type:</label>
                            <select id="model-type">
                                <option>ConvNet</option>
                                <option>DenseNet</option>
                            </select>
                        </div>

                        <div>
                            <label># of training epochs:</label>
                            <input id="train-epochs" defaultValue="3" />
                        </div>

                        <button id="train" onClick={() => this.start()}>Load Data and Train Model</button>
                    </section>
                </div>
                <Progress
                    loss={this.state.loss}
                    accuracy={this.state.accuracy}
                    set={this.state.set}
                    batch={this.state.trainBatchCount}
                    status={this.state.status}
                />
            </div>
        );
    }
}

export default Train;
