module.exports = {
  printWidth: 250, // 超过最大值换行
  tabWidth: 2, // 缩进字节数
  useTabs: false, // 缩进不使用tab，使用空格
  semi: false, // 句尾添加分号
  singleQuote: true, // 使用单引号代替双引号
  quoteProps: 'as-needed', //对象属性的引号使用 仅在需要的时候使用
  jsxSingleQuote: false, // 在jsx中使用单引号代替双引号
  trailingComma: 'es5', // 在对象或数组最后一个元素后面是否加逗号（在ES5中加尾逗号）
  bracketSpacing: true, // 在对象，数组括号与文字之间加空格 "{ foo: bar }"
  jsxBracketSameLine: false, // 在jsx中把'>' 是否单独放一行
  arrowParens: 'always', //  (x) => {} 箭头函数参数只有一个时是否要有小括号。avoid：省略括号
  htmlWhitespaceSensitivity: 'ignore',
  vueIndentScriptAndStyle: true, // vue文件的script标签和Style标签下的内容需要缩进
  endOfLine: 'crlf', // 结尾是 \n \r \n\r auto
}
