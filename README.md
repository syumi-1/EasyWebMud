# EasyWebMud
网页版可扩展适合移动端访问的MUD客户端
* 1.0版本已经完成!基本功能已经全部实现接下来就是配合MUDLIB进行定制化扩展
* （项目地址 https://github.com/syumi-1/EasyWebMud ）

[TOC]

## 介绍
* 自适应移动端设备,对中文MUD游戏更加友好,进行完配置后可完全脱离键盘进行游戏.
* 纯手打Javascript + html,没有css,没有nodejs,没有前端框架,感受原始气息.
* 零服务器需要,完全在本地进行!
* 面向对象开发,代码的可扩展性应该不错.
* UI进步空间非常大!(高情商)
---
## 用法
* 用 **最新版Chrome内核** 的浏览器,或者微信支付宝扫码!?（否则无法正常使用）打开 https://syumi-1.github.io/EasyWebMud/ 
* 在弹出的登录界面输入要连接的MUD游戏websocket地址,点击提交
* 登录成功后进入主界面,主界面分为如下几个区域
>* 左侧和下方倒数第二行为按钮区,可以用来绑定按钮
>* 最上方靠右侧的为聊天显示区(假定),他的下方最大的窗口为主显示区,在对象创建完后默认是不显示内容的,需要在游戏连接前绑定触发器进行显示(可根据个人需要自行添加窗口以及对应绑定信息:如地图之类的)
>* 最下方为输入区,使用ENTER键也可以直接提交,移动端输入法也可以进行提交,不需要来回点击按钮,↑箭头表示的是将选中的内容放置进文本框中,输入区语法见下方
---
## 操作语法
### 1. 批量执行
* 例如:
>w;nw;w;nw;look
* 可以将语法拆分,按照w nw w nw look 分次发送,事件间隔100ms
### 2. 循环
* 例如:
>#3w;#3nw;#2w
* 提交的结果就变成了 w w w nw nw nw w w 
* #号必须在每个结构最前方后面紧跟数字,请注意
### 3. 设置变量
* 例如:
>@target=张三
* 执行结束后生成一个变量为张三,大小写不限
* 变量名和等号不可以省略
* 等号后面置空的话就会清除该变量
引用的例子:
>look {{target}}
* 执行后的结果就是look 张三
### 4. 主屏幕元素点击事件
在设置脚本的时候添加了一个内置变量{{cmd}},可以指代被点击的内容本身
### 5. JS语法
在普通语法前面加入~~ 就判断为JS语法,JS中加入变量**mud**以及**cmd**,**mud**表示当前实例,**cmd**表示调用元素本身(点击元素以外为null)
* 例如:
>~~mud.ApiScript(cmd);//发送当前指令
---
## JSAPI
这里只列出常用的,部分没在这里注明的还是需要查看源代码

### **ApiSaveSetting()** 保存配置到localStorage

### **ApiLoadSetting()** 读取配置到settings

### **ApiExportSetting()** 导出文件配置

### **ApiExportSetting()** 导入文件配置

### **ApiMudDialog(dialogItem)** 创建对话框
* dialogItem为对话框内容,需要自行创建,这个方法只是提供了一个遮罩层和统一样式
```js
//示例代码
let dialog = document.createElement('div');
dialog.innerHTML = `<div>请输入 websocket 服务器地址，如：ws://mud.ren:8888</div><form onsubmit="return false;">
        <input type="text" id="mudaddress" placeholder="ws://mud.ren:8888" value="wss://mud.ren:8888" autocomplete="off">
        <input type="submit" id="mudsubmit">
        </form>`;
dialog.querySelector('#mudsubmit').onclick = () => {
    console.log(dialog.querySelector('#mudaddress').value);
    dialog.close();
}
this.ApiMudDialog(dialog);
```
### **ApiConnect(url)** 连接Websocket

### **ApiMudVar(varName, varValue)** 设置变量
* **varName** 变量名 **varValue** 值

### **ApiSleep(millisecond)** 等待
* 返回值为promise 需要用的时候记得await

### **ApiScript(action, cmdStr = null)** 发送指令
* 作用同直接发送 action最前面两个字符为~~的话作为JS脚本进行解析,cmdStr为调用来源,进行入参后在脚本解析的时候可以使用cmd变量,默认值为null

### **ApiConnectDialog()** 弹出登录对话框

### **ApiElementActive(cmdStr)** 模拟点击效果

### **ApiMudInit()** 初始化
* 从localstorage放入settings变量并初始化触发器\定时器\控件
### **ApiSetTrigger(actionName, flag = false)** 设置触发器开关
### **async ApiSetTimer(timerName, flag = false, delay = 1000) ** 设置定时器开关
### **ApiSetRule(info)** 触发器\定时器\控件\点击事件等增删改
>函数原型ApiSetRule(info = { type: null, element: null, group: null, actionName: null, action: null })

|info.type|描述|参数|说明|
|-|-|-|-| 
|praviteRule|点击元素私有行为|info.element info.action info.actionName|当info.actionName为空删除所有该元素行为,当info.action为空删除info.actionName对应行为,全不为空则添加行为
|publicRule|点击元素公共行为|info.action info.actionName|当info.action为空删除info.actionName对应行为,全不为空则添加行为
|groupRule|点击元素组行为|info.group info.action info.actionName|当info.action为空删除info.actionName对应行为,info.actionName为空删除info.group行为,全不为空则添加行为
|setGroup|设置元素到组|info.group info.element|info.group为空删除所有info.element行为,全不为空则添加行为
|triggerRule|触发器行为|info.action info.actionName|当info.action为空删除info.actionName对应行为,全不为空则添加行为
|timerRule|定时器行为|info.action info.actionName|当info.action为空删除info.actionName对应行为,全不为空则添加行为
|controlRule|控件行为|info.group info.action info.actionName|当info.action为空删除info.actionName对应行为,全不为空则添加行为
```js
//示例代码

```

### **OnCloseEventHandler(url)** WS连接中断处理
* 默认为空 需要进行覆写
### **OnSendEventHandler(strCmd)** 发送指令结束处理
* 默认为空 需要进行覆写
### **OnAddControlEventHandler(actionName)** 添加控件结束处理
* 默认为空 需要进行覆写 对DOM进行处理也写在这里
### **OnDelControlEventHandler(actionName)** 删除控件结束处理
* 默认为空 需要进行覆写 对DOM进行处理也写在这里