import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux'; 
import { AppThunkAction } from './';

export interface HousesState {
    isLoading: boolean;
    page?: number;
    houseIdFilter: string;
    houses: House[];
    pagesCount: number;
    message: string;
    minMax: any;
}

export interface House {
    id: number;
    zip: string;
    houseNumber: number;
    street: string;
    meterSerialNumber: string;
    meterReadingValue: number;
}

interface SetMessageAction {
    type: 'SET_MESSAGE_ACTION';
    message: string;
}

interface SetPagesCountAction {
    type: 'GET_PAGES_COUNT_ACTION';
    pagesCount: number;
}

interface RequestHousesAction {
    type: 'REQUEST_HOUSES';
    page: number;
    houseIdFilter: string;
}

interface ReceiveHousesAction {
    type: 'RECEIVE_HOUSES';
    page: number;
    houseIdFilter: string;
    houses: House[];
}

interface GetMinMaxAction {
    type: 'GET_MIN_MAX',
    minMax: object
}

type KnownAction = RequestHousesAction | ReceiveHousesAction | SetPagesCountAction | SetMessageAction | GetMinMaxAction;

// обновляем данные на странице
const updateGridAfterHousesDataChange = (dispatch, getState) => {
    const state = getState().houses
    actionCreators.getPagesCount()(dispatch, getState);
    actionCreators.requestHouses(1, state.houseIdFilter, true)(dispatch, getState);
}

const resiveCommandActionResponse = (response, dispatch, getState) => {
    if (response.status >= 400 && response.status < 600) {
        response.json().then(error =>
            dispatch({ type: 'SET_MESSAGE_ACTION', message: `Error: ${error}` })
        )
    } else {
        updateGridAfterHousesDataChange(dispatch, getState);
    };
}  

export const actionCreators = {
    requestHouses: (page: number, houseIdFilter?: string, force?: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        if (page !== state.page || houseIdFilter !== state.houseIdFilter || force) {
            const query = `${(<any>window).webApiUrl}api/Houses/GetPage?page=${page}` +
                ( houseIdFilter !== void 0 ? `&houseIdFilter=${houseIdFilter}` : '' )
            const fetchTask = fetch(query)
                .then(response => response.json() as Promise<House[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_HOUSES', page, houseIdFilter, houses: data });
                });
        }
    },
    getPagesCount: (): AppThunkAction<KnownAction> => (dispatch) => {
        const fetchTask = fetch(`${(<any>window).webApiUrl}api/Houses/GetPagesCount`)
            .then(response => response.json() as number)
            .then(pagesCount => {
                dispatch({ type: 'GET_PAGES_COUNT_ACTION', pagesCount });
            });
    },
    editHouse: (id: number, zip: string, street: string, houseNumber: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/Houses/${id}`
        const fetchTask = fetch(query, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ street, zip, houseNumber })
            })
            .then(response => resiveCommandActionResponse(response, dispatch, getState));
    },
    addHouse: (zip: string, street: string, houseNumber: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/Houses`
        const fetchTask = fetch(query, {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ street, zip, houseNumber })
            })
            .then(response => resiveCommandActionResponse(response, dispatch, getState));
    },
    deleteHouse: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/Houses/${id}`
        fetch(query, { method: "DELETE" }).then(
            response => resiveCommandActionResponse(response, dispatch, getState)
        );
    },
    addMeter: (houseId: number, serialNumber: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/Meters`
        const fetchTask = fetch(query, {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ houseId, serialNumber })
            }).then(
                response => resiveCommandActionResponse(response, dispatch, getState)
            );
    },
    addReading: (readingType: number, readingIdentifier: string, readingValue: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/MeterReadings`
        const fetchTask = fetch(query, {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ readingType, readingIdentifier, readingValue })
            }).then(
                response => resiveCommandActionResponse(response, dispatch, getState)
            );
    },
    getMinMaxHouses: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().houses
        const query = `${(<any>window).webApiUrl}api/Houses/GetMinMaxHouses`
        const fetchTask = fetch(query)
            .then(response => response.json() as Promise<House[]>)
            .then(data => {
                dispatch({ type: 'GET_MIN_MAX', minMax: data });
            });
    },
    setMessage: (message: string): AppThunkAction<KnownAction> => (dispatch) => {
        dispatch({ type: 'SET_MESSAGE_ACTION', message: message })
    }
};

const unloadedState: HousesState = {
    houses: [],
    isLoading: false,
    page: void 0,
    houseIdFilter: void 0,
    pagesCount: 0,
    message: '',
    minMax: void 0
};

export const reducer: Reducer<HousesState> = (state: HousesState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_HOUSES':
            return {
                ...state,
                page: action.page,
                houseIdFilter: action.houseIdFilter,
                isLoading: true,
                message: ''
            };
        case 'RECEIVE_HOUSES':
            return {
                ...state,
                page: action.page,
                houseIdFilter: action.houseIdFilter,
                houses: action.houses,
                isLoading: false,
                message: ''
            };
        case 'GET_PAGES_COUNT_ACTION':
            return {
                ...state,
                isLoading: false,
                pagesCount: action.pagesCount,
                message: ''
            }
        case 'SET_MESSAGE_ACTION':
            return {
                ...state,
                message: action.message
            }
        case 'GET_MIN_MAX':
            return {
                ...state,
                minMax: action.minMax
            }
        default:
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};