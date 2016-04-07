window.onload = function() {
	img_location("container", "box");
}

function img_location(parent, content) {
	//取出parent下的所有content全部子元素
	var dparent = document.getElementById(parent); //获取父元素
	var dcontent = get_child_element(dparent, content); //获得子元素个数
	//console.log(dcontent)

	var dec_width = get_width(dparent, dcontent); //固定宽度
	var image_location = min_image_locatin(dec_width, dcontent) //将图片放在高度最低的图片下


}

function get_child_element(parent, content) { //获得子元素个数
	var content_array = []; //定义数组
	var all_content = parent.getElementsByTagName("*"); //取得父元素下的的所有子元素
	for (var i = 0; i < all_content.length; i++) { //历遍所有子元素
		if (all_content[i].className == content) { //判断子元素的类名是否等于box
			content_array.push(all_content[i]) //在数组后追加元素
		}
	}
	return content_array;
}

function get_width(dparent, dcontent) { //固定宽度
	var img_width = dcontent[1].offsetWidth; //获取图片宽度
	var win_width = 600; // document.documentElement.clientWidth; //获取屏幕宽度
	var num_width = Math.floor(win_width / img_width); //获得一排摆的个数 用Math.floor()转换为整数
	dparent.style.cssText = "width:" + img_width * num_width + "px; margin:0 auto"; //固定屏幕的高并设置居中
	return num_width;

}

function min_image_locatin(dec_width, dcontent) {
	var box_height_array = [];
	debugger;
	for (var i = 0; i < dcontent.length; i++) { //遍历所有图片
		if (i < dec_width) {
			box_height_array[i] = dcontent[i].offsetHeight; //取得第一排图片的高度
		} else {
			var min_height = Math.min.apply(null, box_height_array); //获取第一排图片中高度最小的图片
			var min_index = get_min_height(box_height_array, min_height) //函数获得高度最小的图片的位置
			dcontent[i].style.position = "absolute"; //绝对定位图片
			dcontent[i].style.top = min_height + "px"; //图片距顶部像素
			dcontent[i].style.left = dcontent[min_index].offsetLeft + "px"; //图片距左的像素
			box_height_array[min_index] = box_height_array[min_index] + dcontent[i].offsetHeight; //最小图片的高度加上在他后面图片的高度
		}
	}

}

function get_min_height(box_height_array, min_height) {
	for (var i in box_height_array) {
		if (box_height_array[i] == min_height) { //循环所有数组的高度 让它等于最小图片的高度 返回i值
			return i;
		}
	}
}