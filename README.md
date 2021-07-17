# Chat Saver  
## By rxkt#2283  
  
  
### How to use:  
  This module will always attempt to load your saved config.  
  
  To change settings:  
  1. Change your chat settings to whatever your preferences are.  
  2. `/8 savechat` to save your preferences.  
  
  
  **IMPORTANT NOTE**
  Use `/8 savechat` quickly after changing chat settings for best results. The client automatically sends Chat UI settings packets every 5-10 seconds for whatever reason and that may mess up your settings.  
  I suggest fixing your settings all at once, then doing a final apply/save and doing `/8 savechat`.  
  
Add the definition from "defs" folder to your own proxy/data/defs folder.  
Add the opcode as needed.  
  
NA opcode as of Jul 14 2021:  
  C_REPLY_CLIENT_CHAT_OPTION_SETTING 46250  