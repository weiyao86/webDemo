const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
	entry: [
		"./图片组件/three/data/model.js"
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'model.min.js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			// inject: true,
			// chunks: ['a'],
			filename: "test.html",
			//template: './图片组件/three/js/hotpoint/model.html',
			inlineSource: '.(js|css)$'
		}),
		new HtmlWebpackInlineSourcePlugin()
	]
};