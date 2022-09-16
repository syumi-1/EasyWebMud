class ezmud {
    constructor() {
        this.settings = { variables: {}, elementRules: { pravite: {}, public: {}, group: {} }, triggers: {}, controls: {}, timers: {} };
        this.runTimeFuncList = { triggers: {}, controls: {}, timers: {}, timersStatus: {} };
        this.ws = undefined;
    }

    //保存配置到localStorage
    ApiSaveSetting() {
        self.localStorage.setItem("mudSettings1_0", JSON.stringify(this.settings));
    }
    //读取配置到settings
    ApiLoadSetting() {
        this.settings = JSON.parse('' + self.localStorage.getItem("mudSettings1_0"));
        if (this.settings == null ||
            (this.settings.variables && this.settings.elementRules && this.settings.triggers && this.settings.controls && this.settings.timers) == undefined ||
            (this.settings.elementRules.pravite && this.settings.elementRules.public && this.settings.elementRules.group) == undefined) {
            this.settings = { variables: {}, elementRules: { pravite: {}, public: {}, group: {} }, triggers: {}, controls: {}, timers: {} };
            this.ApiSaveSetting();
        }
    }
    //文件导出配置
    ApiExportSetting() {
        let exportLink = self.document.createElement('a');
        exportLink.download = 'mudSettings.txt';
        exportLink.style.display = 'none';
        let blob = new Blob([JSON.stringify(this.settings, null, 4)], { type: "text/plain" });
        exportLink.href = URL.createObjectURL(blob);
        self.document.body.appendChild(exportLink);
        exportLink.click();
        self.document.body.removeChild(exportLink);
    }
    //文件导入配置
    ApiImportSetting() {
        let importObj = self.document.createElement('input');
        importObj.type = 'file';
        importObj.style.display = 'none';
        importObj.onchange = () => {
            let fReader = new FileReader();
            fReader.readAsText(importObj.files[0]);
            fReader.onload = (e) => {
                this.settings = JSON.parse(e.target.result);
                self.localStorage.setItem("mudSettings1_0", JSON.stringify(this.settings));
                self.document.body.removeChild(importObj);
            }
        }
        self.document.body.appendChild(importObj);
        importObj.click();
    }

    //创建对话框
    ApiMudDialog(dialogItem) {
        let dialog = dialogItem;
        let shadow = self.document.createElement('div');
        dialog.classList.add('mud-pop-dialog');
        shadow.className = 'mud-pop-shadow';
        dialog.close = () => { self.document.body.removeChild(shadow); self.document.body.removeChild(dialog); };
        shadow.addEventListener('click', () => { self.document.body.removeChild(shadow); self.document.body.removeChild(dialog); }, false);
        self.document.body.append(shadow);
        self.document.body.append(dialog);
    }

    //创建对话框
    ApiMudPrompt(title, placeholder = '', defaultText = '') {
        return new Promise((reject, resolve) => {
            let shadow = self.document.createElement('div');
            let dialog = self.document.createElement('div');
            shadow.className = 'mud-pop-shadow';
            dialog.classList.add('mud-pop-prompt');
            dialog.innerHTML = `<div>
                <div class="mud-pop-prompt-title"></div><hr>
                <div><textarea class="mud-pop-prompt-text"></textarea><hr>
                <div style="text-align: center"><input type="button" class="mud-pop-prompt-ok" value="确认"><input type="button" class="mud-pop-prompt-cancel" value="取消"></div>
            </div>
            `
            dialog.querySelector('.mud-pop-prompt-title').innerText = title;
            dialog.querySelector('.mud-pop-prompt-text').value = defaultText;
            dialog.querySelector('.mud-pop-prompt-text').placeholder = placeholder;
            dialog.querySelector('.mud-pop-prompt-ok').onclick = () => {
                self.document.body.removeChild(shadow); self.document.body.removeChild(dialog); reject(dialog.querySelector('.mud-pop-prompt-text').value);
            }
            dialog.querySelector('.mud-pop-prompt-cancel').onclick = () => {
                self.document.body.removeChild(shadow); self.document.body.removeChild(dialog); reject(null);
            }
            dialog.querySelector('.mud-pop-prompt-cancel').onclick = () => {
                self.document.body.removeChild(shadow); self.document.body.removeChild(dialog); reject(null);
            }
            self.document.body.append(shadow);
            self.document.body.append(dialog);
            dialog.querySelector('.mud-pop-prompt-text').select();
        })
    }

    //设置窗口可移动
    ApiMudMoveable(windowItem) {
        let lastX, lastY;
        let oldOpacity = windowItem.style.opacity || 1;
        windowItem.onmousedown = function (e) {
            e.preventDefault();
            windowItem.style.opacity = oldOpacity / 2;
            lastX = e.clientX;
            lastY = e.clientY;
            self.document.addEventListener('mousemove', onMouseMove);
            self.document.addEventListener('mouseup', onMouseUp);
            function onMouseMove(e) {
                e.preventDefault();
                windowItem.style.left = (windowItem.offsetLeft - (lastX - e.clientX)) + "px";
                windowItem.style.top = (windowItem.offsetTop - (lastY - e.clientY)) + "px";
                lastX = e.clientX;
                lastY = e.clientY;
            }
            function onMouseUp() {
                e.preventDefault();
                windowItem.style.opacity = oldOpacity;
                self.document.removeEventListener('mousemove', onMouseMove);
                self.document.removeEventListener('mouseup', onMouseUp);
            }
        }
        windowItem.ontouchstart = function (e) {
            e.preventDefault();
            windowItem.style.opacity = oldOpacity / 2;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            windowItem.ontouchmove = function (e) {
                e.preventDefault();
                windowItem.style.left = (windowItem.offsetLeft - (lastX - e.touches[0].clientX)) + "px";
                windowItem.style.top = (windowItem.offsetTop - (lastY - e.touches[0].clientY)) + "px";
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
            windowItem.ontouchcancel = function () {
                e.preventDefault();
                windowItem.style.opacity = oldOpacity;
                windowItem.ontouchmove = null;
                windowItem.ontouchcancel = null;
                windowItem.ontouchend = null;
            }
            windowItem.ontouchend = function () {
                e.preventDefault();
                windowItem.style.opacity = oldOpacity;
                windowItem.ontouchmove = null;
                windowItem.ontouchcancel = null;
                windowItem.ontouchend = null;
            }
        }
    };

    //创建动态JS脚本
    _ApiMudScript(sc) {
        return new Promise((resolve, reject) => {
            try {
                self._mud_ = this;
                let mudScript = self.document.createElement('script');
                mudScript.setAttribute("type", "text/javascript");
                mudScript.setAttribute("async", true);
                mudScript.innerHTML = sc;
                mudScript.addEventListener("error", (ev) => {
                    reject({
                        status: false,
                        message: `读取指令失败`
                    });
                });
                self.document.body.appendChild(mudScript);
                self.document.body.removeChild(mudScript);
                resolve();
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    }

    //WS连接
    ApiConnect(url) {
        if ("WebSocket" in window) {
            this.ws = new WebSocket(url, "ascii");
            this.ws.binaryType = "arraybuffer";
            this.ws.onopen = (_event) => {
                console.log("服务器连接成功！");
            };
            this.ws.onmessage = (event) => {
                let data = event.data;
                let wsMessage = '';
                if (data instanceof ArrayBuffer) {
                    let u8array = new Uint8Array(data);
                    let decoder = new TextDecoder('utf-8');
                    let msg = decoder.decode(u8array);
                    wsMessage = msg;
                } else if (data instanceof Blob) {
                    let reader = new FileReader();
                    reader.readAsText(data, 'utf-8');
                    reader.onload = (_e) => {
                        wsMessage = reader.result;
                    }
                } else if (typeof data === "string") {
                    wsMessage = data;
                }
                this._OnMessageEventHandler(wsMessage);
            };
            this.ws.onclose = (_e) => {
                console.log(_e);
                this.OnCloseEventHandler(this, url);
            };
            this.ws.onerror = (_e) => {
                console.log(_e);
                this.OnCloseEventHandler(this, url);
            };
        } else {
            console.log("您的浏览器不支持 WebSocket!");
        }
    }

    //WS获得消息调用触发器并且显示
    async _OnMessageEventHandler(wsMessage) {
        let msg = { original: wsMessage, element: null, isShow: true }
        this.OnRenderEventHandler(this, msg);
        for (let trigger in this.settings.triggers) {
            if (this.settings.triggers[trigger].valid == true) {
                if (!this.runTimeFuncList.triggers.hasOwnProperty(trigger)) {
                    await this._CompileDynamicFunc({ type: 'triggers', triggerName: trigger })
                }
                (this.runTimeFuncList.triggers[trigger])(this, msg);
            }
        }
        this.OnMudShowEventHandler(this, msg);
    }

    //发送指令
    async _ApiSendCmd(strCmd) {
        if (this.ws) {
            let sCmd = strCmd || '';
            for (let variable in this.settings.variables) {
                sCmd = sCmd.replace(new RegExp("\{\{" + variable + "\}\}", "igm"), this.settings.variables[variable]);
            }
            let sList = sCmd.split(';');
            let regLoop = /^#([0-9]+)(.+)/;
            let regVar = /^@([\S ]+)=([\S ]*)/;
            for (let i = 0; i < sList.length; i++) {
                switch (sList[i].charAt(0)) {
                    //#开头作为循环次数
                    case '#':
                        if (regLoop.test(sList[i]) == false) {
                            break;
                        }
                        let loopTime = Number(sList[i].replace(regLoop, '$1'));
                        let loopCmd = sList[i].replace(regLoop, '$2');
                        loopCmd = loopCmd.trim();
                        for (let j = 0; j < loopTime; j++) {
                            this.ws.send(loopCmd + "\n");
                            await this.ApiSleep(200);
                        }
                        break;
                    //@VAR=VALUE为变量赋值
                    case '@':
                        if (regVar.test(sList[i]) == false) {
                            break;
                        }
                        let varName = (sList[i].replace(regVar, '$1')).trim();
                        let varValue = (sList[i].replace(regVar, '$2')).trim();
                        this.ApiMudVar(varName, varValue);
                        break;
                    default:
                        this.ws.send(sList[i] + "\n");
                        await this.ApiSleep(200);
                }
            }
        } else {
            console.log("服务器未连接！");
        }
    }

    //变量修改
    ApiMudVar(varName, varValue) {
        if (varValue != null && varValue != undefined && varValue.length > 0) {
            this.settings.variables[varName] = varValue;
        } else {
            if (this.settings.variables.hasOwnProperty(varName)) {
                delete this.settings.variables[varName];
            }
        }
        this.ApiSaveSetting();
    }

    //Sleep await ApiSleep(1000) 
    ApiSleep(millisecond) {
        return new Promise((resolve) => {
            setTimeout(resolve, millisecond)
        })
    }

    //设置触发器开关
    ApiSetTrigger(actionName, flag = false) {
        if (this.settings.triggers.hasOwnProperty(actionName)) {
            this.settings.triggers[actionName].valid = flag;
        }
        this.ApiSaveSetting();
    }

    //设置定时器开关
    async ApiSetTimer(timerName, flag = false, delay = 1000) {
        if (flag) {
            await this._CompileDynamicFunc({ type: 'timer', name: timerName });
            if (!this.runTimeFuncList.timersStatus.hasOwnProperty(timerName)) {
                this.runTimeFuncList.timersStatus[timerName] = setInterval(() => { (this.runTimeFuncList.timers[timerName])(this) }, delay);
            }
        } else {
            if (this.runTimeFuncList.timersStatus.hasOwnProperty(timerName)) {
                clearInterval(this.runTimeFuncList.timersStatus[timerName]);
                delete this.runTimeFuncList.timersStatus[timerName];
                this._DeCompileDynamicFunc({ type: 'timer', name: timerName });
            }
        }
    }

    //激活控件
    ApiActiveControl(actionName) {
        if (this.runTimeFuncList.controls.hasOwnProperty(actionName)) {
            (this.runTimeFuncList.controls[actionName])(this);
        }
    }


    //设置点击项目
    ApiSetRule(info = { type: null, element: null, group: null, actionName: null, action: null }) {
        switch (info.type) {
            case 'praviteRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    if (!this.settings.elementRules.pravite.hasOwnProperty(info.element)) {
                        this.settings.elementRules.pravite[info.element] = { group: {}, action: {} };
                    }
                    if (info.actionName != null) {
                        (this.settings.elementRules.pravite[info.element]).action[info.actionName] = info.action;
                    }
                }
                else {
                    if (this.settings.elementRules.pravite.hasOwnProperty(info.element)) {
                        if (info.actionName != null && (this.settings.elementRules.pravite[info.element]).action.hasOwnProperty(info.actionName)) {
                            delete (this.settings.elementRules.pravite[info.element]).action[info.actionName];
                        } else {
                            delete this.settings.elementRules.pravite[info.element];
                        }
                    }
                }
                break;
            case 'publicRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    this.settings.elementRules.public[info.actionName] = info.action;
                }
                else {
                    if (this.settings.elementRules.public.hasOwnProperty(info.actionName)) {
                        delete this.settings.elementRules.public[info.actionName];
                    }
                }
                break;
            case 'groupRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    if (!this.settings.elementRules.group.hasOwnProperty(info.group)) {
                        this.settings.elementRules.group[info.group] = {}
                    }
                    this.settings.elementRules.group[info.group][info.actionName] = info.action;
                } else {
                    if (this.settings.elementRules.group.hasOwnProperty(info.group)) {
                        if (info.actionName != null && this.settings.elementRules.group[info.group].hasOwnProperty(info.actionName)) {
                            delete this.settings.elementRules.group[info.group][info.actionName];
                        }
                        else {
                            delete this.settings.elementRules.group[info.group];
                        }
                    }
                }
                break;
            case 'setGroup':
                if (info.group != null && info.group != undefined && info.group.length > 0) {
                    if (!this.settings.elementRules.pravite.hasOwnProperty(info.element)) {
                        this.settings.elementRules.pravite[info.element] = { group: {}, action: {} };
                    }
                    (this.settings.elementRules.pravite[info.element]).group[info.group] = 'group';
                } else {
                    if (this.settings.elementRules.pravite.hasOwnProperty(info.element)) {
                        (this.settings.elementRules.pravite[info.element]).group = {};
                    }
                }
                break;
            case 'controlRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    this.settings.controls[info.actionName] = { group: info.group, action: info.action };
                    this.OnDelControlEventHandler(this, info.actionName);
                    this._CompileDynamicFunc({ type: 'controls', name: info.actionName })
                    this.OnAddControlEventHandler(this, info.actionName);
                } else {
                    if (this.settings.controls.hasOwnProperty(info.actionName)) {
                        delete this.settings.controls[info.actionName];
                        this.OnDelControlEventHandler(this, info.actionName);
                        this._DeCompileDynamicFunc({ type: 'controls', name: info.actionName })
                    }
                }
                break;
            case 'triggerRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    this.settings.triggers[info.actionName] = { valid: false, action: info.action };
                    this._CompileDynamicFunc({ type: 'triggers', name: info.actionName })
                } else {
                    if (this.settings.triggers.hasOwnProperty(info.actionName)) {
                        delete this.settings.triggers[info.actionName];
                        this._DeCompileDynamicFunc({ type: 'triggers', name: info.actionName })
                    }
                }
                break;
            case 'timerRule':
                if (info.action != null && info.action != undefined && info.action.length > 0) {
                    this.settings.timers[info.actionName] = { action: info.action };
                } else {
                    if (this.settings.timers.hasOwnProperty(info.actionName)) {
                        delete this.settings.timers[info.actionName];
                    }
                }
                break;
            default:
                break;
        }
        this.ApiSaveSetting();
    }

    //执行命令 ~~开头的为JS脚本 其余的直接发送
    ApiScript(action, cmdStr = null) {
        let tmpAction = action;
        if (tmpAction.slice(0, 2) == '~~') {
            tmpAction = tmpAction.slice(2);
            let script = "(async()=>{let thisMud=self._mud_;let thisCmd=`" + cmdStr + "`;" + tmpAction + ";})()";
            this._ApiMudScript(script);
        }
        else {
            tmpAction = tmpAction.replace(/\{\{cmd\}\}/igm, cmdStr);
            this._ApiSendCmd(tmpAction);
        }
    }

    //编译动态函数 ~~开头的为JS脚本 其余的直接发送
    async _CompileDynamicFunc(info = { type: '', name: '' }) {
        let script = '';
        let tmpAction = '';
        switch (info.type) {
            case 'triggers':
                tmpAction = this.settings.triggers[info.name].action;
                if (tmpAction.slice(0, 2) == '~~') {
                    tmpAction = tmpAction.slice(2);
                    script = "self._mud_.runTimeFuncList.triggers['" + info.name + "']=async(pMud,msg)=>{let thisMud=pMud;" + tmpAction + ";}"
                    await this._ApiMudScript(script);
                } else {
                    this.runTimeFuncList.triggers[info.name] = () => { this._ApiSendCmd(tmpAction) };
                }
                break;
            case 'controls':
                tmpAction = this.settings.controls[info.name].action;
                if (tmpAction.slice(0, 2) == '~~') {
                    tmpAction = tmpAction.slice(2);
                    script = "self._mud_.runTimeFuncList.controls['" + info.name + "']=async(pMud)=>{let thisMud=pMud;" + tmpAction + ";}"
                    await this._ApiMudScript(script);
                } else {
                    this.runTimeFuncList.controls[info.name] = () => { this._ApiSendCmd(tmpAction) };
                }
                break;
            case 'timer':
                tmpAction = this.settings.timers[info.name].action;
                if (tmpAction.slice(0, 2) == '~~') {
                    tmpAction = tmpAction.slice(2);
                    script = "self._mud_.runTimeFuncList.timers['" + info.name + "']=async(pMud)=>{let thisMud=pMud;" + tmpAction + ";}"
                    await this._ApiMudScript(script);
                } else {
                    this.runTimeFuncList.timers[info.name] = () => { this._ApiSendCmd(tmpAction) };
                }
                break;
            default: break;
        }
    }
    //删除动态函数
    async _DeCompileDynamicFunc(info = {}) {
        switch (info.type) {
            case 'triggers':
                delete this.runTimeFuncList[info.type][info.name];
                break;
            case 'controls':
                delete this.runTimeFuncList[info.type][info.name];
                break;
            case 'timers':
                delete this.runTimeFuncList[info.type][info.name];
                break;
            default: break;
        }
    }

    //创建连接对话框
    ApiDlgConnect() {
        let dialog = self.document.createElement('div');
        dialog.innerHTML = `<div class="mud-pop-dialog-title">连接服务器</div>
                <div class="mud-pop-dialog-div">请输入 websocket 服务器地址</div>
                <form onsubmit="return false;">
                <input type="text" id="mudaddress" placeholder="ws://mud.ren:8888" value="wss://mud.ren:8888" autocomplete="off">
                <input type="submit" id="mudsubmit" class="mud-pop-dialog-button" value="开始连接">
                </form>
                `;
        dialog.querySelector('#mudsubmit').onclick = () => {
            this.ApiConnect(dialog.querySelector('#mudaddress').value);
            dialog.close();
        }
        this.ApiMudDialog(dialog);
    }

    //项目分组对话框
    ApiDlgElementGroup(cmdStr) {
        let dialog = self.document.createElement('div');
        let title = self.document.createElement('div');
        title.className = 'mud-pop-dialog-title';
        title.innerText = '请选择将' + cmdStr + '加入到的分组';
        dialog.appendChild(title);
        dialog.appendChild(self.document.createElement('hr'));
        for (let pActionName in this.settings.elementRules.group) {
            if (this.settings.elementRules.pravite.hasOwnProperty(cmdStr) &&
                (this.settings.elementRules.pravite[cmdStr]).group.hasOwnProperty(pActionName)) {
                continue;
            }
            let pButton = self.document.createElement('div');
            pButton.className = 'mud-pop-dialog-button';
            pButton.innerText = pActionName;
            pButton.addEventListener('click', () => {
                this.ApiSetRule({ type: 'setGroup', element: cmdStr, group: pActionName })
                dialog.close();
                this.ApiDlgElementGroup(cmdStr);
            }, false)
            dialog.appendChild(pButton);
        }
        let pBtnDel = self.document.createElement('div');
        pBtnDel.className = 'mud-pop-dialog-button';
        pBtnDel.innerText = '清空分组信息';
        pBtnDel.addEventListener('click', () => {
            this.ApiSetRule({ type: 'setGroup', element: cmdStr, group: null })
            dialog.close();
            this.ApiDlgElementGroup(cmdStr);
        }, false)
        dialog.appendChild(pBtnDel);
        this.ApiMudDialog(dialog);
    }
    //管理中心对话框
    ApiDlgControlCenter() {
        let dialog = self.document.createElement('div');
        let title = self.document.createElement('div');
        title.className = 'mud-pop-dialog-title';
        title.innerText = '管理中心';
        dialog.appendChild(title);
        dialog.appendChild(self.document.createElement('hr'));
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '激活/关闭触发器';
            pBtn.addEventListener('click', async () => {
                dialog.close();
                this.ApiDlgTriggerActive();
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '激活/关闭定时器';
            pBtn.addEventListener('click', async () => {
                dialog.close();
                this.ApiDlgTimerActive();
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '添加触发器';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("添加触发器","请输入要添加的触发器名"); if (usrInput == null) return;
                let usrInput1 = await this.ApiMudPrompt("添加触发器","请输入要添加的触发器语法"); if (usrInput1 == null) return;
                if (usrInput != null && usrInput1 != null) {
                    this.ApiSetRule({ type: 'triggerRule', actionName: usrInput, action: usrInput1 });
                    alert('添加成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '添加定时器';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("添加定时器","请输入要添加的定时器名"); if (usrInput == null) return;
                let usrInput1 = await this.ApiMudPrompt("添加定时器","请输入要添加的定时器语法"); if (usrInput1 == null) return;
                if (usrInput != null && usrInput1 != null) {
                    this.ApiSetRule({ type: 'timerRule', actionName: usrInput, action: usrInput1 });
                    alert('添加成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '添加控件指令';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("添加控件指令","请输入语法描述"); if (usrInput == null) return;
                let usrInput1 = await this.ApiMudPrompt("添加控件指令","请输入语法"); if (usrInput1 == null) return;
                let usrInput2 = await this.ApiMudPrompt("添加控件指令","请输入组名(左0下1右2)"); if (usrInput2 == null) return;
                if (usrInput != null && usrInput1 != null && usrInput2 != null) {
                    this.ApiSetRule({ type: 'controlRule', actionName: usrInput, action: usrInput1, group: usrInput2 });
                    alert('添加成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '添加公共指令';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("添加公共指令","请输入语法描述"); if (usrInput == null) return;
                let usrInput1 = await this.ApiMudPrompt("添加公共指令","请输入要添加的公共指令的语法", "{{cmd}}"); if (usrInput1 == null) return;
                if (usrInput != null && usrInput1 != null) {
                    this.ApiSetRule({ type: 'publicRule', actionName: usrInput, action: usrInput1 });
                    alert('添加成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '添加分组指令';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("添加分组指令","请输入语法描述"); if (usrInput == null) return;
                let usrInput1 = await this.ApiMudPrompt("添加分组指令","请输入语法"); if (usrInput1 == null) return;
                let usrInput2 = await this.ApiMudPrompt("添加分组指令","请输入组名"); if (usrInput2 == null) return;
                if (usrInput != null && usrInput1 != null && usrInput2 != null) {
                    this.ApiSetRule({ type: 'groupRule', actionName: usrInput, action: usrInput1, group: usrInput2 });
                    alert('添加成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        dialog.appendChild(self.document.createElement('hr'));
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除触发器';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除触发器","请输入要添加的触发器名"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'triggerRule', actionName: usrInput, action: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除定时器';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除定时器","请输入要添加的定时器名"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'timerRule', actionName: usrInput, action: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除控件';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除控件","请输入控件语法描述"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'controlRule', actionName: usrInput, action: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除公共指令';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除公共指令","请输入控件语法描述"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'publicRule', actionName: usrInput, action: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除分组';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除分组","请输入组名"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'groupRule', group: usrInput, actionName: null, action: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '删除项目绑定';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("删除项目绑定","请输入要删除的项目绑定名"); if (usrInput == null) return;
                if (usrInput != null) {
                    this.ApiSetRule({ type: 'praviteRule', element: usrInput, group: null });
                    alert('删除成功');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        dialog.appendChild(self.document.createElement('hr'));
        {
            let pBtn = self.document.createElement('div');
            pBtn.className = 'mud-pop-dialog-button';
            pBtn.innerText = '初始化全部设定';
            pBtn.addEventListener('click', async () => {
                let usrInput = await this.ApiMudPrompt("初始化全部设定","请输入 confirm 确认初始化全部设定"); if (usrInput == null) return;
                if (usrInput == 'confirm') {
                    this.settings = { variables: {}, elementRules: { pravite: {}, public: {}, group: {} }, triggers: {}, controls: {}, timers: {} };
                    this.ApiSaveSetting();
                    this.ApiMudInit();
                    alert('初始化完成');
                }
            }, false)
            dialog.appendChild(pBtn);
        };
        this.ApiMudDialog(dialog);
    }

    //触发器控制对话框
    ApiDlgTriggerActive() {
        let dialog = self.document.createElement('div');
        let title = self.document.createElement('div');
        title.className = 'mud-pop-dialog-title';
        title.innerText = '触发器控制';
        dialog.appendChild(title);
        dialog.appendChild(self.document.createElement('hr'));
        for (let pActionName in this.settings.triggers) {
            if ((this.settings.triggers[pActionName]).valid == true) {
                let pButton = self.document.createElement('div');
                pButton.className = 'mud-pop-dialog-button';
                pButton.innerText = '[关闭]' + pActionName;
                pButton.addEventListener('click', () => {
                    this.ApiSetTrigger(pActionName, true);
                    dialog.close();
                    this.ApiDlgTriggerActive();
                }, false)
                dialog.appendChild(pButton);
            } else {
                let pButton = self.document.createElement('div');
                pButton.className = 'mud-pop-dialog-button';
                pButton.innerText = '[激活]' + pActionName;
                pButton.addEventListener('click', () => {
                    this.ApiSetTrigger(pActionName, false);
                    dialog.close();
                    this.ApiDlgTriggerActive();
                }, false)
                dialog.appendChild(pButton);
            }
        }
        this.ApiMudDialog(dialog);
    }

    //定时器控制对话框
    ApiDlgTimerActive() {
        let dialog = self.document.createElement('div');
        let title = self.document.createElement('div');
        title.className = 'mud-pop-dialog-title';
        title.innerText = '定时器控制';
        dialog.appendChild(title);
        dialog.appendChild(self.document.createElement('hr'));
        for (let pActionName in this.settings.timers) {
            if (!this.runTimeFuncList.timersStatus.hasOwnProperty(pActionName)) {
                let pButton = self.document.createElement('div');
                pButton.className = 'mud-pop-dialog-button';
                pButton.innerText = '[激活]' + pActionName;
                pButton.addEventListener('click', async () => {
                    let usrInput = await this.ApiMudPrompt('[激活]' + pActionName,"请输入间隔时间(毫秒)", "10000"); if (usrInput == null) return;
                    this.ApiSetTimer(pActionName, true, Number(usrInput));
                    dialog.close();
                    this.ApiDlgTimerActive();
                }, false)
                dialog.appendChild(pButton);
            }
        }
        for (let pActionName in this.runTimeFuncList.timersStatus) {
            let pButton = self.document.createElement('div');
            pButton.className = 'mud-pop-dialog-button';
            pButton.innerText = '[关闭]' + pActionName;
            pButton.addEventListener('click', async () => {
                this.ApiSetTimer(pActionName, false, null);
                dialog.close();
                this.ApiDlgTimerActive();
            }, false)
            dialog.appendChild(pButton);
        }
        this.ApiMudDialog(dialog);
    }



    //项目点击对话框
    ApiDlgElementActive(cmdStr) {
        if (this.settings.elementRules.pravite.hasOwnProperty(cmdStr) && (this.settings.elementRules.pravite[cmdStr]).action.hasOwnProperty('direct')) {
            this.ApiScript((this.settings.elementRules.pravite[cmdStr]).action['direct'], cmdStr);
            return;
        }
        let dialog = self.document.createElement('div');
        let title = self.document.createElement('div');
        title.className = 'mud-pop-dialog-title';
        title.innerText = cmdStr;
        dialog.appendChild(title);
        dialog.appendChild(self.document.createElement('hr'));
        if (this.settings.elementRules.pravite.hasOwnProperty(cmdStr)) {
            for (let pActionName in (this.settings.elementRules.pravite[cmdStr]).action) {
                let pButton = self.document.createElement('div');
                pButton.className = 'mud-pop-dialog-button';
                pButton.innerText = pActionName;
                pButton.addEventListener('click', () => {
                    this.ApiScript((this.settings.elementRules.pravite[cmdStr]).action[pActionName], cmdStr);
                    dialog.close();
                }, false)
                dialog.appendChild(pButton);
            }
            for (let pGroup in (this.settings.elementRules.pravite[cmdStr]).group) {
                if (this.settings.elementRules.group.hasOwnProperty(pGroup)) {
                    for (let pActionName in this.settings.elementRules.group[pGroup]) {
                        let pButton = self.document.createElement('div');
                        pButton.className = 'mud-pop-dialog-button';
                        pButton.innerText = pActionName;
                        pButton.addEventListener('click', () => {
                            this.ApiScript(this.settings.elementRules.group[pGroup][pActionName], cmdStr);
                            dialog.close();
                        }, false)
                        dialog.appendChild(pButton);
                    }
                }
            }
        }
        for (let pActionName in this.settings.elementRules.public) {
            let pButton = self.document.createElement('div');
            pButton.className = 'mud-pop-dialog-button';
            pButton.innerText = pActionName;
            pButton.addEventListener('click', () => {
                this.ApiScript(this.settings.elementRules.public[pActionName], cmdStr);
                dialog.close();
            }, false)
            dialog.appendChild(pButton);
        }
        this.ApiMudDialog(dialog);
    }

    //初始化
    async ApiMudInit() {
        //关闭定时器
        for (let actionName in this.runTimeFuncList.timersStatus) {
            await this.ApiSetTimer(actionName, false);
        }
        //删除控件
        for (let actionName in this.runTimeFuncList.controls) {
            this.OnDelControlEventHandler(this, actionName);
        };
        //删除全部运行时编译函数
        this.runTimeFuncList = { triggers: {}, controls: {}, timers: {}, timersStatus: {} };

        //从localStorage读取配置
        this.ApiLoadSetting();

        //编译runTimeFuncList
        for (let actionName in this.settings.triggers) {
            this._CompileDynamicFunc({ type: 'triggers', name: actionName });
        };
        for (let actionName in this.settings.controls) {
            this.OnAddControlEventHandler(this, actionName);
            //重绘控件
            this._CompileDynamicFunc({ type: 'controls', name: actionName });
        };

        this.OnInitEndEventHandler(this);
    }

    //WS连接中断处理
    OnCloseEventHandler(pMud, url) { }

    //添加控件结束UI绘制
    OnAddControlEventHandler(pMud, actionName) { }

    //删除控件结束UI绘制
    OnDelControlEventHandler(pMud, actionName) { }

    //初始化结束
    OnInitEndEventHandler(pMud) { }

    //渲染WS
    OnRenderEventHandler(pMud, msg = { original: null, element: null, isShow: true }) { }

    //在界面上显示MUD
    OnMudShowEventHandler(pMud, msg = { original: wsMessage, element: null, isShow: true }) { }
};