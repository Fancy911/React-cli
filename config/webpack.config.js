const path = require("path"); // node中的path模块
const EslintWebpackPlugin = require("eslint-webpack-plugin"); // eslint插件
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 处理html的插件

const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取样式成为单独的文件
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin"); // css压缩
const TerserWebpackPlugin = require("terser-webpack-plugin"); // js压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin"); // 图片压缩

const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin"); // react热更新插件：开发模式下用

const CopyWebpackPlugin = require("copy-webpack-plugin"); // 复制文件

// 运行时，曾在package.json的script字段中定义了cross-env环境变量是development还是production
// 于是，我们可以通过获取cross-env中定义好的process.env.NODE_ENV来判断当前是开发环境还是生产环境
const isProduction = process.env.NODE_ENV === "production";

// 返回处理样式的loader函数
const getStyleLoaders = (preProcessor) => {
    return [
        // 生产环境下使用MiniCssExtractPlugin.loader, 开发环境下使用style-loader
        isProduction ? MiniCssExtractPlugin.loader : "style-loader", 
        "css-loader",
        {
            // 处理css兼容性问题
            // 配合package.json中browserslist来指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"]
                },
            },
        },
        preProcessor && {
            loader: preProcessor, // 处理less/sass/styl的loader
            options: 
                // 如果是less-loader, 则需要配置lessOptions
                // 主题色文档：https://ant.design/docs/react/customize-theme-cn#Ant-Design-%E7%9A%84%E6%A0%B7%E5%BC%8F%E5%8F%98%E9%87%8F
                preProcessor === "less-loader" 
                    ? { 
                        lessOptions: {
                            modifyVars: { // 修改antd的默认主题色
                                "@primary-color": "#1DA57A",
                            },
                            javascriptEnabled: true, // 需要配置这个才能修改主题色
                        },
                    } : {},
        },
    ].filter(Boolean);
};

module.exports = {
    entry: "./src/main.js", // 入口文件
    output: {
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined, // 打包后的文件存放的地方, 开发模式下不需要指定
        // 生产模式下需要使用contenthash
        filename: isProduction ? "static/js/[name].[contenthash:10].js" : "static/js/[name].js",
        chunkFilename: isProduction ? "static/js/[name].[contenthash:10].chunk.js" : "static/js/[name].chunk.js",
        assetModuleFilename: "static/media/[hash:10][ext][query]",
        clean: true,
    },
    // 模块配置
    module: { 
        // 模块规则(配置 loader, 解析器等选项)
        rules: [ 
            {
                oneOf: [
                    // 处理css的loader
                    {
                        test: /\.css$/,
                        use: getStyleLoaders(),
                    },
                    // 处理less的loader
                    {
                        test: /\.less$/,
                        use: getStyleLoaders("less-loader"),
                    },
                    // 处理sass的loader
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders("sass-loader"),
                    },
                    // 处理styl的loader
                    {
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader"),
                    },
                    // 处理图片的loader
                    {
                        test: /\.(png|jpe?g|gif|svg)$/,
                        type: "asset",
                        parser: {
                            dataUrlCondition: { // 图片大小小于10kb的图片转为base64
                                maxSize: 10 * 1024, // 10kb
                            },
                        },
                    },
                    // 处理字体的loader
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/,
                        type: "asset/resource",
                    },
                    // 处理js的loader, 用于处理js兼容性问题, 搭配babel.config.js使用
                    // 此处需要注意：在react中，会有jsx文件，所以js和jsx文件都要经过babel-loader处理
                    // 所以这个test的正则要同时包括js和jsx
                    {
                        test: /\.jsx?$/,
                        include: path.resolve(__dirname, "../src"), // 只处理src目录下的文件
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true, // 开启缓存（和之前学过的cache: true稍微不太一样）
                            cacheCompression: false, // 关闭缓存压缩，这样能提高打包速度
                            plugins: [
                                !isProduction && "react-refresh/babel", // 如果不是生产环境，就使用react-refresh/babel插件
                            ].filter(Boolean),
                        },
                    },
                ]
            }
        ]
    },
    // 插件配置
    plugins: [
        // 清除打包后的文件夹
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, "../src"), // 指定检查的目录
            exclude: "node_modules", // 排除检查的文件夹
            cache: true, // 开启缓存
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"), // 指定缓存文件存放的位置
        }),
        // 处理html的插件
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"), // 模板文件
        }),
        isProduction &&
            new MiniCssExtractPlugin({ // 提取css成为单独的文件
                filename: "static/css/[name].[contenthash:10].css", // 提取后的文件名
                chunkFilename: "static/css/[name].[contenthash:10].chunk.css", // 代码分割后的文件名
            }),
        isProduction &&
            // 复制public文件夹下的文件到dist文件夹下
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "../public"), // 指定要复制的源目录
                        to: path.resolve(__dirname, "../dist"), // 复制到的目的目录
                        globOptions: {
                            // 忽略index.html文件
                            // 我们不需要再复制index.html了
                            ignore: ["**/index.html"], 
                        },
                    },
                ],
            }),
        !isProduction && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    // 优化配置
    optimization: {
        // 代码分割配置
        splitChunks: {
            chunks: "all", // 代码分割的范围
            // 根据项目情况，看需要把什么模块单独打包成单个文件
            // 在我们这个项目中，我们把react、antd、剩下的node_modules单独打包
            cacheGroups: {
                // 将react react-dom react-router-dom一起打包成一个js文件
                react: {
                    test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
                    name: "chunk-react",
                    priority: 40, // 优先级: react > antd > node_modules
                },
                // antd单独打包
                antd: {
                    test: /[\\/]node_modules[\\/]antd[\\/]/,
                    name: "chunk-antd",
                    priority: 30,
                },
                // 剩下的node_modules打包成一个js文件
                libs: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "chunk-libs",
                    priority: 20,
                },
            }
        },
        // 运行时代码分割配置
        runtimeChunk: {
            name: (entrypoint) => `runtime-${entrypoint.name}`,
        },
        minimize: isProduction, // 是否压缩: 生产环境下才压缩，下面的minimizer才会生效
        // 压缩配置
        minimizer: [
            // 压缩css
            new CssMinimizerWebpackPlugin(), 
            // 压缩js配置
            new TerserWebpackPlugin(),
            // 压缩图片
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            ["svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
    },
    // webpack解析模块时，会加载这个选项
    resolve: {
        // 自动补全文件扩展名（以jsx文件来解释，就是当webpack遇到jsx文件时，就会以jsx文件自动补全文件扩展名）
        extensions: [".jsx", ".js", ".json"], // 从左到右依次解析（先看jsx文件可不可以解析，不可以在用js，在用json）
    },
    mode: isProduction ? "production" : "development", // 模式配置
    devtool: isProduction ? "source-map" : "cheap-module-source-map", // source-map配置
    // 开发服务器配置
    devServer: {
        host: "localhost", // 服务器的ip地址
        port: 3001, // 服务器的端口号
        open: true, // 自动打开浏览器
        hot: true, // 开启热更新，需要注意的是，这里的热更新是指css的热更新，js的热更新需要在plugins中配置react-refresh-webpack-plugin这个插件
        historyApiFallback: true, // 解决单页应用路由刷新404问题
    },
    performance: false, // 关闭性能提示，提升打包速度
}
