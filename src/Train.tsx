import React, { Component } from 'react';

import Progress from './Progress';

import { startTraining } from './model';

type TrainState = {
    status: string;
    trainBatchCount: number;
    loss: number;
    accuracy: number;
    set: string;
    trainingEpochs: number;
    modelType: string;
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
            set: null,
            trainingEpochs: 3,
            modelType: 'ConvNet'
        };
    }

    start = () => {
        startTraining(this.updateState, this.state.trainingEpochs, this.state.modelType);
    }

    updateState = (value: any) => {
        this.setState(value);
    }

    render() {
        return (
            <div className="train">
                <div className="details">
                    <section>
                        <h2>Training Parameters</h2>
                        <div className="field-set">
                            <label>Model Type:</label>
                            <select id="model-type" 
                            onChange={evt => this.updateState({
                                modelType: evt.target.value
                              })}>
                                <option>ConvNet</option>
                                <option>DenseNet</option>
                            </select>
                        </div>

                        <div className="field-set">
                            <label>No. of training epochs:</label>
                            <input id="train-epochs" 
                              onChange={evt => this.updateState({
                                trainingEpochs: evt.target.value
                              })}
                              value={this.state.trainingEpochs} 
                            
                            />
                        </div>
                        <div className="button">
                            <button id="train" onClick={() => this.start()}>Load Data and Train Model</button>
                        </div>
                    </section>
                </div>
                <Progress
                    loss={this.state.loss}
                    accuracy={this.state.accuracy}
                    set={this.state.set}
                    batchCount={this.state.trainBatchCount}
                    status={this.state.status}
                />
            </div>
        );
    }
}

export default Train;
