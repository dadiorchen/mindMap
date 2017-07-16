


export function polar2cartesian(radius,angle){
	return {
		x : radius * Math.cos(angle * Math.PI / 180),
		y : radius * Math.sin(angle * Math.PI / 180),
	}
}


