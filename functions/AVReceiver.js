const request = require("request");
const {parseString: parseXmlString} = require("xml2js");
const qs = require("querystring");
const {RateLimiter} = require("limiter");

const STATUS_URL = "/goform/formMainZone_MainZoneXml.xml";
const POST_URL = "/index.put.asp";

const zones = {
  main: null,
  zone2: "ZONE2",
  zone3: "ZONE3",
};
const Sources = {
  GAME: "GAME",
  CBL_SAT: "SAT/CBL",
  CD: "CD",
  NETWORK: "NET",
  USB: "USB/IPOD",
  TUNER: "TUNER",
  DVD: "DVD",
  BLUERAY: "BD",
  HD_RADIO: "HDRADIO",
  AUX1: "AUX1",
  AUX2: "AUX2",
  MEDIA_PLAYER: "MPLAY",
  TV: "TV",
  PHONO: "PHONO",
  INTERNET_RADIO: "IRADIO",
  MXPORT: "M-XPORT",
  NETHOME: "NETHOME",
};

const SurroundModes = {
  MOVIE: "MOVIE",
  MUSIC: "MUSIC",
  GAME: "GAME",
  PURE_DIRECT: "PURE DIRECT",
  MULTI_CH_STEREO: "MULTI CH STEREO",
  DIRECT: "DIRECT",
  STEREO: "STEREO",
  STANDARD: "STANDARD",
  SIMULATION: "SIMULATION",
  AUTO: "AUTO",
  LEFT: "LEFT",
};

class AVReceiver {
  constructor(ipAddress, zone) {
    this.ipAddress = ipAddress;
    this.limiter = new RateLimiter(1, 250);
    if (zone) {
      this.zone = zone;
    }
  }

  getState() {
    const convertStatusToModel = function(status) {
      const getValue = function(name) {
        let value = status.item[name][0].value;
        if (typeof value === "object" && Array.isArray(value)) {
          if (value.length === 1) {
            value = value[0];
          }
        }
        if (typeof value === "string") {
          value = value.toUpperCase().trim();
        }

        if (value === "ON") {
          value = true;
        } else if (value === "OFF") {
          value = false;
        } else if (value === "STANDBY") {
          value = false;
        }

        return value;
      };

      return {
        power: getValue("Power"),
        input: getValue("InputFuncSelect"),
        volumeLevel: getValue("MasterVolume"),
        mute: getValue("Mute"),
        surroundMode: getValue("selectSurround"),
      };
    };
    return new Promise((resolve, reject) => {
      const zone = this.zone ? `?&ZoneName=${this.zone}` : "";
      request({
        url: `http://${this.ipAddress}${STATUS_URL}${zone}`,
      }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
          parseXmlString(body, (er, result) => {
            const model = convertStatusToModel(result);
            resolve(model);
          });
        } else {
          reject(err);
        }
      });
    });
  }

  sendCommand(cmd) {
    return new Promise((resolve, reject) => {
      const command = {cmd0: cmd};
      if (this.zone) {
        command.ZoneName = this.zone;
      }
      const body = qs.stringify(command);
      const url = `http://${this.ipAddress}/MainZone${POST_URL}`;

      try {
        request({
          url,
          method: "POST",
          headers: {
            "Content-type": "text/html",
          },
          body: body,
        }, (err, response) => {
          if (!err && response.statusCode === 200) {
            resolve();
          } else {
            reject(err);
          }
        });
      } catch (e) {
        console.log("e", e);
      }
    });
  }

  getStateFor(name) {
    return new Promise((function(resolve, reject) {
      this.getState().then(function(state) {
        resolve(state[name]);
      }, function(err) {
        reject(err);
      });
    }).bind(this));
  }

  setPowerState(state) {
    return new Promise((resolve, reject) => {
      this.sendCommand("PutZone_OnOff/" + (state ? "ON" : "OFF"))
          .then(function() {
            // Power state takes a long time so we wait a bit
            // setTimeout(resolve, 1000);
            resolve();
          }, reject);
    });
  }

  setMuteState(muted) {
    return this.sendCommand("PutVolumeMute/" + (muted ? "on" : "off"));
  }

  getMuteState() {
    return this.getStateFor("mute");
  }

  volumeDown() {
    return this.sendCommand("PutMasterVolumeBtn/<");
  }

  volumeUp() {
    return this.sendCommand("PutMasterVolumeBtn/>");
  }

  setVolumeLevel(level) {
    return this.sendCommand("PutMasterVolumeSet/" + level);
  }

  getVolumeLevel() {
    return this.getStateFor("volumeLevel");
  }

  setInputSource(source) {
    return this.sendCommand("PutZone_InputFunction/" + source);
  }

  getInputSource() {
    return this.getStateFor("input");
  }

  setSurroundMode(surroundMode) {
    return this.sendCommand("PutSurroundMode/" + surroundMode);
  }

  getSurroundMode() {
    return this.getStateFor("surroundMode");
  }

  getPowerState() {
    return this.getStateFor("power");
  }

  _request(options, callback) {
    this.limiter.removeTokens(1, function() {
      request(options, callback);
    });
  }
}

module.exports = {
  AVReceiver,
  SOURCES: Sources,
  SURROUND_MODES: SurroundModes,
  ZONES: zones,
};
