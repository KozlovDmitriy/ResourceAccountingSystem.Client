import * as React from 'react';
import * as HousesState from '../store/Houses';
import Dialog from 'material-ui/Dialog';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { ApplicationState } from '../store';

interface IAddEditDialogState {
    street: string,
    zip: string,
    houseNumber: string,
    id: number
}

class AddEditDialog extends React.Component<any, IAddEditDialogState> {
    constructor(props: any) {
        super(props);
        if (props.house !== void 0) {
            this.state = {
                id: props.house.id,
                street: props.house.street,
                zip: props.house.zip,
                houseNumber: props.house.houseNumber
            };
        } else { 
            this.state = {
                id: void 0,
                street: '',
                zip: '',
                houseNumber: ''
            };
        }
        this.changeStreet = this.changeStreet.bind(this)
        this.changeZip = this.changeZip.bind(this)
        this.changeHouseNumber = this.changeHouseNumber.bind(this)
        this.commit = this.commit.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        const house = nextProps.house;
        if (house !== void 0) {
            this.setState({
                ...this.state,
                id: house.id,
                street: house.street,
                zip: house.zip,
                houseNumber: house.houseNumber
            })
        }        
    }

    changeStreet = (event, newValue) => {
        if (newValue.match(/([a-zа-яё][a-zа-яё0-9\.\-\s]*)?/i)[0] === newValue) {
            this.setState({ ...this.state, street: newValue })
        }
    }

    changeZip = (event, newValue) => {
        if (newValue.match(/([0-9][0-9\-]*)?/)[0] === newValue) {
            this.setState({ ...this.state, zip: newValue })
        }
    }

    changeHouseNumber = (event, newValue) => {
        if (newValue.match(/([1-9][0-9]*)?/)[0] === newValue) {
            this.setState({ ...this.state, houseNumber: newValue })
        }
    }

    commit = () => {
        if (this.state.id === void 0) {
            this.props.addHouse(this.state.zip, this.state.street, this.state.houseNumber)
        } else {
            this.props.editHouse(this.state.id, this.state.zip, this.state.street, this.state.houseNumber)
        }
        this.props.closeAction()
    }

    public render() {
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
                    this.state.houseNumber.length === 0 ||
                    this.state.street.length === 0 ||
                    this.state.zip.length === 0
                }
            />,
        ];
        const title = 'Введите информацию о доме' +
            (this.state.id === void 0 ? '' : `: ${this.state.id}`)
        return (
            <Dialog
                title={title}
                actions={actions}
                modal={false}
                open={this.props.isOpen}
                onRequestClose={this.props.closeAction}
            >
                <div>
                    <TextField
                        hintText="Введите почтовый индекс"
                        floatingLabelText="Почтовый индекс"
                        multiLine={false}
                        onChange={this.changeZip}
                        value={this.state.zip}
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        hintText="Введите название улицы"
                        floatingLabelText="Название улицы"
                        multiLine={false}
                        onChange={this.changeStreet}
                        value={this.state.street}
                        fullWidth
                    />
                </div>
                <div>
                    <TextField
                        hintText="Введите номер дома"
                        floatingLabelText="Номер дома"
                        multiLine={false}
                        onChange={this.changeHouseNumber}
                        value={this.state.houseNumber}
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
)(AddEditDialog) as typeof AddEditDialog;