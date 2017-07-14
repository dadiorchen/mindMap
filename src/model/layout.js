/*
 * to calculate the position of the node tree ,using the way like baidu naotu
 * */

const childGap = 200;
const brotherGap = 100;

function calculateLeft(leftChildren,nodeIndex){
	const node = nodeIndex[leftChildren[0]];
	const parent = nodeIndex[node.parent];
	const allNodesHeight = (leftChildren.length - 1) * brotherGap;
	const highestOneY = parent.y - (allNodesHeight / 2);
	for(let i = 0 ; i < leftChildren.length ; i++){
		const node = nodeIndex[leftChildren[i]];
		node.x = parent.x + childGap;
		node.y = highestOneY + i*brotherGap;
		//calculate children
		if(node.children){
			calculateLeft(node.children,nodeIndex);
		}
	}
}
function calculateRight(rightChildren,nodeIndex){
	const node = nodeIndex[rightChildren[0]];
	const parent = nodeIndex[node.parent];
	const allNodesHeight = (rightChildren.length - 1) * brotherGap;
	const highestOneY = parent.y - (allNodesHeight / 2);
	for(let i = 0 ; i < rightChildren.length ; i++){
		const node = nodeIndex[rightChildren[i]];
		node.x = parent.x - childGap;
		node.y = highestOneY + i*brotherGap;
		//calculate children
		if(node.children){
			calculateRight(node.children,nodeIndex);
		}
	}
}

function layout(rootId,nodeIndex){
	const root = nodeIndex[rootId];
	root.x = 0;
	root.y = 0;

	//split root children to two part: left nodes and right nodes
	const leftChildrenLength = Math.ceil(root.children.length / 2);
	const leftChildren = root.children.slice(0,leftChildrenLength);
	const rightChildren = root.children.slice(leftChildrenLength);

	calculateLeft(leftChildren,nodeIndex);
	calculateRight(rightChildren,nodeIndex);
}


export default layout;
