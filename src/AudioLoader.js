
import { clamp } from './util/math';

export class AudioLoader {
    constructor() {
        this._reader = null;
        this._length = 0;
        this._loadedLength = 0;
        this._dataChunks = [];
        this._loaded = false;
    }

    async load(url) {
        let response = await fetch(url);

        this._reader = response.body.getReader();
        this._length = response.headers.get('Content-Length');
    }

    async fetch() {
        if(this._loaded || this._reader == null) return;
        const {done, value} = await this._reader.read();
        this._loaded = done;
        if(done) return;
        this._dataChunks.push(value);
        this._loadedLength += value.length;
    }

    getBuffer() {
        if(!this._loaded) return null;
        let chunksAll = new Uint8Array(this._loadedLength); 
        let position = 0;
        for(let chunk of this._dataChunks) {
            chunksAll.set(chunk, position); 
            position += chunk.length;
        }
        
        return chunksAll.buffer;
    }

    getPercentage() {
        return clamp(Math.floor((this._loadedLength / this._length) * 100), 0, 100);
    }

    loaded() {
        return this._loaded;
    }
}