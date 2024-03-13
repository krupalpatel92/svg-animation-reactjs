import *  as random from './util/random';

export default () => {
    const allAudioFiles = (ctx => {
        let keys = ctx.keys();
        let values = keys.map(ctx);
        return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
    })(require.context('./assets/audio', true, /.*/));

    var mp3Array = Object.values(allAudioFiles);
    return random.pick(mp3Array);
}