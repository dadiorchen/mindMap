import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as MindMapModel from './model/MindMapModel.js'
import {connect} from 'react-redux'
import {polar2cartesian} from './model/coordination.js'
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import {getRootRatio,CHILD_GAP,getB} from './model/layoutEllipseBounce.js';


console.log('loaded d3 :',d3);

var referenceLine = false;

class Element extends Component {
	constructor(props){
		super(props);
		this.state = {
			showContextMenu : false,
		}
	}

	componentWillReceiveProps(nextProps){
		console.info('the current props:',this.props,'next props:',nextProps);
	}

	componentWillUpdate(){
		console.info('will update');
	}

	componentDidMount(){
		if(this.lineRef){
			setTimeout(() => {
				this.lineRef.style.strokeDashoffset = 0;
			},10);
		}
		if(this.nodeRef){
			setTimeout(() => {
				this.nodeRef.style.opacity = '1';
			},10);
		}
	}

	drawing = (startX,startY,endX,endY,startNodeWidth,endNodeWidth) =>{
		//calcutate the point (consider the node have width,and the x,y greater or lesser then 0) 
		if(endX > 0 ){
			startX = startX + startNodeWidth/2;
			endX = endX - endNodeWidth / 2;
		}else{
			startX = startX - startNodeWidth/2;
			endX = endX + endNodeWidth / 2;
		}

		
		const distX = Math.abs(startX-endX);
		const absY = Math.abs(startY - endY);
		//let cx2 = (1-(absY/absX)*(absY/absX)) * (absX/2);
		//let cy2 = absY;
		//let cx1 = (absX*absX + absY*absY)/(2*absX);
		//let cy1 = 0;
		
		const controlStartX = startX > 0 ? (startX + distX*0.2) : (startX - distX*0.2);
		const controlStartY = startY;
		const controlEndX = endX > 0 ? (endX - 100) : (endX + 100);
		const controlEndY = endY;
		const d = `M ${startX} ${startY} C ${controlStartX} ${controlStartY} ${controlEndX} ${controlEndY} ${endX} ${endY}`;
		console.info(`(${startX},${startY}) -> (${endX},${endY}) = d:${d}`);
		return(
			<g>
				<path ref={r => this.lineRef = r} strokeWidth="2" fill="none" d={d} stroke="#e68782"  
					style={{
						'strokeDasharray' : 500,
						'strokeDashoffset' : 500,
						'transition': 'all 0.5s linear',
					}}
				/>
			</g>
		)
	}

	handleContextMenu = (e) => {
		console.info('context menu click',e);
		this.setState({
			showContextMenu : !this.state.showContextMenu,
			contextMenuX : e.clientX - 720,
			contextMenuY : e.clientY - 350 + window.scrollY,
		});
		e.preventDefault();
	}
	hideContextMenu = () =>{
		this.setState({
			showContextMenu : false,
		});
	}

	addNode = () => {
		this.props.dispatch(MindMapModel.addNode(this.props.node.id));
		this.setState({
			showContextMenu : false,
		});
	}

	deleteNode = () => {
		this.props.dispatch(MindMapModel.deleteNode(this.props.node.id));
		this.setState({
			showContextMenu : false,
		});
	}

	toggleChildren = () =>{
		this.props.dispatch(MindMapModel.toggleChildren(this.props.node.id));
	}
	
	render(){
		const {node,showLevel,parentNode,reLayout} = this.props;
		if(node == undefined || node == null){
			return null;
		}
		console.info(`the reLayout time:${reLayout}`);
		const {showContextMenu,contextMenuX,contextMenuY} = this.state;
		if(!node) return null;
		const {x,y,name,children,parent,color,image,level} = node;
		if(name == '虚拟节点' && !referenceLine){//TODO
			return null;
		}
		const w = parentNode?80:120;
		const h = parentNode?30:50;

		const backgroundEllipses = [];
		const middleLine = {};
		let B = 0;
		if(level === 1 && referenceLine){
			//is root , draw background ellipse
			//calculate background ellipse
			for(let i = 1 ; i < 10 ; i++){
			  const ratio = getRootRatio();
			  const orbit = i;
			  const a = CHILD_GAP * i;	
			  const b = a*ratio;
			  backgroundEllipses.push({rx:a,ry:b});
			}
		}else if(level == 2 && referenceLine){
			//is children of root , then ,draw the middle line (middle lien to layout the children)
			middleLine.startX = x;
			middleLine.startY = y;
			B = getB(x > 0 ? -1 : 1);
			if(B == 0){
				middleLine.endX = x*10000;
				middleLine.endY = y*10000;
			}else{
				middleLine.endX  = x*10000;
				// y2 = y1*(x2-B)/(x1-B)  B=originalPoint.x
				middleLine.endY = y*(x*10000-B)/(x-B);
			}
		}
		return (
			<g>
				{level === 1 &&
					backgroundEllipses.map(e => 
						<ellipse cx='0' cy='0' rx={e.rx} ry={e.ry} fill='transparent'  stroke='pink' />
				)}
				{level === 2 &&
					<g>
					<line x1={middleLine.startX} y1={middleLine.startY} x2={middleLine.endX} y2={middleLine.endY} stroke='pink' />
					<circle cx={B} cy='0' r='5' fill='pink' />
					</g>
				}
				{parentNode &&
					this.drawing(parentNode.x,parentNode.y,x,y,parentNode.id == 0 ? 120:80,80)
				}
				<g transform={`translate(${x} ${y})`} 
					ref={r => this.nodeRef = r}
					onContextMenu={this.handleContextMenu}
					onClick={this.toggleChildren}
					style={{
						'opacity' : '0',
						'transition' : 'all 0.5s linear',
					}}
				>
					{image ? 
						<image 
							xlinkHref={image} x="-15" y="-20" height="41px" width="30px"/>
					:
						<g
						>
							<rect x={-w/2} y={-h/2} rx='5' ry='5' width={w} height={h} strokeWidth='0' fill={color} 
								 />
							<text dy="5" textAnchor="middle" fontSize={parentNode?"18":"28"} fill="white" >{name}</text>
						</g>
					}
				</g>
				{(node.showChildren ||  showLevel > node.level) && children && children.map(id => <ElementConnected key={id} nodeId={id} />) }
				{showContextMenu && 
					<ContextMenu 
						contextMenuX={contextMenuX} 
						contextMenuY={contextMenuY} 
						hide={this.hideContextMenu}
						addNode={this.addNode}
						deleteNode={this.deleteNode}
						/>
				}
			</g>
		)
	}
}

