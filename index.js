

const audioCtx = new AudioContext();
console.log(audioCtx.state)
const button = document.getElementById('start-button');
let buffers = []
let sources = []
let panNodes = []



const reverbNode = audioCtx.createConvolver();
const response = await fetch("impulse_rev.wav");
const arraybuffer = await response.arrayBuffer();
reverbNode.buffer = await audioCtx.decodeAudioData(arraybuffer);
reverbNode.connect(audioCtx.destination);

const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
compressor.knee.setValueAtTime(40, audioCtx.currentTime);
compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
compressor.attack.setValueAtTime(0, audioCtx.currentTime);
compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

// NB: connecting the compressor to both reverb and destination is a hacky way to make a dry/wet 50% mix....
compressor.connect(reverbNode);
compressor.connect(audioCtx.destination);




button.addEventListener('click', () => {
  // check if context is in suspended state (autoplay policy)
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  console.log(audioCtx.state)
  
  loadTracks(12)
  .then((sources) => playAll(sources))
  .then(() => pauseSeq(sources))

//   someProcedure(10)
//   .then(console.log)
//   .catch(console.error)



  




  

}, false);



function pauseSeq(buffers) {
    
    for (let b in buffers)
    {   
        let time = audioCtx.currentTime
        

        let bb = buffers[b]
        for (let i = 1; i < 12; i++) {
            let rand = getRandomInt(1, 12)
            let div = getRandomInt(1, 4)
            let rhythm = rand / div
            rhythm = rhythm
            time = time + rhythm
            bufferSpeed(bb, 0, time)
            let speed = getRandomInt(1, 11) * .1
            rhythm = rhythm + (rand/2)
            time = time + rhythm
            panNodes[b].pan.setValueAtTime(getRandomFloat(-1, 1), time)
            bufferSpeed(bb, speed, time)
        }


    }

}

function bufferSpeed(buffer, value, rhythm){
    let pB = buffer.playbackRate
    pB.setValueAtTime(value, rhythm)
    console.log(buffer, rhythm)
}

function pauser(track){
        let time = audioCtx.currentTime
        track.playbackRate.setValueAtTime(0, time + 3)
        track.playbackRate.setValueAtTime(1, time + 5)
    }


function playAll(tracks){
    console.log("in plauy all")
    console.log("tracks", tracks)
    for (let item in tracks)
    {   
        console.log(tracks[item])
        tracks[item].start() 
    }

}

async function loadTracks(n){
    for (let i = 0; i < n; i++)
    {   
        console.log(i)
        const track = await loadTrack()
        .then((sample) => loadBuffer(sample))
        .then(() => console.log("buffers: ", buffers, "sources", sources))
        .catch((error) => console.error(error))
        // console.log("track", track);

    }
    console.log('tracks processed');
    return sources
}  



async function loadTrack(){

let choice = getRandomInt(1, 34)
// let song = "/folksongs/audio" + choice + ".mp3"
let song_gh = "https://github.com/sebastianadams-music/folksongmashup/blob/main/folksongs/audio" + choice + ".mp3?raw=true"
const sample = setupSample(song_gh)
return sample 
}

async function loadBuffer(sample) {
    buffers.push(sample)
    const source = audioCtx.createBufferSource();
    sources.push(source)
    source.buffer = sample
    let panNode = audioCtx.createStereoPanner();
    source.connect(panNode);
    panNodes.push(panNode)
    panNode.connect(compressor);
    console.log("done_loadbuffer")
    return sources

}



async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }
  
  async function setupSample(file) {
    const filePath = file;
    const sample = await getFile(audioCtx, filePath);
    return sample;
  }
  
/**
 * Get a random integer between `min` and `max`.
 * 
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random integer
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }