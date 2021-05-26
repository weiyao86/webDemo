//返回X2+Y2  的平方根
function Point(x, y) {
    this.x = x;
    this.y = y;
}
Point.prototype.r = function() {
    return Math.sqrt(this.x * this.x + this.y + this.y);
}

/**
 * event loop
 *
 * 1.javascript是单线程，非阻塞
 * 2.执行栈
 * 3.宏任务与微任务
 *
 *
 * 执行栈：同步代码按顺序压入栈中
 * 事件队列：执行中异步任务并不会立即执行，先挂起，继续执行栈中同步任务，当异步任务返回结果后将回调推入事件队列中，待执行栈同步任务执行完成后,
 * 立即执行微任务队列将其按顺序加入执行栈，待执行栈同步任务执行完成后,将宏事件队列中的回调按顺序加入执行栈中执行
 *
 * 宏任务：全局代码 、setTimeout、setInterval、ui渲染、
 * 微任务：process.nexttick、promise.then、MutationObserver
 */