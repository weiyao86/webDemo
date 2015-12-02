//返回X2+Y2  的平方根
function Point(x, y)
{
    this.x = x;
    this.y = y;
}
Point.prototype.r = function ()
{
    return Math.sqrt(this.x * this.x + this.y + this.y);
}