
import * as dat from 'dat.gui';
import p5 from "p5"
import * as Tone from 'tone'

import { easeOutCubic } from './util/ease';
import {getBounds, getNormals} from './util/geometry';
import { clamp, map } from './util/math';
import * as random from './util/random';
import {normalize} from './util/vec';

import selectAudio from './selectAudio';
import {AudioEnergy} from './AudioEnergy';
import {AudioLoader} from './AudioLoader';

import { flattenSVG } from 'flatten-svg';
import svg from './assets/svg/West_Channel_Logo_Static_Subdivide.svg';

const CONTAINER = 'logo-container';

// Debug
// const gui = new dat.GUI({useLocalStorage:false});
// const globalFolder = gui.addFolder('Settings');
let settings = {
    background:"#F09C21",
    drawNormals: false,
    audio: {
        fadeIn: 0.0,
        fadeOut: 0.0,
        scale: 100,
        decreaseSpeed: 0.1,
    },
    increase:0.69,
    decrease:0.68,
    count: 0,
    noises:{},

    addNoise : function() {
        this._addNoise({});
    },
    
    _addNoise: function(opts) {
        let label = `noise${this.count}`;
        this.noises[label] = {
            enabled: opts.enabled || true,
            debugView: false,
            //mouse:opts.mouse || false,
            amp: opts.amp || 5,
            freq: opts.freq || 18,
            speed: opts.speed || -10,
            start: opts.start || 0,
            length: opts.length || 47,
            minValue: opts.minValue || -1,
            maxValue: opts.maxValue || 0,
            audioFreq: opts.audioFreq || 'bass',
            audioScale: opts.audioScale || 100,
            time : random.value() * 1000,
            animateIdle: opts.animateIdle || false,
            scale : 0.0
        }
        //addNoiseGUI(globalFolder, label, this.noises[label]);
        this.count++;
    }
};


var parser = new DOMParser();
var svgElement = parser.parseFromString(svg, "image/svg+xml").documentElement;

// globalFolder.addColor(settings, 'background');
// globalFolder.add(settings, 'drawNormals');
// globalFolder.add(settings, 'increase', 0.0, 1.0);
// globalFolder.add(settings, 'decrease', 0.0, 1.0);
// const audioFolder = globalFolder.addFolder('Audio');
// audioFolder.add(settings.audio, 'fadeIn', 0, 10);
// audioFolder.add(settings.audio, 'fadeOut', 0, 10);
// globalFolder.add(settings, 'addNoise');

// function addNoiseGUI(root, label, noise) {
//     const folder = root.addFolder(label);
//     folder.add(noise, 'enabled');
//     folder.add(noise, 'debugView');
//     //folder.add(noise, 'mouse');
//     folder.add(noise,'audioFreq', ['bass', 'lowMid', 'mid', 'highMid', 'treble'], 'bass');
//     folder.add(noise,'audioScale');
//     folder.add(noise, 'speed');
//     folder.add(noise, 'amp');
//     folder.add(noise, 'freq', 1, 100);
//     folder.add(noise, 'start', 0, 839); // hardcode this for now, fetch it from svg later.
//     folder.add(noise, 'length', 0, 839);
//     folder.add(noise, 'minValue');
//     folder.add(noise, 'maxValue');
//     folder.add(noise, 'animateIdle');
// }

//Noise 0
settings._addNoise({start:157, length:126, speed:-1, amp:12, freq:3, audioFreq:'lowMid', audioScale: 300, minValue:-1, maxValue:0.3, animateIdle:true });
//Noise 1
settings._addNoise({start: 0, length:146, speed:1, amp:6, freq:8.8, audioFreq:'bass', audioScale: 200, minValue:-0.5, maxValue:0.5, animateIdle:false});
//Noise 2
settings._addNoise({start: 423, length:64, speed:-1, amp:12, freq:22, audioFreq:'treble', audioScale: 300, minValue:-1, maxValue:0, animateIdle:true });
//Noise 3
settings._addNoise({start: 283, length:64, speed:1, amp:15, freq:15, audioFreq:'mid', audioScale: 400, minValue:-1, maxValue:0, animateIdle:false });
//Noise 4
settings._addNoise({start: 747, length:86, speed:-1, amp:10, freq:3, audioFreq:'lowMid', audioScale: 300, minValue:-1, maxValue:0.3, animateIdle:true });

