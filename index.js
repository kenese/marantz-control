// let AVReceiver = require('marantz-avr');

const {AVReceiver, SOURCES, SURROUND_MODES, ZONES} = require("./AVReceiver");

async function main() {

    const receiver = new AVReceiver('101.100.138.116:8088', ZONES.Main);

    // Turns on/off stereo
    // console.log(await receiver.setPowerState(true));
    // await receiver.setVolumeLevel(-30)
    // console.log(await receiver.getSurroundMode());
    // console.log(await receiver.setInputSource(SOURCES.DVD));
    // console.log(await receiver.setSurroundMode(SURROUND_MODES.PURE_DIRECT));
    // console.log(await receiver.getSurroundMode());


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

    let surroundUpdateResult = await receiver.getSurroundMode();
    // console.log('surroundUpdateResult', surroundUpdateResult);
    // await receiver.setSurroundMode(sound);
    // surroundUpdateResult = await receiver.getSurroundMode();
    // console.log('surroundUpdateResult', surroundUpdateResult);

    return `Source set to ${sourceUpdateResult}, sound set to ${surroundUpdateResult}`;
}

const setInputToVinyl = async (receiver) => {
    return updateReceiver(receiver, SOURCES.DVD, SURROUND_MODES.PURE_DIRECT);
}

const setInputToCast = async (receiver) => {
    return updateReceiver(receiver, SOURCES.MEDIA_PLAYER, SURROUND_MODES.STEREO);
}

main();

