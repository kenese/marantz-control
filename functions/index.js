/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const {AVReceiver, ZONES, SOURCES, SURROUND_MODES} = require("./AVReceiver");
const {url} = require("./receiver-url.json");

const UPDATE_RECEIVER = {
  vinyl: {source: SOURCES.DVD, sound: SURROUND_MODES.PURE_DIRECT},
  cast: {source: SOURCES.MEDIA_PLAYER, sound: SURROUND_MODES.STEREO},
};

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// "Set marantz to cast"
// "Set kitchen to cast"
// "Set marantz and kitchen to cast"

exports.marantzUpdate = functions.https.onRequest(
    async (request, response) => {
      const {value, receiverName} = request.query;

      const receiverValue = UPDATE_RECEIVER[value] ?
          UPDATE_RECEIVER[value] :
          UPDATE_RECEIVER.cast;

      const zone = ZONES[receiverName] ?
          ZONES[receiverName] :
          ZONES.Main;

      const receiver = new AVReceiver(url, zone);
      let result = await updateReceiver(receiver, receiverValue);

      if (receiverName === "both") {
        receiver.zone = ZONES.Zone2;
        result = `\n${await updateReceiver(receiver, receiverValue)}`;
      }

      functions.logger.info(result, {structuredData: true});
      response.send(result);
    });

async function updateReceiver(receiver, updateValues) {
  await receiver.setPowerState(true);

  await receiver.setInputSource(updateValues.source);
  await receiver.setSurroundMode(updateValues.sound);
  // await receiver.setVolumeLevel(-30)

  const sourceUpdateResult = await receiver.getInputSource();
  const surroundUpdateResult = await receiver.getSurroundMode();

  return `${receiver.zone ? receiver.zone : "Main"} ` +
      `source set to ${sourceUpdateResult}, ` +
      `sound set to ${surroundUpdateResult}`;
}
