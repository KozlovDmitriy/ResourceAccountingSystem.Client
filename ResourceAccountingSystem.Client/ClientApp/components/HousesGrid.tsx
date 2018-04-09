import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as HousesState from '../store/Houses';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import SearchIcon from 'material-ui/svg-icons/action/search';
import AddIcon from 'material-ui/svg-icons/content/add';
import MeterIcon from 'material-ui/svg-icons/content/archive';
import EditIcon from 'material-ui/svg-icons/image/edit';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import UpdateIcon from 'material-ui/svg-icons/action/cached';
import AddEditDialog from './AddEditDialog';
import AddMeterDialog from './AddMeterDialog';
import Snackbar from 'material-ui/Snackbar';
import { red500 } from 'material-ui/styles/colors';
import ReadingInput from './ReadingInput';

interface IHousesGridState {
    expanded: boolean,
    addDialogOpen: boolean,
    meterDialogOpen: boolean,
    houseId: string,
    isMessageShow: boolean,
    editHouse: object,
    addMeterHouse: object
}

type HousesProps =
    HousesState.HousesState
    & typeof HousesState.actionCreators 
    & RouteComponentProps<{ page: string }>;

class HousesGrid extends React.Component<HousesProps, IHousesGridState> {
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            houseId: '',
            addDialogOpen: false,
            meterDialogOpen: false,
            isMessageShow: props.message !== '',
            editHouse: void 0,
            addMeterHouse: void 0
        };
        this.changeSearchHouseId = this.changeSearchHouseId.bind(this)
        this.searchByHouseId = this.searchByHouseId.bind(this)
        this.clearHouseId = this.clearHouseId.bind(this)
        this.handleAddDialogOpen = this.handleAddDialogOpen.bind(this)
        this.handleAddDialogClose = this.handleAddDialogClose.bind(this)
        this.handleRequestClose = this.handleRequestClose.bind(this)
        this.editHouse = this.editHouse.bind(this)
    }

    componentDidMount() {
        // кол-во страниц
        this.props.getPagesCount();
        // текущая страница из url
        const page = parseInt(this.props.match.params.page) || 1;
        // первый запрос списка всех домов
        this.props.requestHouses(page);
    }

    componentWillReceiveProps(nextProps: HousesProps) {
        // текущая страница из url
        const page = parseInt(nextProps.match.params.page) || 1;
        // если текущая страница больше чем всего страниц
        if (page > nextProps.pagesCount && nextProps.pagesCount > 0) {
            // редиректим на первую страницу
            nextProps.history.push('/houses/1');
        }
        // запращиваем список домов для текущей страницы
        this.props.requestHouses(page, this.state.houseId);
        // отображаем сообщение если оно есть
        this.setState({ ...this.state, isMessageShow: nextProps.message !== ''})
    }

    handleRequestClose() {
        this.setState({ ...this.state, isMessageShow: false })
        this.props.setMessage('');
    }

    handleAddMeterDialogOpen = () => {
        this.setState({ ...this.state, meterDialogOpen: true });
    };

    handleAddMeterDialogClose = () => {
        this.setState({ ...this.state, meterDialogOpen: false, addMeterHouse: void 0 });
    };

    handleAddDialogOpen = () => {
        this.setState({ ...this.state, addDialogOpen: true });
    };

    handleAddDialogClose = () => {
        this.setState({ ...this.state, addDialogOpen: false, editHouse: void 0 });
    };

    handleExpandChange = (expanded) => {
        this.setState({ ...this.state, expanded: expanded });
    };

    handleToggle = (event, toggle) => {
        this.setState({ ...this.state, expanded: toggle });
    };

    handleExpand = () => {
        this.setState({ ...this.state, expanded: true });
    };

    handleReduce = () => {
        this.setState({ ...this.state, expanded: false });
    };

    // валидация поля поиска дома по идентификатору
    changeSearchHouseId = (event, newValue) => {
        if (newValue.match(/([1-9][0-9]*)?/)[0] === newValue)
        {
            this.setState({ ...this.state, houseId: newValue })
        }
    }

    // ищем дом по идентификатору
    searchByHouseId = () => {
        const page = parseInt(this.props.match.params.page) || 1;
        this.props.requestHouses(page, this.state.houseId);
    }

    // очищаем поле поиска дома по идентификатору
    clearHouseId = () => {
        this.setState({ ...this.state, houseId: '' })
        const page = parseInt(this.props.match.params.page) || 1;
        this.props.requestHouses(page, void 0);
    }

    // редактируем дом
    editHouse = (house) => {
        const newState = { ...this.state, editHouse: house, addDialogOpen: true }
        this.setState(newState);
    }

    // назначаем счетчик
    addMeter = (house) => {
        const newState = { ...this.state, addMeterHouse: house, meterDialogOpen: true }
        this.setState(newState);
    }

    public render() {
        const min = this.props.minMax !== void 0 ? this.props.minMax.min : void 0
        const max = this.props.minMax !== void 0 ? this.props.minMax.max : void 0
        return (
            <div>
                <AddMeterDialog
                    house={this.state.addMeterHouse}
                    isOpen={this.state.meterDialogOpen}
                    closeAction={this.handleAddMeterDialogClose}
                />
                <AddEditDialog
                    house={this.state.editHouse}
                    isOpen={this.state.addDialogOpen}
                    closeAction={this.handleAddDialogClose}
                />
                <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
                    <CardTitle
                        title="Дома"
                        subtitle="Полный список"
                        actAsExpander
                        showExpandableButton
                    />
                    <CardMedia expandable style={{paddingBottom: 20}}>
                        {this.renderSearch()}
                        {this.renderTable()}
                        {this.props.houseIdFilter === void 0 || this.props.houseIdFilter === '' ? this.renderPagination() : void 0}
                    </CardMedia>
                </Card>
                <div className='row'>
                    <div className='col col-sm-6'>
                        <Card style={{ marginTop: 20 }}>
                            <CardTitle
                                title="Передача показаний"
                                subtitle="Внести новые показания счетчика"
                                actAsExpander
                            />
                            <CardText>
                                <ReadingInput />
                            </CardText>
                        </Card>
                    </div>
                    <div className='col col-sm-6'>
                        <Card style={{ marginTop: 20 }}>
                            <CardTitle
                                title="Дома рекордсмены"
                                subtitle="Дома с максимальным и минимальным потреблением"
                                actAsExpander
                            />
                            <CardText>
                                <p>
                                    <span><b>Дом с минимальным потреблением:</b></span>
                                    &nbsp;
                                    {
                                        min === void 0 || min === null
                                            ? <code>неизвестно</code>
                                            : `id: ${min.id} (${min.zip}) ${min.street}, д. ${min.houseNumber} [${min.meterSerialNumber}] - ${min.meterReadingValue}`
                                    }
                                </p>
                                <p>
                                    <span><b>Дом с максимальным потреблением:</b></span>
                                    &nbsp;
                                    {
                                        max === void 0 || max === null
                                            ? <code>неизвестно</code>
                                            : `id: ${max.id} (${max.zip}) ${max.street}, д. ${max.houseNumber} [${max.meterSerialNumber}] - ${max.meterReadingValue}`
                                    }
                                </p>
                            </CardText>
                            <CardActions style={{ paddingBottom: 20 }}>
                                <IconButton
                                    tooltip="Обновить данные"
                                    tooltipPosition="top-center"
                                    onClick={this.props.getMinMaxHouses}
                                >
                                    <UpdateIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </div>
                </div>
                <Snackbar
                    open={this.state.isMessageShow}
                    message={this.props.message}
                    autoHideDuration={4000}
                    action="x"
                    onRequestClose={this.handleRequestClose}
                    onActionClick={this.handleRequestClose}
                />
            </div>
        )
    }

    private renderSearch() {
        return (
            <div style={{ paddingLeft: 20, paddingRight: 20 }}>
                <TextField
                    hintText="Введите идентификатор дома"
                    floatingLabelText="Поиск дома по идентификатору"
                    multiLine={false}
                    onChange={this.changeSearchHouseId}
                    value={this.state.houseId}
                />
                <IconButton
                    tooltip="Искать"
                    tooltipPosition="bottom-right"
                    onClick={this.searchByHouseId}
                >
                    <SearchIcon />
                </IconButton>
                {
                    this.props.houseIdFilter !== void 0 && this.props.houseIdFilter !== '' ? (
                        <IconButton
                            tooltip="Очистить фильтр"
                            tooltipPosition="top-center"
                            onClick={this.clearHouseId}
                        >
                            <CloseIcon />
                        </IconButton>
                    ) : void 0
                }

                <FlatButton
                    className={'pull-right'}
                    style={{ marginTop: 30 }}
                    label="Добавить дом"
                    primary={true}
                    onClick={this.handleAddDialogOpen}
                    icon={<AddIcon />}
                />
            </div>
        )
    }

    private renderTable() {
        return (
            <Table selectable={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn>Идентификатор</TableHeaderColumn>
                        <TableHeaderColumn>Индекс</TableHeaderColumn>
                        <TableHeaderColumn>Улица</TableHeaderColumn>
                        <TableHeaderColumn>Дом</TableHeaderColumn>
                        <TableHeaderColumn>Серийный номер счетчика</TableHeaderColumn>
                        <TableHeaderColumn>Текущее значение</TableHeaderColumn>
                        <TableHeaderColumn>Действия</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.props.houses.map(house =>
                        <TableRow key={house.id}>
                            <TableRowColumn>{house.id}</TableRowColumn>
                            <TableRowColumn>{house.zip}</TableRowColumn>
                            <TableRowColumn>{house.street}</TableRowColumn>
                            <TableRowColumn>{house.houseNumber}</TableRowColumn>
                            <TableRowColumn>{house.meterSerialNumber}</TableRowColumn>
                            <TableRowColumn>{house.meterReadingValue > 0 ? house.meterReadingValue : ''}</TableRowColumn>
                            <TableRowColumn>
                                <IconButton
                                    title="Назначить новый счетчик"
                                    onClick={() => this.addMeter(house)}
                                >
                                    <MeterIcon />
                                </IconButton>
                                <IconButton
                                    title="Редактировать"
                                    onClick={() => this.editHouse(house)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    title="Удалить дом"
                                    onClick={() => this.props.deleteHouse(house.id)}
                                >
                                    <CloseIcon color={red500} />
                                </IconButton>
                            </TableRowColumn>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )
    }

    private renderPagination() {
        const { page, pagesCount } = this.props;
        const prev = (page || 1) - 1;
        const next = (page || 1) + 1;
        return <p className='clearfix text-center'>
            {
                prev >= 1 && !this.props.isLoading
                    ? <Link to={`/houses/${prev}`}>Назад</Link> 
                    : void 0
            }
            &nbsp;&nbsp;&nbsp;
            {
                this.props.isLoading
                    ? <span>Загрузка...</span>
                    : <span>{page} / {pagesCount}</span>
            }
            &nbsp;&nbsp;&nbsp;
            {
                next <= pagesCount && !this.props.isLoading
                    ? <Link to={`/houses/${next}`}>Вперед</Link>
                    : void 0
            }
        </p>;
    }
}

export default connect(
    (state: ApplicationState) => state.houses, 
    HousesState.actionCreators
)(HousesGrid) as typeof HousesGrid;