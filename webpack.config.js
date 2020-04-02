const path = require('path');

// this package make bundle file smaller
const nodeExternals = require('webpack-node-externals');

//The webpack-shell-plugin will allow us to run start the app using nodemon after webpack has finished building.
const WebpackShellPlugin = require('webpack-shell-plugin');
// watch: NODE_ENV === 'development',
const { NODE_ENV = 'production' } = process.env;

module.exports = {
	entry: './src/index.ts',
	mode: NODE_ENV,
	target: 'node',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'index.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: ['ts-loader']
			}
		]
	},

	// I used the onBuildEnd option of the webpack-shell-plugin because it only runs the specified command(s)
	// after the first build. On subsequent builds, nodemon will automatically restart the app.
	plugins: [],
	devServer: {
		contentBase: path.join(__dirname, 'build'),
		compress: false,
		port: 9000,
		hot: true
	}
};
