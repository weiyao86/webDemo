   (function() {

   	var heads = document.getElementsByTagName("head");

   	var sarr = ["网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shCore.js", "网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shAutoloader.js"];
   	var jsct = 0;
   	for (var i = 0; i < sarr.length; i++) {
   		var syn = document.createElement("script");
   		syn.onload = function() {
   			jsct++;
   		};
   		syn.src = sarr[i];
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
   		link.setAttribute("href", css[i]);
   		if (heads.length)
   			heads[0].appendChild(link);
   		else
   			doc.documentElement.appendChild(link);
   	}
   	var timer = null;
   	timer = setInterval(function() {
   		if (jsct == 4) {
   			clearInterval(timer);
   			loadSyntax();
   		}
   	}, 100);
   })();
   // if (window.attachEvent) {
   // 	window.attachEvent("onload", loadSource);
   // } else if (window.addEventListener) {
   // 	window.addEventListener("load", loadSource, false);
   // }
   function loadSyntax() {
   	SyntaxHighlighter.autoloader(
   		['js', 'jscript', 'javascript', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushJScript.js'], ['bash', 'shell', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushBash.js'], ['css', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushCss.js'], ['xml', 'html', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushXml.js'], ['sql', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushSql.js'], ['php', '网页嵌入代码/syntaxhighlighter_3.0.83/scripts/shBrushPhp.js']
   	);
   	SyntaxHighlighter.all();
   }