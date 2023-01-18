/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const {AVReceiver, ZONES, SOURCES, SURROUND_MODES} = require("./AVReceiver");
const {url} = require("./receiver-url.json");

const UPDATE_RECEIVER_VALUES = {
  vinyl: {source: SOURCES.DVD, sound: SURROUND_MODES.PURE_DIRECT},
  cast: {source: SOURCES.MEDIA_PLAYER, sound: SURROUND_MODES.STEREO},
  cd: {source: SOURCES.CD, sound: SURROUND_MODES.STEREO},
  tv: {source: SOURCES.TV, sound: SURROUND_MODES.MOVIE},
  off: {power: "off"},
};

exports.marantzState = functions.https.onRequest(
    async (request, response) => {
      const receiver = new AVReceiver(url);

      const main = await receiver.getState();
      main.name = "main";
      receiver.zone = ZONES.zone2;
      const zone2 = await receiver.getState();
      zone2.name = "zone2";

      response.send([main, zone2]);
    });

exports.marantzUpdate = functions.https.onRequest(
    async (request, response) => {
      const source = request.query.source.toLowerCase();
      const zone = request.query.zone.toLowerCase();

      const receiverValueToUpdate = UPDATE_RECEIVER_VALUES[source] ?
          UPDATE_RECEIVER_VALUES[source] :
          UPDATE_RECEIVER_VALUES.cast;

      const zoneToUpdate = ZONES[zone] ?
          ZONES[zone] :
          ZONES.main;

      const receiver = new AVReceiver(url, zoneToUpdate);
      let result = await updateReceiver(receiver, receiverValueToUpdate);

      if (zone === "both" || zone === "all") {
        receiver.zone = ZONES.zone2;
        result = `\n${await updateReceiver(receiver, receiverValueToUpdate)}`;
      }

      if (zone === "all") {
        receiver.zone = ZONES.zone3;
        result = `\n${await updateReceiver(receiver, receiverValueToUpdate)}`;
      }

      functions.logger.info(result, {structuredData: true});
      response.send(result);
    });

async function updateReceiver(receiver, updateValues) {
  const receiverName = `${receiver.zone ? receiver.zone : "Main"} `;
  if (updateValues.power) {
    await receiver.setPowerState(false);
    return receiverName + "turned off";
  }
  await receiver.setPowerState(true);

  await receiver.setInputSource(updateValues.source);
  await receiver.setSurroundMode(updateValues.sound);

  const sourceUpdateResult = await receiver.getInputSource();
  const surroundUpdateResult = await receiver.getSurroundMode();

  return receiverName +
      `source set to ${sourceUpdateResult}, ` +
      `sound set to ${surroundUpdateResult}`;
}
