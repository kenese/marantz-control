// let AVReceiver = require('marantz-avr');

const {AVReceiver, SOURCES, SURROUND_MODES, ZONES} = require("./AVReceiver");
const {url} = require('./receiver-url.json')

async function main() {

    const receiver = new AVReceiver(url, ZONES.Main);

    // const result = await setInputToVinyl(receiver);
    const result = await setInputToCast(receiver);
    console.log(result);
}

async function updateReceiver(receiver, source, sound) {
    await receiver.setPowerState(true);
    await receiver.setInputSource(source);
    await receiver.setSurroundMode(sound);
    // await receiver.setVolumeLevel(-30)

    const sourceUpdateResult = await receiver.getInputSource();
    const surroundUpdateResult = await receiver.getSurroundMode();

    return `Source set to ${sourceUpdateResult}, sound set to ${surroundUpdateResult}`;
}

const setInputToVinyl = async (receiver) => {
    return await updateReceiver(receiver, SOURCES.DVD, SURROUND_MODES.PURE_DIRECT);
}

const setInputToCast = async (receiver) => {
    return await updateReceiver(receiver, SOURCES.MEDIA_PLAYER, SURROUND_MODES.STEREO);
}

main();

