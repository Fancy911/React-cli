module.exports = {
  extends: ["react-app"], // 因为我们搭建的是react脚手架，所以需要继承 react 官方规则
  parserOptions: { // 解析器选项
    babelOptions: { // babel选项
      presets: [ // 预设
        // 解决页面报错问题
        ["babel-preset-react-app", false],
        "babel-preset-react-app/prod",
      ],
    },
  },
};