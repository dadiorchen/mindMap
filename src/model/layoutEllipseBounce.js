import {polar2cartesian} from './coordination.js'
//const---------------------------------------------------
const NODE_GAP = 50;// unit:degree
export const CHILD_GAP = 200;// unit : px
const MAX_DEGREE = 45;//unit : degree , the max degree to ajust the ellipse shape.
//const MAX_HEIGHT = Math.sin(Math.PI * MAX_DEGREE / 180) * CHILD_GAP;
//const MAX_X = Math.cos(Math.PI * MAX_DEGREE / 180 ) * CHILD_GAP;
const MIN_X = 160;//the root child cannot less than this distance;
const ORIGINAL_RATIO = 0.6;//the original ratio of ellipse ratio = b/a;





//layout the whole tree , start from root 
function layout(rootId,nodeIndex){
	const root = nodeIndex[rootId];
	root.x = 0;
	root.y = 0;
	
	//the whole area is divide to 4 sector:1,2,3,4 , respectively are : sector right/left/top/bottom
	//			|
	//			s3
	//			|
	//			|
	//			|
	//--s2-------------s1-------------
	//			|
	//			|
	//			|
	//			s4
	//			|
	//
	//
	let edge = Math.ceil(root.children.length / 2);
	let sector1 = root.children.slice(0,edge);
	let sector2 = root.children.slice(edge);
	//while(true){
	//	//balance the tree, if a sector have too many , squeeze node to the next sector
	//	let changed = false;
	//	if(sector1.length > 7){
	//		let nodeId = sector1.pop();
	//		sector2.unshift(nodeId);
	//		changed = true;
	//	}
	//	if(sector2.length > 7){
	//		let nodeId = sector2.pop();
	//		sector3.unshift(nodeId);
	//		changed = true;
	//	}
	//	if(sector3.length > 5){
	//		let nodeId = sector3.pop();
	//		sector4.unshift(nodeId);
	//		changed = true;
	//	}
	//	if(!changed){
	//		break;
	//	}
	//}

	console.info('sector1:',sector1,'sector2',sector2);
	layoutNode(sector1,1,nodeIndex);
	layoutNode(sector2,2,nodeIndex);
}

/*
 * get the x coordination , by y and orbit , orbit is number , indicate the level of orbit , start from 1(means the root's children orbit)
 * */
function getXByY(y,orbit,ratio){
	const a = CHILD_GAP + (orbit - 1)*CHILD_GAP;
	const b = a*ratio;
	return Math.sqrt( ( 1 - (y*y)/(b*b))*(a*a));
}


function calculateRatio(hiestNodeHeight){
	//according y , cal x, if x < MIN_X then , adjest the ratio
	const x = getXByY(hiestNodeHeight,1,rootRatio);
	if(x > MIN_X ){
		//return rootRatio;
		//do nothing 
	}else{
		rootRatio =  hiestNodeHeight / Math.sqrt(CHILD_GAP*CHILD_GAP - MIN_X*MIN_X);
	}
}

//the leve 1 ratio,it deside the whole mindMap shape (the ratio of the ellipse)
var rootRatio = ORIGINAL_RATIO;
function getRootRatio(){
	return rootRatio;
}
function layoutNode(nodes,sectorNumber,nodeIndex){
	let wholeGap = (nodes.length - 1)*NODE_GAP;
	let highestNodeHeight = Math.round(wholeGap/2);
	calculateRatio(highestNodeHeight);
	for(let i = 0 ; i < nodes.length ; i++){
		//calculate ever node
		const node = nodeIndex[nodes[i]];
		const y = highestNodeHeight - i*NODE_GAP;
		const x = getXByY(y,1,rootRatio);
		//let {x,y} =  polar2cartesian(CHILD_GAP,degree);
		//convert to x,y, consider sector number
		switch(sectorNumber){
			case 1:{
				node.x = x;
				node.y = -y;
				node.sector = 1;
				break;
			};
			case 2:{
				node.x = -x;
				node.y = y;
				node.sector = 2;
				break;
			};
		}
		console.info(`the node ${i} in sector${sectorNumber},x:${x},y:${y},converted x:${node.x},y:${node.y}`);
		//calculate children
		if(node.children && node.children.length > 0){
			layoutChildren(node.children,sectorNumber,nodeIndex);
		}
	}
}

function layoutChildren(nodes,sectorNumber,nodeIndex){
	const parentNode = nodeIndex[nodeIndex[nodes[0]].parent];
	const orbit = parentNode.level; 
	//calculate the middle point of child nodes. its in a strait line with parent point and root point (3 point in a line )
	const a = CHILD_GAP + (orbit - 1)*CHILD_GAP;
	const middlePointY = a / Math.sqrt( rootRatio * rootRatio + ((parentNode.x*parentNode.x)/(parentNode.y*parentNode.y))) ;
	const middlePointX = getXByY(middlePointY,2,rootRatio);//TODO temp 2 level
	//calculate the every node gap 
	const wholeGap = (nodes.length - 1)*NODE_GAP;
	const highestNodeHeight = Math.round(wholeGap / 2) + middlePointY;
	for(let i = 0 ; i < nodes.length ; i++){
		const node = nodeIndex[nodes[i]];
		const y = highestNodeHeight - i*NODE_GAP;
		const x = getXByY(y,orbit,rootRatio);
		//convert to x,y, consider sector number
		switch(sectorNumber){
			case 1:{
				node.x = x;
				node.y = -y;
				node.sector = 1;
				break;
			};
			case 2:{
				node.x = -x;
				node.y = y;
				node.sector = 2;
				break;
			};
		}
		console.info(`the node ${node.id}(child ${i} of parent) in sector${sectorNumber},x:${x},y:${y},converted x:${node.x},y:${node.y}`);
		//calculate children
		if(node.children && node.children.length > 0){
			layoutChildren(node.children,sectorNumber,nodeIndex);
		}
	}
}


export default layout;
export {getRootRatio};
