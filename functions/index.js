/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const {AVReceiver, ZONES, SOURCES, SURROUND_MODES} = require("./AVReceiver");
const {url} = require("./receiver-url.json");

const UPDATE_RECEIVER_VALUES = {
  vinyl: {source: SOURCES.DVD, sound: SURROUND_MODES.PURE_DIRECT},
  cast: {source: SOURCES.MEDIA_PLAYER, sound: SURROUND_MODES.STEREO},
  off: {power: "off"},
};

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// "Set marantz to cast"
// "Set kitchen to cast"
// "Set marantz and kitchen to cast"

exports.marantzUpdate = functions.https.onRequest(
    async (request, response) => {
      const {value, receiverName} = request.query;

      const receiverValueToUpdate = UPDATE_RECEIVER_VALUES[value] ?
          UPDATE_RECEIVER_VALUES[value] :
          UPDATE_RECEIVER_VALUES.cast;

      const zone = ZONES[receiverName] ?
          ZONES[receiverName] :
          ZONES.Main;

      const receiver = new AVReceiver(url, zone);
      let result = await updateReceiver(receiver, receiverValueToUpdate);

      if (receiverName === "both") {
        receiver.zone = ZONES.Zone2;
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
  // await receiver.setVolumeLevel(-30)

  const sourceUpdateResult = await receiver.getInputSource();
  const surroundUpdateResult = await receiver.getSurroundMode();


  return receiverName +
      `source set to ${sourceUpdateResult}, ` +
      `sound set to ${surroundUpdateResult}`;
}
