const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, ".config.json");

class ChatSaver {

    constructor(mod) {
        this.mod = mod;
        this.loadHooks();
        this.loadCommands();
        this.writeCache = undefined;
        this.readCache = undefined;
        this.loginComplete = false;
    }

    loadCommands() {
        this.mod.command.add('savechat', this.saveChat.bind(this));
        this.mod.command.add('loadchat', this.loadChat.bind(this));
    }
    loadHooks() {
        this.mod.hook('S_LOGIN', 'raw', this.onLogin.bind(this));
        this.mod.hook('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.onSave.bind(this));
        // if it fails, we may need to hook on C_REQUEST_CLIENT_CHAT_OPTION_SETTING
    }

    onLogin() {
        this.readFile();
        this.loginComplete = true;
    }
    onSave(event) {
        this.writeCache = { tabs: event.tabs, channels: event.channels };
        // block the packet when not logged into a character
        if (this.loginComplete === false) {
            return false;
        }
    }

    saveChat() {
        if (this.writeCache === undefined) {
            this.mod.command.message("Please edit your chat config around a bit first.");
            return;
        }
        this.mod.command.message('Saved chat settings for the next time you relog.');
        this.writeFile(this.writeCache);
        return true;
    }
    loadChat() {
        this.readFile();
        if (this.readCache !== undefined) {
            this.readCache['accountId'] = this.mod.game.accountId;
            this.mod.send('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.readCache);
            this.mod.command.message("Please relog to load settings.");
            this.loginComplete = false;
            return false;
        } else {
            this.mod.command.message('No settings saved.');
            return;
        }
    }


    writeFile(data) {
        fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
    }
    readFile() {
        try {
            let data = fs.readFileSync(filePath).toString();
            data = (data !== "" ? data : undefined);
            this.readCache = JSON.parse(data);
        } catch (error) {
            console.log("Problem reading file for chat.");
        }
    }

    destructor() {
        this.mod.command.remove(['savechat', 'loadchat']);
    }
};

module.exports = ChatSaver;
