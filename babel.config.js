module.exports = {
  // https://github.com/facebook/create-react-app/blob/main/packages/babel-preset-react-app/create.js
  // babel-preset-react-app
  presets: ["react-app"], // 因为我们搭建的是react脚手架，使用的是react语法，所以需要使用react预设才能正常编译。
  // 之前，我们在考虑兼容性问题时，还使用了core.js
  // 但是现在就不需要了，因为react-app这个预设里面就包内置了这些兼容性处理的这些配置
  // runtime也是一样的被react-app内置了
};
