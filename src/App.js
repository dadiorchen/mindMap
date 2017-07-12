import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			x:100,
			y:100,
		}
	}

	drawing = () =>{
		let offset = 79.5;
		let {x,y} = this.state;
		x = parseInt(x);
		y = parseInt(y);
		let absX = Math.abs(x);
		let absY = Math.abs(y);
		//let cx2 = (1-(absY/absX)*(absY/absX)) * (absX/2);
		//let cy2 = absY;
		//let cx1 = (absX*absX + absY*absY)/(2*absX);
		//let cy1 = 0;
		let cx1 = absX*0.8;
		let cy1 = 0;
		let cx2 = absX - 100;
		let cy2 = absY;
		let signX = x > 0 ? 1 : -1;
		let signY = y > 0 ? 1 : -1;
		let d = `M ${0+offset} 0 C ${cx1*signX + offset} ${cy1*signY} ${cx2*signX+offset} ${cy2*signY} ${x+offset} ${y}`;
		console.info(`the x:${x},the y:${y} , the d:${d}`);
		this.setState({line:
			<g>
				<path strokeWidth="9.19" fill="none" d={d} stroke="#e68782" stroke-dasharray="99999"></path>
				<circle cx={cx1*signX} cy={cy1*signY} r="5" fill="green" />
				<circle cx={cx2*signX} cy={cy2*signY} r="5" fill="yellow" />
			</g>
		})
	}



  render() {
    return (
      <div> 
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
      </div>
    );
  }
}

export default App;
