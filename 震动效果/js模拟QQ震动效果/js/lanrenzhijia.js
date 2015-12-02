
//obj为震动的对象，对象前提是在相对定位或者是绝对
//Rate为改变上左搬动一次所需的时间,建议范围20-30
//speed为做一次需要的时间,建议范围60-70
//times为震动的次数,默认的话则为一直在震动,调用你new出来的这个对象的stoped则为停止
function Shank(obj, Rate, speed, times) {
	this.obj = obj
	this.L = this.obj.offsetLeft;
	this.T = this.obj.offsetTop;
	this.Rate = Rate;
	this.speed = speed
	this.times = times;
	this.Timer = null;
	this.num = 0;
	var that = this;
	this.start()
}
Shank.prototype = {
	start: function() {
		this.num++;
		var that = this
		if (this.num == this.times*2) {
			this.stoped()
		} else {
			if (parseInt(this.obj.style.left) == Math.abs(this.L - 2)) {
				var that = this
				this.obj.style.top =Math.abs( this.T + 2 )+ "px";
				setTimeout(function() {
					that.obj.style.left = Math.abs(that.L + 2) + "px"
				}, this.Rate)
			} else {
				var that = this
				this.obj.style.top = Math.abs(this.T - 2) + "px";
				setTimeout(function() {
					that.obj.style.left = Math.abs(that.L - 2) + "px"
				}, this.Rate)
			}
			this.Timer = setTimeout(function() {
				that.start()
			}, this.speed);
		}
	},
	stoped: function() {
		this.obj.style.left=this.L +'px'
		this.obj.style.top=this.T +'px'
		clearTimeout(this.Timer);
	}
}