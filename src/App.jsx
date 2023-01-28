import React from "react";
import { lazy, Suspense } from "react"; // 路由懒加载：当我们访问某个路由的时候，才去加载对应的组件，这样可以提高性能
// 路由懒加载可以体现在splitChunks中：当我们点击Home组件时，它只加载home的相关js，点击About组件时，它只加载about的相关js

import { Link, Routes, Route } from "react-router-dom"; // 引入路由链接组件
// (我们用的是6.x版本的react-router-dom, 原来的switch组件已经被Routes组件替代，要生成多个Route就要用Routes包裹它们)

// 引入一个Antd的Button组件
import { Button } from "antd";

// import Home from "./pages/Home";
// import About from "./pages/About";
// lazy函数：用来实现路由懒加载，它接收一个函数作为参数，这个函数返回一个Promise对象，这个Promise对象的结果是一个组件
// lazy函数用于定义路由懒加载的组件
const Home = lazy(() => import(/* webpackChunkName: 'home' */ "./pages/Home")); // 路由懒加载，webpackChunkName是用来给打包后的js文件的模板名字
const About = lazy(() => import(/* webpackChunkName: 'about' */ "./pages/About")); // 路由懒加载

// 定义一个App函数，返回我们要渲染的内容
function App() {
  return (
    <div>
        <h1>App</h1>
        {/* Antd的Button组件 */}
        <Button type="primary">Button</Button>
        {/* 做一个导航 */}
        <ul>
            <li>
                <Link to="/home">Home</Link>
            </li>
            <li>
                <Link to="/about">About</Link>
            </li>
        </ul>
        {/* 配置路由：加载显示我们的组件 */}
        {/* React Router 6.x的版本中：
        Routes组件是用来包裹Route组件的
        Route组件是用来配置路由的，它有两个属性：path和element，path是路由的路径，element是要显示的组件
        原来的版本中element是component，现在已经被替换了 */}
        {/* Suspense用于显示加载中的内容 */}
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </Suspense>
    </div>
  );
}

// 导出App函数
export default App;
