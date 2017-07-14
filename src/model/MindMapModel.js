import {combineReducers} from 'redux'
import layout from './layout.js'

//data for test
const nodeList = [
{
	id:0,
	name:'logger',
	children : [1,2,3,8,9,10],
	color : '#94D2B3',
},
{
	id:1,
	name : '开发',
	parent : 0,
	children : [4,5,6,7,15],
	color : '#469AD0',
},
{
	id : 2,
	name : '开发环境',
	parent : 0,
	color : '#469AD0',
},
{
	id : 3,
	name : '上线记录',
	parent : 0,
	color : '#469AD0',
},
{
	id : 4,
	name : 'v0.1',
	parent : 1,
	color : '#469AD0',
},
{
	id : 5,
	name : 'v0.2',
	parent : 1,
	color : '#469AD0',
},
{
	id : 6,
	name : 'v0.3',
	parent : 1,
	color : '#469AD0',
},
{
	id : 7,
	name : 'v1.0',
	parent : 1,
	color : '#469AD0',
},	
{
	id : 15,
	name : 'v2.0',
	parent : 1,
	color : '#469AD0',
},	
{
	id : 8,
	name : 'todo',
	parent : 0,
	color : '#469AD0',
},
{
	id : 9,
	name : 'idea',
	parent : 0,
	color : '#469AD0',
},
{
	id : 10,
	name : '标签研究',
	parent : 0,
	children : [11,12,13],
	color : '#469AD0',
},
{
	id : 11,
	name : '知识表示',
	parent : 10,
	color : '#469AD0',
},
{
	id : 12,
	name : '描述逻辑',
	parent : 10,
	color : '#469AD0',
},
{
	id : 13,
	name : 'agenda',
	parent : 10,
	color : '#469AD0',
},
]
let indexData = {};
nodeList.forEach(node =>{
	indexData[node.id] = node;
});

//calculate the node position
layout(0,indexData);


//action ----------------------------------------------

const PREFIX = "HashTagModel_";
const ACTION = {
	LOAD : PREFIX + "load",
}

export const load = () => ({
	type:ACTION.LOAD,
})

//reducer--------------------------------------

const index = (state = {},action) => {
	switch(action.type){
		case ACTION.LOAD:
			return indexData;
		default:
			return state;
	}
}

//get setter -----------------------------------------

export const getNodeById = (state,id) => {
	return state.mindMap.index[id];
}
export const getParentNodeById = (state,id) => {
	const node = getNodeById(state,id);
	const parent = node.parent;
	if(parent == undefined){
		return null;
	}else{
		return getNodeById(state,parent);
	}
}

export const getRoot = (state) => {
	return state.mindMap.index[0];
}


//export 
export const mindMap = combineReducers({
	index,
})