const sketch = (p) => {

    let svgOriginalPoints = [];
    let svgPath = [];
    let svgWidth,svgHeight;

    let time = 0;
    let originalSize = 600;
    let scaleFactor = Math.min(p.windowWidth, p.windowHeight) / originalSize;
    let verticesCount = 0;
    let controlButton = null;

    let analyser = null;
    let player = null;
    let loading = null;
    let audioLoader = null;

    p.preload = async () => {

        let flattenPaths = flattenSVG(svgElement, {maxError:1.0});
        flattenPaths.forEach((p, idx)=>{
            if(idx > 0) p.points.shift();
            svgOriginalPoints = svgOriginalPoints.concat(p.points);
        })

        transform();
        verticesCount = svgPath.length;

        analyser = new AudioEnergy();
        loading = document.getElementById('loading-feedback');
    }

    p.setup = () => {
        p.frameRate(30);
        p.createCanvas(p.windowWidth, p.windowHeight * 0.7);
        p.smooth();

        controlButton = document.getElementById('play-pause');
        controlButton.addEventListener("click", togglePlayPause);
        document.getElementById(CONTAINER).onclick = togglePlayPause;
        loadAudioFile();
    }

    const loadAudioFile = async () => {
        audioLoader = new AudioLoader();
        await audioLoader.load(selectAudio());
        while (!audioLoader.loaded()) { 
            await audioLoader.fetch();
            let percent = audioLoader.getPercentage();
            if(!isNaN(percent)) {
                const loadedPercent = percent;
                loading.innerText = `${loadedPercent}`;
            }
        }

        if(player == null) {
            loading.style = 'display: none';
            controlButton.className = "play";
            var ctx = Tone.getContext();
            var buffer = await ctx.decodeAudioData(audioLoader.getBuffer())
            player = new Tone.Player({
                url: buffer, 
                autostart: false,
                loop: true, 
                fadeIn:settings.audio.fadeIn, 
                fadeOut:settings.audio.fadeOut
            }).toDestination();

            player.connect(analyser);
        }
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight * 0.7);
        transform();
    }

    // use adjacent vertices to smooth the normal
    const smooth = function(idx, normals) {
        let count = 3;
        let nx = 0;
        let ny = 0;
        for(let i = idx-count; i < idx+count; ++i) {
            nx += normals[i][0];
            ny += normals[i][1];
        }
        let normal = [];
        normalize(normal, [nx, ny]);
        return normal;
    }
    
    p.draw = () => {
    
        //stats.begin();
        let dt = p.deltaTime / 1000.0;
        time += dt;

        analyser?.update();
        
        p.background(settings.background);
        
        p.push();
        p.translate((p.width/2) - svgWidth*0.5, (p.height/2) - svgHeight*0.5);

        p.push();
        p.noFill();
        p.stroke(0);
        
        let normals = getNormals(svgPath);
        let noises = [];
        for (const n in settings.noises) {
            noises.push(settings.noises[n]);
        }

        p.fill(0);
        p.noStroke(0);
        p.beginShape();

        svgPath.forEach((pt, idx)=> {
            let [x,y] = pt;
            let [nx,ny] = idx > 2 && idx < verticesCount-3 ?  smooth(idx, normals) : normals[idx];
            
            let n = [0,0];
        
            noises.forEach(noise => {
                if(!noise.enabled || (Tone.Transport.state != 'started' && !noise.animateIdle)) return;
                let noiseFactor = 0;
                let noiseLength = noise.length;
                if(idx > noise.start && idx < noise.start + noiseLength) { 
                    let noiseIdx = Math.floor(idx - noise.start);
                    let noiseStart = mirrorInteger(noiseIdx, noiseLength/2);
                    noiseFactor = easeOutCubic(noiseStart / (noiseLength));
                }

                if(Tone.Transport.state == 'started'){
                    const energy = analyser?.getEnergy(noise.audioFreq);
                    noise.scale = map(energy, -100, -30, 0, 1.0);
                    noise.scale = clamp(noise.scale, 0, 1);
                    if(noise.scale === -Infinity || noise.scale === Infinity)
                        noise.scale = 0;
                    
                    if(noise.audioFreq != 'treble')
                        noise.scale = Math.pow(noise.scale, 4);
                } else {
                    noise.scale -= 0.25 * dt;    
                }
            
                noise.scale = clamp(noise.scale, 0, 1);

                let spd = noise.speed / 1000.0;
                let frq = (1.0 / scaleFactor) * noise.freq*0.01;
                let amp = scaleFactor * (noise.amp + noise.audioScale * noise.scale);

                noise.time += dt * spd + (spd * noise.scale * dt);
                
                let sx = Math.sin(noise.time + x * frq);
                let vx = amp * map(sx, -1, 1, noise.minValue, noise.maxValue);
                vx *= noiseFactor;
                n[0] += vx;

                let sy = Math.sin(noise.time + x * frq);
                let vy = amp * map(sy, -1, 1, noise.minValue, noise.maxValue);
                vy *= noiseFactor;
                n[1] += vy;
            })
            
            
            p.vertex(x + nx * n[0], y + ny * n[1]);

        })
        p.endShape(p.OPEN);
    
        // noises.forEach(n=>{
        //     if(n.debugView)
        //         drawNoise(svgPath, n);
        // })

        p.pop();
        //stats.end();
    }

    const transform = () => {
        scaleFactor = Math.min(p.windowWidth, p.windowHeight) / originalSize;
        
        svgPath = [...svgOriginalPoints];
        for(let i = 0; i < svgOriginalPoints.length; i++) {
            svgPath[i] = [...svgOriginalPoints[i]];
        }
        svgPath.map(x=> {
            x[0] *= scaleFactor;
            x[1] *= scaleFactor;
        });

        let  svgBounds = getBounds(svgPath);

        let [bx,by] = svgBounds[0];
        let [bw, bh] = svgBounds[1];
        svgWidth = (bw-bx);
        svgHeight = (bh-by);

        svgPath.map(x=> {
            x[0] -= bx;
            x[1] -= by;
        });
    }

    const mirrorInteger = (num, limit) => {
        return num > limit ? limit - (num % limit) : num;
    }

    let isToneStarted = false;
    const togglePlayPause = async function() {

        if(!player || !player.loaded) return;
        if(!isToneStarted) {
            await Tone.start();
            player.sync().start(0);
            isToneStarted = true;
        }
        const state = Tone.Transport.state;
        if (state == 'stopped' || state == 'paused') {   
            Tone.Transport.start();
            controlButton.className = "pause";
        } else if(state == 'started') { 
            Tone.Transport.pause();
            controlButton.className = "play";
        }
    }
}

new p5(sketch, CONTAINER);
