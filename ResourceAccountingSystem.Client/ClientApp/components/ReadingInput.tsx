import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import * as HousesState from '../store/Houses';
import TextField from 'material-ui/TextField';
import AddIcon from 'material-ui/svg-icons/action/done';
import IconButton from 'material-ui/IconButton';

interface IReadingInputState {
    readingType: string,
    readingIdentifier: string,
    readingValue: string
}

class ReadingInput extends React.Component<any, IReadingInputState> {
    constructor(props) {
        super(props);
        this.state = {
            readingType: 'house',
            readingIdentifier: '',
            readingValue: ''
        };
        this.changeInputReadingType = this.changeInputReadingType.bind(this)
        this.changeReadingIdentifier = this.changeReadingIdentifier.bind(this)
        this.addReading = this.addReading.bind(this)
    }

    changeInputReadingType = (event, value) => {
        this.setState({ ...this.state, readingType: value, readingIdentifier: '' });
    }

    changeReadingIdentifier = (event, value) => {
        if (this.state.readingType === 'meter') {
            if (value.match(/([0-9A-Z\-]*)?/i)[0] === value) {
                this.setState({ ...this.state, readingIdentifier: value })
            }
        } else {
            if (value.match(/([1-9][0-9]*)?/)[0] === value) {
                this.setState({ ...this.state, readingIdentifier: value })
            }
        }
    }

    changeReadingValue = (event, value) => {
        if (value.match(/([1-9][0-9]*)?/)[0] === value) {
            this.setState({ ...this.state, readingValue: value })
        }
    }

    addReading = () => {
        this.props.addReading(
            this.state.readingType,
            this.state.readingIdentifier,
            parseInt(this.state.readingValue)
        )
    }

    public render() {
        return (
            <div>
                <RadioButtonGroup
                    name="shipSpeed"
                    defaultSelected="house"
                    onChange={this.changeInputReadingType}
                >
                    <RadioButton
                        value="house"
                        label="По идентификатору дома"
                    />
                    <RadioButton
                        value="meter"
                        label="По серийному номеру счетчика"
                    />
                </RadioButtonGroup>
                <div>
                    <TextField
                        hintText={this.state.readingType === "house" ? "Введите идентификатор дома" : "Введите серийный номер счетчика"}
                        floatingLabelText={this.state.readingType === "house" ? "Идентификатор дома" : "Серийный номер счетчика"}
                        multiLine={false}
                        style={{ width: 500 }}
                        onChange={this.changeReadingIdentifier}
                        value={this.state.readingIdentifier}
                    />
                </div>
                <div>
                    <TextField
                        hintText={"Введите новое показание счетчика"}
                        floatingLabelText={"Новое показание счетчика"}
                        multiLine={false}
                        style={{ width: 500 }}
                        onChange={this.changeReadingValue}
                        value={this.state.readingValue}
                    />
                    <IconButton
                        tooltip="Внести показание"
                        tooltipPosition="top-center"
                        onClick={this.addReading}
                        disabled={this.state.readingIdentifier === '' || this.state.readingValue === ''}
                    >
                        <AddIcon />
                    </IconButton>
                </div>
            </div>
        )
    }
}

export default connect(
    (state: ApplicationState) => state.houses,
    HousesState.actionCreators
)(ReadingInput) as typeof ReadingInput;
