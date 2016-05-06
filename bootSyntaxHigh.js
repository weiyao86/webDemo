   (function() {

   	var heads = document.getElementsByTagName("head");
   	var lurl = location.protocol + '//' + location.host + '/WebTest/';
   	var sarr = ["网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shCore.js", "网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shAutoloader.js"];
   	var jsct = 0;
   	for (var i = 0; i < sarr.length; i++) {
   		var syn = document.createElement("script");
   		syn.onload = function() {
   			jsct++;
   		};
   		syn.src = lurl + sarr[i];
   		if (heads.length)
   			heads[0].appendChild(syn);
   		else
   			doc.documentElement.appendChild(syn);
   	}
   	var css = ["网页嵌入代码/syntaxhighlighter_3.0.83/styles/shCore.css", "网页嵌入代码/syntaxhighlighter_3.0.83/styles/shThemeRDark.css"];
   	for (var i = 0; i < css.length; i++) {
   		var link = document.createElement("link");

   		link.onload = function() {
   			jsct++;
   		};

   		link.setAttribute("rel", "stylesheet");
   		link.setAttribute("type", "text/css");
   		link.setAttribute("href", lurl + css[i]);
   		if (heads.length)
   			heads[0].appendChild(link);
   		else
   			doc.documentElement.appendChild(link);
   	}
   	var timer = null;
   	timer = setInterval(function() {
   		console.log(jsct)
   		if (jsct == 4) {
   			clearInterval(timer);
   			loadSyntax(lurl);
   		}
   	}, 100);
   })();
   // if (window.attachEvent) {
   // 	window.attachEvent("onload", loadSource);
   // } else if (window.addEventListener) {
   // 	window.addEventListener("load", loadSource, false);
   // }
   function loadSyntax(lurl) {

   	SyntaxHighlighter.autoloader(
   		['js', 'jscript', 'javascript', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushJScript.js'], ['bash', 'shell', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushBash.js'], ['css', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushCss.js'], ['xml', 'html', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushXml.js'], ['sql', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushSql.js'], ['php', lurl + '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushPhp.js']
   	);
   	SyntaxHighlighter.all();
   }