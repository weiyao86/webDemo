$(document).ready(function(){

  
	
	
	
	//1.淡出淡入效果
/*$('#Header ul li').hover(function(){
		$(this).children('.content_').stop(true,true).slideDown(300);
},function(){
		$(this).children('.content_').stop(true,true).slideUp(500);
	});*/

//2.图片切换
	var page=1;	
	var i=3;
	$('.og_prev').click(function(){
	  var markVal = $(this).attr("value");
	  var content=$("#picbox"+markVal);
	  var content_list=$("#piclist"+markVal);
	  var v_width=content.width();
	  var len=content.find("li").length;
	  var page_count=Math.ceil(len/i);
	  if(!content_list.is(":animated")){
	     if(page==page_count){
	     content_list.animate({left:'0px'},"1000");   
	       page=1;
	     }else{
	       content_list.animate({left:'-='+v_width},"1000");
	       page++;
	     }
	  }
});
   //往前 按钮      
   $(".og_next").click(function(){  
        var markVal = $(this).attr("value");
		  var content=$("#picbox"+markVal);
		  var content_list=$("#piclist"+markVal); 
         var v_width = content.width();  
         var len = content.find("li").length; 
         var page_count = Math.ceil(len / i) ;   //只要不是整数，就往大的方向取最小的整数  
         if(!content_list.is(":animated") ){    //判断“内容展示区域”是否正在处于动画  
             if(page ==1){  //已经到第一个版面了,如果再向前，必须跳转到最后一个版面。  
                content_list.animate({ left : '-='+v_width*(page_count-1) }, "1000");  
                page = page_count;  
            }else{  
                content_list.animate({ left : '+='+v_width }, "1000");  
                page--;  
            }  
        }  
   }); 
    
 //放大效果

	 $(function(){
	
	$(".b").mouseover(function(){
		$(this).parents("li.preview").find(".MYCLASS").show();
	})
	$(".b").mouseout(function(){
		$(".MYCLASS").hide();
	})
})
 /*	$(function(){
	var mouseX = 0;//鼠标移动的位置X
	var mouseY = 0;//鼠标移动的位置Y
	var maxLeft = 0;//最右边
	var maxTop = 0;//最下边
	var markLeft = 0;//放大镜移动的左部距离
	var markTop = 0;//放大镜移动的顶部距离
	var perX = 0;//移动的X百分比
	var perY = 0;//移动的Y百分比
	var bigLeft = 0;//大图要移动left的距离
	var bigTop = 0;//大图要移动top的距离
	
	//改变放大镜的位置
	function updataMark($b){
	//通过判断，让小框只能在小图区域中移动
	if(markLeft<0){
	markLeft = 0;
	}else if(markLeft>maxLeft){
	markLeft = maxLeft;
	}
	if(markTop<0){
	markTop = 0;
	}else if(markTop>maxTop){
	markTop = maxTop;
	}
	//获取放大镜的移动比例，即这个小框在区域中移动的比例
	perX = markLeft/$(".b").outerWidth();
	perY = markTop/$(".b").outerHeight();
	bigLeft = -perX*$(".MYCLASS").outerWidth();
	bigTop = -perY*$(".MYCLASS").outerHeight();
	//设定小框的位置
	$d.css({"left":markLeft,"top":markTop,"display":"block"});
	}
	//改变大图的位置
	function updataBig(){
	$(".MYCLASS").css({"display":"block","left":bigLeft,"top":bigTop});
	}
	//鼠标移出时
	function cancle(){
	$(".MYCLASS").css({"display":"none"});
	//$(".d").css({"display":"none"});
	}
	//鼠标小图上移动时
	function imgMouseMove(event){
	var $this = $(this);
	var $d = $(this).children(".d");
	  
	//鼠标在小图的位置
	mouseX = event.pageX-$this.offset().left - $simg.outerWidth()/2;
	mouseY = event.pageY-$this.offset().top - $simg.outerHeight()/2;
	//最大值
	maxLeft =$this.width()- $simg.outerWidth();
	maxTop =$this.height()- $simg.outerHeight();
	markLeft = mouseX;
	markTop = mouseY;
	updataMark($d);
	updataBig();
	}
	$(".d").bind("mousemove",imgMouseMove).bind("mouseleave",cancle);
	})
*/
});
