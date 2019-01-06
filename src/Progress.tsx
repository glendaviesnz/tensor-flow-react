import React, { Component } from 'react';
import * as tfvis from '@tensorflow/tfjs-vis';

type ProgressProps = {
    status: string;
    batch: number;
    loss: number;
    accuracy: number;
    set: string
}

class Progress extends Component<ProgressProps> {
    private lossRef = React.createRef<HTMLDivElement>();
    private accuracyRef = React.createRef<HTMLDivElement>();
    private lossValues: any = [[], []];
    private accuracyValues: any = [[], []];

    constructor(props: ProgressProps) {
        super(props);
    }

    plotLoss() {
        const series = this.props.set === 'train' ? 0 : 1;
        this.lossValues[series].push({ x: this.props.batch, y: this.props.loss });
        const lossContainer = this.lossRef.current;
        tfvis.render.linechart(
            { values: this.lossValues, series: ['train', 'validation'] }, lossContainer, {
                xLabel: 'Batch #',
                yLabel: 'Loss',
                width: 300,
                height: 200,
            });
    }

    plotAccuracy() {
        const accuracyContainer = this.accuracyRef.current;
        const series = this.props.set === 'train' ? 0 : 1;
        this.accuracyValues[series].push({ x: this.props.batch, y: this.props.accuracy });
        tfvis.render.linechart(
            { values: this.accuracyValues, series: ['train', 'validation'] },
            accuracyContainer, {
                xLabel: 'Batch #',
                yLabel: 'Loss',
                width: 300,
                height: 200,
            });
    }

    componentDidUpdate() {
        this.plotLoss();
        this.plotAccuracy();
    }

    render() {
        return (
            <section className="training-progress">
                <p className='section-head'>Training Progress</p>
                <p>{this.props.status}</p>
                <div id="stats">
                    <div className="canvases">
                        <label id="loss-label">
                            {this.props.loss &&
                                `last loss: ${this.props.loss.toFixed(3)}`
                            }
                        </label>
                        <div id="loss-canvas" ref={this.lossRef}></div>
                    </div>
                    <div className="canvases">
                        <label id="accuracy-label">
                            {this.props.accuracy &&
                                `last accuracy: ${(this.props.accuracy * 100).toFixed(1)}%`
                            }
                        </label>
                        <div id="accuracy-canvas" ref={this.accuracyRef}></div>
                    </div>
                </div>
            </section>
        );
    }
}

export default Progress;
