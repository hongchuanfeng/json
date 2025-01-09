# JSON格式化工具

> 双视图格式化显示JSON数据

## 功能特点

* 支持编辑框查看和树状分级查看
* 双视图显示
* 支持一键复制格式化结果

## 站点预览

* https://json.openai2025.com/

## 用到的库

* Bootstrap
* jQuery.js
* clipboard.js
* jquery.json-viewer

## 代码片段

### 格式化JSON字符串

```javascript
JSON.stringify(JSON.parse(array),null,4)
```

### jquery.json-viewer格式化JSON数据

* JavaScript

```javascript
$("#json").jsonViewer(JSON.parse(string))
```

* HTML

```html
<pre id="json"></pre>
```