const ElementConnected = connect(
		(state,props) => {
			return {
				reLayout : state.mindMap.reLayout,
				node : MindMapModel.getNodeById(state,props.nodeId),
				parentNode : MindMapModel.getParentNodeById(state,props.nodeId),
				showLevel : state.mindMap.showLevel,
			}
		})(Element)

class ContextMenu extends Component {
	//clickPlus = () =>{
	//	this.props.hide();
	//}
	//clickMinus = () => {
	//	this.props.hide();
	//}

	render() {
		const {contextMenuX,contextMenuY,addNode,deleteNode} = this.props;
		return (
			<g transform={`translate(${contextMenuX} ${contextMenuY})`} >
				<circle r='70' fill='transparent' strokeWidth='30' stroke='#B4B4B4' />
				<ContextMenuItem radius='70' angle='0' 
					clickContextMenuItem={addNode} icon='+' />
				<ContextMenuItem radius='70' angle='60'
					clickContextMenuItem={deleteNode} icon='-' />
			</g>
		)
	}
}

class ContextMenuItem extends Component {
	constructor(props){
		super(props);
		this.state = {
			isHighlight : false,
		};
	}

	highlight = () =>{
		this.setState({
			isHighlight : true,
		});
	}

	disHighlight = () => {
		this.setState({
			isHighlight : false,
		})
	}

	render() {
		const {radius,angle,icon,clickContextMenuItem} = this.props;
		const {isHighlight }  = this.state;
		const x = polar2cartesian(radius,angle).x;
		const y = polar2cartesian(radius,angle).y;
		return(
		<g transform={`translate(${x} ${y})`} onMouseEnter={this.highlight} onMouseLeave={this.disHighlight} style={{'cursor' : 'pointer' }} 
			onClick={clickContextMenuItem}	
		>
			<circle cx={0} cy={0} r='25' strokeWidth='2' fill='#B4B4B4' stroke={!isHighlight ? '#D2D2D2' : '#ffffff'} />
			<text dy='15' textAnchor="middle" fontSize='60' fill="white" >{icon}</text>
		</g>
		)
	}
}


class App extends Component {
	//const------------------------------------
	width = 1440;
	height = 700;
	viewBoxMinX = -720;
	viewBoxMinY = -350;
	
	constructor(props){
		super(props);
		this.state = {
			width : this.width,
			height : this.height,
			viewBoxMinX : this.viewBoxMinX,
			viewBoxMinY : this.viewBoxMinY,
			viewBoxWidth : this.width,
			viewBoxHeight : this.height,
		}
	}

	componentWillMount(){
		this.props.dispatch(MindMapModel.load());
	}

	componentDidMount(){
		//setTimeout(() => {this.pathRef.style.strokeDashoffset = 0},10);
		//mount drag event
		console.info('selected:',d3.select(this.backgroundRectRef));
		d3.select(this.backgroundRectRef).call(
			d3.drag()
				.on('start',() => console.info('start drag'))
				.on('drag',(e) => {
					console.info('event:',currentEvent);
					this.move(currentEvent.dx,currentEvent.dy);
				})
				.on('end',() => console.info('end drag'))
			);
	}

	zoomRatio = 0.08;

