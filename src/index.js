import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import {createStore,applyMiddleware,compose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {mindMapReducer} from './model/mindMapReducer'

let store = createStore(
		mindMapReducer,
		applyMiddleware(
			thunkMiddleware // lets us dispatch() functions
			//loggerMiddleware // neat middleware that logs actions
			)
		)

ReactDOM.render(
	<Provider store={store} >
		<App />
	</Provider>
	, document.getElementById('root'));
registerServiceWorker();
