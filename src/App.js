import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as MindMapModel from './model/MindMapModel.js'
import {connect} from 'react-redux'
import {polar2cartesian} from './model/coordination.js'


class Element extends Component {
	constructor(props){
		super(props);
		this.state = {
			showChildren : false,
			showContextMenu : false,
		}
	}

	componentWillReceiveProps(nextProps){
		console.info('the current props:',this.props,'next props:',nextProps);
	}

	componentWillUpdate(){
		console.info('will update');
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
		
		const controlStartX = startX > 0 ? (startX + distX*0.6) : (startX - distX*0.6);
		const controlStartY = startY;
		const controlEndX = endX > 0 ? (endX - 100) : (endX + 100);
		const controlEndY = endY;
		const d = `M ${startX} ${startY} C ${controlStartX} ${controlStartY} ${controlEndX} ${controlEndY} ${endX} ${endY}`;
		console.info(`(${startX},${startY}) -> (${endX},${endY}) = d:${d}`);
		return(
			<g>
				<path strokeWidth="5" fill="none" d={d} stroke="#e68782" />
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

	render(){
		const {node,parentNode,reLayout} = this.props;
		console.info(`the reLayout time:${reLayout}`);
		const {showChildren,showContextMenu,contextMenuX,contextMenuY} = this.state;
		if(!node) return null;
		const {x,y,name,children,parent,color} = node;
		const w = parentNode?80:120;
		const h = parentNode?30:50;
		return (
			<g>
				{parentNode &&
					this.drawing(parentNode.x,parentNode.y,x,y,parentNode.id == 0 ? 120:80,80)
				}
				<g transform={`translate(${x} ${y})`} 
					onContextMenu={this.handleContextMenu}
					onClick={e => this.setState({showChildren : !showChildren})}>
					<rect x={-w/2} y={-h/2} rx='5' ry='5' width={w} height={h} strokeWidth='0' fill={color} 
						 />
					<text dy="5" textAnchor="middle" fontSize={parentNode?"18":"28"} fill="white" >{name}</text>
				</g>
				{showChildren && children && children.map(id => <ElementConnected key={id} nodeId={id} />) }
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
	constructor(props){
		super(props);
	}

	componentWillMount(){
		this.props.dispatch(MindMapModel.load());
	}

  render() {
	  const {root} = this.props;
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
		<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-720 -350 1440 700" width="1440" height="700">
		{/* the ellipses 
			<ellipse cx='0' cy='0' rx='200' ry='100' fill='transparent'  stroke='pink' />
			<ellipse cx='0' cy='0' rx='400' ry='200' fill='transparent'  stroke='pink' />
			<ellipse cx='0' cy='0' rx='600' ry='300' fill='transparent'  stroke='pink' />
			<ellipse cx='0' cy='0' rx='800' ry='400' fill='transparent'  stroke='pink' />*/}
			{root &&
				<ElementConnected key={root.id} nodeId={root.id} />
			}
		</svg>
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
