/*
  Copyright (c) 2017 @miso_develop
  https://qiita.com/miso_develop/items/204b2e16b1e58e52dc07
  local modification: yes
*/
var firebase = require("firebase");
const appConfig = require('./app.config.js')
const address = appConfig.address

//firebase config
var firebaseConfig = require('./firebase.config.js')
console.log(JSON.stringify(firebaseConfig, null, 2))
firebase.initializeApp(firebaseConfig);

//jsonからvalueに一致する値取得
const getJsonData = (value, json) => {
  for (var word in json)  if (value == word) return json[word]
  return json["default"]
}

class Command {
  constructor ({target, op}) {
    this.target = target
    this.op = op
  }
}


//database更新時
const path = "/googlehome";
const key = "word";
const db = firebase.database();
db.ref(path).on("value", function(changedSnapshot) {
  //値取得
  const value = changedSnapshot.child(key).val();
  if (value) {
    console.log(value);

    //コマンド生成
    const command = getJsonData(value.split(" ")[0], {

      //シーリングライト
      "light": () => {
        const command = "sh /home/pi/irmagician/light/ir.sh ";
        const option = getJsonData(value.split(" ")[1], {
          "つけ": "full",
          "オン": "full",
          "消し": "off",
          "けし": "off",
          "オフ": "off",
          "エコ": "eco",
          "楽": "easy",
          "ラクニエ": "easy",
          "節電": "save",
          "おやすみ": "sleep",
          "タイマー": "sleep",
          "保安": "security",
          "豆": "security",
          "a": "a",
          "1": "a",
          "b": "b",
          "2": "b",
          "に": "b",
          "c": "c",
          "3": "c",
          "さん": "c",
          "傘": "c",
          "館": "c",
          "d": "d",
          "4": "d",
          "音": "d",
          "屋": "d",
          "default": false
        });
        return option ? command + option : option;
      },

      //template
      "projector": () => {
        return new Command({
          target: 'projector',
          op: getJsonData(value.split(" ")[1], {
          "つけ": "power",
          "オン": "power",
          "消し": "power",
          "けし": "power",
          "オフ": "power",
          "default": false
          })
        })
      },

      "tv": () => {
        return new Command({
          target: 'tv',
          op: getJsonData(value.split(' ')[1], {
          "つけ": "power",
          "オン": "power",
          "消し": "power",
          "けし": "power",
          "オフ": "power",
          "default": false
          })
        })
      },

      //default
      "default": () => false,

    })();
    console.log(command);

    //コマンド実行
    if (command) {
      if (command instanceof Command) {
        const broadlink = require('./getDevice.js')
        const rmlist = require('./rmlist.js')
        // const address = '34:ea:34:42:9e:1b'
        const commandKey = `${command.target}_${command.op}`
        if (rmlist[commandKey] == null) {
          console.log(`invalid command: ${commandKey}`)
        } else {
          const timer = setInterval(() => {
            console.log('trying')
            const rm = broadlink({host: address})
            if (rm != null) {
              const hexDataBuffer = new Buffer(rmlist[commandKey], 'hex')
              rm.sendData(hexDataBuffer)
              clearInterval(timer)
              console.log('success')
            }
          }, 1000)
        }
      }
      //firebase clear
      db.ref(path).set({[key]: ""});
    }

  }
});



