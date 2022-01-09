import { createStore} from 'redux';
import reducer from '../reducers';
let store;
export default function configureStore(initialState) {
    store = createStore(reducer, initialState);
    return store;
}
export  function getStore() {
    return store;
}