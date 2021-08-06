

function fun(){
	console.log('come in')
	this.id = "test.js";
	let test = () => {
		console.log("id:", this)
	}
let s=function(){console.log(this)};
	return s;
}