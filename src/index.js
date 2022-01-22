const {AVReceiver, SOURCES, SURROUND_MODES, ZONES} = require("./AVReceiver");
const {url} = require('../receiver-url.json')

const updateReceiverValues = {
    vinyl: { source: SOURCES.DVD, sound: SURROUND_MODES.PURE_DIRECT },
    cast:{ source: SOURCES.MEDIA_PLAYER, sound: SURROUND_MODES.STEREO }
};

async function main() {
    const receiver = new AVReceiver(url, ZONES.Main);
    const result = await updateReceiver(receiver, updateReceiverValues.vinyl);
    console.log(result);
}

export async function updateReceiver(receiver, updateValues) {
    await receiver.setPowerState(true);

    await receiver.setInputSource(updateValues.source);
    await receiver.setSurroundMode(updateValues.sound);
    // await receiver.setVolumeLevel(-30)

    const sourceUpdateResult = await receiver.getInputSource();
    const surroundUpdateResult = await receiver.getSurroundMode();

    return `Source set to ${sourceUpdateResult}, sound set to ${surroundUpdateResult}`;
}

main();
