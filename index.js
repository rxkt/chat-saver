const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, "savedchat.tmp");

class ChatSaver {

    constructor(mod) {
        this.mod = mod;
        this.enabled = true;
        this.loadHooks();
        this.loadCommands();
        this.chatCache = undefined;
    }

    loadCommands() {
        this.mod.command.add('savechat', this.saveChat.bind(this));
        this.mod.command.add('chatsaver', this.enable.bind(this));
    }
    loadHooks() {
        this.mod.hook('C_REPLY_CLIENT_CHAT_OPTION_SETTING', 'raw', this.onSaveData.bind(this));
    }

    onSaveData = (opcode, rawData) => {

        let data = rawData.toString('hex');
        this.chatCache = data;
        let hexString = undefined;
        try {
            hexString = this.readFile();
        } catch (error) {
            console.log("Problem reading file for chat.");
            return;
        }
        if (hexString === "" || hexString === undefined) {
            console.log("No data saved. Please save data before attempting to overwrite chat settings with /8 chatsave.");
            return;
        }
        if (this.enabled) {
            return Buffer.from(hexString, "hex");
        }
    }

    enable() {
        this.enabled = !this.enabled;
        this.mod.command.message(`Chat saver ${this.enabled ? 'en' : 'dis'}abled.`);
    }
    saveChat() {
        if (this.chatCache === undefined) {
            this.mod.command.message("Please edit your chat config around a bit first.");
            return;
        }
        this.mod.command.message('Saved chat settings for the next time you relog.')
        this.writeFile(this.chatCache);
    }

    writeFile(data) {
        fs.writeFileSync(filePath, data);
    }
    readFile() {
        let data = fs.readFileSync(filePath).toString();
        return data;
    }

    destructor() {
        this.mod.command.remove(['savechat', 'chatsaver']);
    }
};

module.exports = ChatSaver;
