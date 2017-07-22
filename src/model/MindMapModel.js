import {combineReducers} from 'redux'
//import layout from './layout.js'
import layout from './layoutEllipseBounce.js'

//data for test
const nodeList2 = [
{
	id:0,
	name:'logger',
	children : [1,2,3,8,9,10],
	color : '#94D2B3',
	showChildren : false,
},
{
	id:1,
	name : '开发',
	parent : 0,
	children : [4,5,6,7,15],
	color : '#469AD0',
	showChildren : false,
},
{
	id : 2,
	name : '开发环境',
	parent : 0,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 3,
	name : '上线记录',
	parent : 0,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 4,
	name : 'v0.1',
	parent : 1,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 5,
	name : 'v0.2',
	parent : 1,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 6,
	name : 'v0.3',
	parent : 1,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 7,
	name : 'v1.0',
	parent : 1,
	color : '#469AD0',
	showChildren : false,
},	
{
	id : 15,
	name : 'v2.0',
	parent : 1,
	color : '#469AD0',
	showChildren : false,
},	
{
	id : 8,
	name : 'todo',
	parent : 0,
	color : '#469AD0',
	image : require('../images/todo.png'),
	showChildren : false,
},
{
	id : 9,
	name : 'idea',
	image : require('../images/idea.png'),
	parent : 0,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 10,
	name : '标签研究',
	parent : 0,
	children : [11,12,13],
	color : '#469AD0',
	showChildren : false,
},
{
	id : 11,
	name : '知识表示',
	parent : 10,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 12,
	name : '描述逻辑',
	parent : 10,
	color : '#469AD0',
	showChildren : false,
},
{
	id : 13,
	name : 'agenda',
	parent : 10,
	color : '#469AD0',
	showChildren : false,
},
]


const nodeList = [
{
	id:0,
	name:'logger',
	children : [],
	color : '#94D2B3',
	showChildren : false,
}]

let indexData = {};
nodeList.forEach(node =>{
	indexData[node.id] = node;
});

export function getNextId(indexData){
	let maxId = 0;
	for(let key in indexData){
		if(indexData[key].id > maxId){
			maxId = indexData[key].id;
		}
	}
	return maxId + 1;
}

//calculate the node position
layout(0,indexData);

//calculate level: give the id,calculate its level number , the root node is level 1
function getLevel(id,indexData){
	let node = indexData[id];
	let level = 1;
	while(true){
		if(node.parent == undefined){
			break;
		}
		node = indexData[node.parent];
		level++;
	}
	return level;
}

for(let key in indexData){
	const node = indexData[key];
	node.level = getLevel(node.id,indexData);
}

console.info('the original index data',indexData);

//action ----------------------------------------------

const PREFIX = "HashTagModel_";
const ACTION = {
	LOAD : PREFIX + "load",
	ADD_NODE : PREFIX + "add_node",
	DELETE_NODE : PREFIX + "delele_node",
	TOGGLE_CHILDREN : PREFIX + 'toggle_children',
	EXPAND : PREFIX + 'expend',
	FOLD : PREFIX + 'fold',
}

export const load = () => ({
	type:ACTION.LOAD,
})

export const addNode = (parentId) => ({
	type : ACTION.ADD_NODE,
	parentId,
});

export const deleteNode = (id) => ({
	type : ACTION.DELETE_NODE,
	id,
});

export const toggleChildren = (id) => ({
	type : ACTION.TOGGLE_CHILDREN,
	id,
});

export const expand = () => ({
	type : ACTION.EXPAND,
})
export const fold = () => ({
	type : ACTION.FOLD,
})

//reducer--------------------------------------

const index = (state = {},action) => {
	switch(action.type){
		case ACTION.LOAD:
			return indexData;
		case ACTION.ADD_NODE:{
			let indexData = state;
			const parentId = action.parentId;
			const parentNode = indexData[parentId];
			if(!parentNode.children){
				parentNode.children = [];
			}
			const node = {
				id : getNextId(state),
				name : '新节点',
				parent : parentId,
				color : '#469AD0',
				level : getLevel(parentId,indexData) + 1,
				showChildren : false,
			}
			parentNode.showChildren = true;
			parentNode.children.push(node.id);
			indexData[node.id] = node;
			layout(0,indexData);
			return indexData;
		}
		case ACTION.DELETE_NODE:{
			let data = state;
			console.info(data[parseInt(action.id)]);
			let node = data[parseInt(action.id)];
			console.info(node);
			const parentNode = data[node.parent];
			console.info(parentNode);
			parentNode.children = parentNode.children.filter(n => n.id != action.id);
			delete data[action.id];
			return data;
		}
		case ACTION.TOGGLE_CHILDREN : {
			let data = state;
			let node = data[action.id];
			node.showChildren = !node.showChildren;
			return data;
		}
		default:
			return state;
	}
}

const reLayout = (state = (new Date()).getTime() , action ) => {
	switch(action.type){
		case ACTION.ADD_NODE:{
			return (new Date()).getTime();
		}
		case ACTION.DELETE_NODE,ACTION.TOGGLE_CHILDREN:{
			return (new Date()).getTime();
		}
		default:
			return state;
	}
}
//shwo level : control the mindmap show level of nodes
const showLevel = (state = 1, action) => {
	switch(action.type){
		case ACTION.EXPAND :{
			let currentLevel = state + 1;
			return currentLevel;
		}
		case ACTION.FOLD : {
			let currentLevel = state - 1;
			return currentLevel;
		}
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
	if(!node){
		return null;
	}
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
	reLayout,
	showLevel,
})
