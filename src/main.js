// 引入 React 并引入 ReactDOM 来进行渲染
import React from "react"; 
import ReactDOM from "react-dom/client";

// 引入前端路由
import { BrowserRouter } from "react-router-dom";

// 引入 App 组件
import App from "./App";

// 引入AntD的所有样式文件
import "antd/dist/antd.less";

// createRoot是react 18新的渲染方式
// app就是我们要渲染找到的根节点 
const root = ReactDOM.createRoot(document.getElementById("app")); 

// 通过root.render来渲染我们的App组件
root.render(
    // 前端路由必须要被包裹在BrowserRouter中，才能得到解析
    <BrowserRouter>
        <App />
    </BrowserRouter>,
);