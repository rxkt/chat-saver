const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, ".savedchat.tmp");

class ChatSaver {

    constructor(mod) {
        this.mod = mod;
        this.enabled = true;
        this.loadHooks();
        this.loadCommands();
        this.writeCache = undefined;
        this.readCache = undefined;
    }

    loadCommands() {
        this.mod.command.add('savechat', this.saveChat.bind(this));
        this.mod.command.add('chatsaver', this.enable.bind(this));
    }
    loadHooks() {
        this.mod.hook('C_REPLY_CLIENT_CHAT_OPTION_SETTING', 'raw', this.onSaveData.bind(this));
        this.mod.hook('S_LOGIN', 'raw', this.onLogin.bind(this));
    }

    onSaveData = (opcode, rawData) => {

        let data = rawData.toString('hex');
        this.writeCache = data;

        if (this.enabled && this.readCache !== undefined) {
            return Buffer.from(this.readCache, "hex");
        } else {
            return rawData;
        }
    }
    onLogin = (opcode, rawData) => {
        this.readCache = this.readFile();
    }

    enable() {
        this.enabled = !this.enabled;
        this.mod.command.message(`Chat saver ${this.enabled ? 'en' : 'dis'}abled.`);
    }
    saveChat() {
        if (this.writeCache === undefined) {
            this.mod.command.message("Please edit your chat config around a bit first.");
            return;
        }
        this.mod.command.message('Saved chat settings for the next time you relog.')
        this.writeFile(this.writeCache);
    }

    writeFile(data) {
        fs.writeFileSync(filePath, data);
    }
    readFile() {
        try {
            let data = fs.readFileSync(filePath).toString();
            // maybe should await promise for reading on login?
            return data !== "" ? data : undefined;
        } catch (error) {
            console.log("Problem reading file for chat.");
        }
    }

    destructor() {
        this.mod.command.remove(['savechat', 'chatsaver']);
    }
};

module.exports = ChatSaver;