	move = (dx,dy) => {
		let factor = 1;
		let {viewBoxMinX,viewBoxMinY,viewBoxWidth,viewBoxHeight} = this.state;
		viewBoxMinX -= dx*factor;
		viewBoxMinY -= dy*factor;
		this.setState({viewBoxWidth,viewBoxHeight,viewBoxMinX,viewBoxMinY});
	}
	moveToHome = () => {
		this.setState({
			viewBoxWidth : this.width,
			viewBoxHeight : this.height,
			viewBoxMinX : this.viewBoxMinX,
			viewBoxMinY : this.viewBoxMinY,
		});
	}

	zoomOut = () => {
		let {viewBoxMinX,viewBoxMinY,viewBoxWidth,viewBoxHeight} = this.state;
		viewBoxWidth = viewBoxWidth * (1 + this.zoomRatio);
		viewBoxHeight = viewBoxHeight * (1 + this.zoomRatio);
		viewBoxMinX = Math.round((viewBoxWidth / 2)) * (-1);
		viewBoxMinY = Math.round((viewBoxHeight / 2)) * (-1);
		this.setState({viewBoxWidth,viewBoxHeight,viewBoxMinX,viewBoxMinY});
	}

	zoomIn = () => {
		let {viewBoxMinX,viewBoxMinY,viewBoxWidth,viewBoxHeight} = this.state;
		viewBoxWidth = viewBoxWidth * (1 - this.zoomRatio);
		viewBoxHeight = viewBoxHeight * (1 - this.zoomRatio);
		viewBoxMinX = Math.round((viewBoxWidth / 2)) * (-1);
		viewBoxMinY = Math.round((viewBoxHeight / 2)) * (-1);
		this.setState({viewBoxWidth,viewBoxHeight,viewBoxMinX,viewBoxMinY});
	}

	expand = () => {
		this.props.dispatch(MindMapModel.expand());
	}
	fold = () => {
		this.props.dispatch(MindMapModel.fold());
	}


  render() {
	  const {root} = this.props;
	  const {viewBoxMinX,viewBoxMinY,viewBoxWidth,viewBoxHeight,width,height} = this.state;
    return (
      <div> 
	  {/*
	  	x:<input value={this.state.x} onChange={e => this.setState({x:e.target.value})} />
		y:<input value={this.state.y} onChange={e => this.setState({y:e.target.value})} />
		<input type="button" onClick={this.drawing} value="draw" />
<svg veron="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-720 -400 1440 800" width="1440" height="800">

	<circle cx="0" cy="0" r="10" stroke="red" fill="red" />
	<path strokeWidth="9.19" fill="none" d="M 79.5000 0.0000 C 196.2250 0.0000 162.8750 0.0000 246.2500 0.0000" stroke="#7aa3e5"></path>
	<path strokeWidth="9.19" fill="none" d="M 79.5000 0.0000 C 159.1110 0.0000 73.2306 -176.7764 173.0270 -176.7764" stroke="#7aa3e5"></path>
	<path strokeWidth="9.19" fill="none" d="M 79.5000 0.0000 C 190.5576 0.0000 124.6588 95.6707 227.2200 95.6707" stroke="#988ee3"></path>
	<path strokeWidth="9.19" fill="none" d="M 79.5000 0.0000 C 196.7642 0.0000 145.8414 -48.7725 241.4463 -48.7725" stroke="#e68782" stroke-dasharray="99999"></path>
	<circle cx="159.1110" cy="0" r="5" fill="#7aa3e5" />
	<circle cx="73.2306" cy="-176.7764" r="5" fill="#7aa3e5" />
	<circle cx="190.5576" cy="0" r="5" fill="#988ee3" />
	<circle cx="124.6588" cy="95.6707" r="5" fill="#988ee3" />
	<circle cx="196.7642" cy="0.0000" r="5" fill="#e68782" />
	<circle cx="145.8414" cy="-48.7725" r="5" fill="#e68782" />
	{this.state.line}
</svg>
		*/}
		<svg 
			version="1.1" 
			xmlns="http://www.w3.org/2000/svg" 
			viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`} 
			width={width} 
			height={height} 
			style={{
				'transition' : 'all 1s linear',
			}}
		>
			<rect 
				style={{
					'cursor' : 'pointer',
				}}
				ref={r => this.backgroundRectRef = r} 
				x={viewBoxMinX} 
				y={viewBoxMinY} 
				width={width} 
				height={height} 
				fill='transparent' />
			{root &&
				<ElementConnected key={root.id} nodeId={root.id} />
			}
		</svg>
			<div style={{'position':'absolute','top':50,'left':50}} >
				<div
					style={{'cursor':'pointer'}}
					onClick={this.zoomIn}
				>+</div>
				<div
					style={{'cursor':'pointer'}}
					onClick={this.zoomOut}
				>-</div>
				<div
					style={{'cursor':'pointer'}}
					onClick={this.fold}
				>&lt;</div>
				<div
					style={{'cursor':'pointer'}}
					onClick={this.expand}
				>&gt;</div>
				<div
					style={{'cursor':'pointer'}}
					onClick={this.moveToHome}
				>Home</div>
			</div>
      </div>
    );
  }
}

App = connect(
		(state,props) => {
			return {
				root : MindMapModel.getRoot(state),
			}
		})(App)
export default App;
