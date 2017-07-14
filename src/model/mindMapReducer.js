import {combineReducers} from 'redux'
import * as MindMapModel from './MindMapModel'

export const mindMapReducer = combineReducers({
	mindMap:MindMapModel.mindMap,
});

