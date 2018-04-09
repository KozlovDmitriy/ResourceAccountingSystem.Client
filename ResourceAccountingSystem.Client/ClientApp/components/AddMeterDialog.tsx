import * as React from 'react';
import * as HousesState from '../store/Houses';
import Dialog from 'material-ui/Dialog';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { ApplicationState } from '../store';

interface IAddMeterDialogState {
    houseId: number,
    serialNumber: string
}

class AddMeterDialog extends React.Component<any, IAddMeterDialogState> {
    constructor(props: any) {
        super(props);
        if (props.house !== void 0) {
            this.state = {
                houseId: props.house.id,
                serialNumber: this.getSerialNumberFromHouse(props.house)
            };
        } else {
            this.state = {
                houseId: void 0,
                serialNumber: ''
            };
        }
        this.changeSerialNumber = this.changeSerialNumber.bind(this)
        this.commit = this.commit.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        const house = nextProps.house;
        if (house !== void 0) {
            this.setState({
                ...this.state,
                houseId: house.id,
                serialNumber: this.getSerialNumberFromHouse(nextProps.house)
            })
        }        
    }

    getSerialNumberFromHouse = (house) =>
        house.meterSerialNumber === null ||
        house.meterSerialNumber === void 0
            ? ''
            : house.meterSerialNumber

    changeSerialNumber = (event, newValue) => {
        if (newValue.match(/([0-9A-Z\-]*)?/i)[0] === newValue) {
            this.setState({ ...this.state, serialNumber: newValue })
        }
    }

    commit = () => {
        this.props.addMeter(this.state.houseId, this.state.serialNumber)
        this.props.closeAction()
    }

    public render() {
        if (this.props.house === void 0)
            return <div></div>

        const actions = [
            <FlatButton
                label="Отменить"
                primary={true}
                onClick={this.props.closeAction}
            />,
            <FlatButton
                label="Добавить"
                primary={true}
                keyboardFocused={true}
                onClick={this.commit}
                disabled={
                    this.state.serialNumber === '' ||
                    this.state.houseId === void 0 ||
                    this.state.houseId === NaN
                }
            />,
        ];
        const warning =
            this.props.house !== void 0 &&
                this.props.house.meterSerialNumber !== void 0 &&
                this.props.house.meterSerialNumber !== null &&
                this.props.house.meterSerialNumber !== this.state.serialNumber
                ? <p>Счетчик с серийным номером: {this.props.house.meterSerialNumber} и вся история его показаний будут удалены</p>
                : void 0
        const title = 'Введите информацию о счетчике'
        return (
            <Dialog
                title={title}
                actions={actions}
                modal={false}
                open={this.props.isOpen}
                onRequestClose={this.props.closeAction}
            >
                <div>
                    {warning}
                    <TextField
                        hintText="Введите серийный номер счетчика"
                        floatingLabelText="Серийный номер счетчика"
                        multiLine={false}
                        onChange={this.changeSerialNumber}
                        value={this.state.serialNumber}
                        fullWidth
                    />
                </div>
            </Dialog>
        )
    }
}

export default connect(
    (state: ApplicationState) => state.houses,
    HousesState.actionCreators
)(AddMeterDialog) as typeof AddMeterDialog;