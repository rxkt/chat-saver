const fs = require('fs');
const path = require('path');
// const filePath = path.join(__dirname, ".config.json");
const configPath = path.join(__dirname, ".config");

class ChatSaver {
    constructor(mod) {
        this.mod = mod;
        this.loadDefinitions();
        this.loadHooks();
        this.loadCommands();
        this.writeCache = undefined;
        this.readCache = undefined;
    }

    loadDefinitions() {
        this.mod.dispatch.protocol.loadCustomDefinitions(path.resolve(__dirname, 'defs'));
        if (this.mod.dispatch.protocolVersion == 383529) this.mod.dispatch.addOpcode('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 46250);
    }
    loadCommands() {
        this.mod.command.add('savechat', this.saveChat.bind(this));
        this.mod.command.add('loadchat', this.loadChat.bind(this));
    }
    loadHooks() {
        this.mod.hook('S_LOGIN_ACCOUNT_INFO', 'raw', this.onAccountInfo.bind(this));
        this.mod.hook('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.onSave.bind(this));
        this.mod.hook('S_REPLY_CLIENT_CHAT_OPTION_SETTING', 1, this.onReplyClient.bind(this));
    }

    onAccountInfo() {
        this.readFile();
    }
    onSave(event) {
        this.writeCache = event;
        if (this.readCache) {
            this.mod.send('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.readCache);
            return false;
        } else {
            console.log('No settings found for this account.');
        }
    }
    onReplyClient() {
        // in case C_REQUEST_CLIENT_CHAT_OPTION_SETTING changes chat settings
        // we send another keybind save packet
        if (this.readCache) {
            this.mod.send('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.readCache);
        }
    }

    saveChat() {
        if (this.writeCache === undefined) {
            this.mod.command.message("Please edit your chat config around a bit first.");
            return;
        }
        this.mod.command.message('Saved chat settings.');
        this.writeCache.accountId = Number(this.writeCache.accountId);
        this.writeFile(this.writeCache);
        this.readCache = this.writeCache;
    }
    loadChat() {
        this.readFile();
        if (this.readCache !== undefined) {
            this.mod.send('C_SAVE_CLIENT_CHAT_OPTION_SETTING', 2, this.readCache);
            this.mod.command.message("Please relog to load settings.");
        } else {
            this.mod.command.message("No settings for this account found. Please save settings before loading.");
        }
    }

    writeFile(data) {
        if (!fs.existsSync(configPath)) {
            fs.mkdirSync(configPath, { recursive: true });
        }
        fs.writeFileSync(path.join(configPath, `${this.mod.game.accountId}.json`), JSON.stringify(data, undefined, 2));
    }
    readFile() {
        try {
            let data = fs.readFileSync(path.join(configPath, `${this.mod.game.accountId}.json`)).toString();
            data = (data !== "" ? data : undefined);
            this.readCache = JSON.parse(data);
        } catch (error) {
            console.log("Could not find file for chat settings.");
        }
    }

    destructor() {
        this.mod.command.remove(['savechat', 'loadchat']);
    }
};

module.exports = ChatSaver;
