/**
JS封装类方法一
**/
function myClass() {
    this.name = "zhangshan";
}
myClass.prototype = {
    init: function () {
        alert("init");
    },
    load:function(){
        alert("load");
    }
}
/**
JS封装类方法二
**/
var my=function(){
    this.name = "zhangshan";
}
my.prototype = {
    init: function () {
        alert("init");
    },
    load: function () {
        alert("load");
    }
}
/**
JS封装类方法三
**/
var Moduls = Moduls || {};
(function () {
    Moduls.myClassTest = function () {
        this.name = "lisi";
        this.age = 29;
    };
    Moduls.youClassTest = function () {
        this.override = "override";
    }
    Moduls.myClassTest.prototype ={
        init: function () { alert("封包Jquery"); },
        load: function () { alert("封包Jquery的Load方法");}
    }
    Moduls.youClassTest.prototype = {
        init:function(){
            alert("init");
        }
    }
})();