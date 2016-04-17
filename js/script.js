var keys = [].slice.call(document.getElementsByClassName('note')).map(function(e){
	return e.id
});

var timeoutList = []
var activeLength = 100
var shiftDown = false
var baseNote = 69//midi a4
var ta = true
var fixed = false
var locked = false


window.onkeydown = window.onkeyup = function(e){
	shiftDown = e.shiftKey
}

function clearTimeoutList(){
	timeoutList.forEach(function(e){
		clearTimeout(e)
	})

	timeoutList = []
}

[].slice.call(document.getElementsByClassName('note')).forEach(function(e){
	e.onclick = function(ev){
		playNoise(getHalfStep(ev.target.id))
		
	}
})

// var bpm = 120
var bpm = 120

function quarterNotesToMs(quarterNotes, bpm){
	return quarterNotes / bpm * 60 * 1000
}

var noteIndex = 0

var misirlouIntro = [
	[0,1.5],
	[1,.5],
	[4,1],
	[5,1],
	[7,1.5],
	[8,0.5],
	[11,1],
	[8,1],
	[7,1.5],
	[7,1.5],
	[7,0.5],
	[7,0.5],
	[7,1.5],
	[7,1.5],
	[7,0.5],
	[7,0.5],
]

var misirlouBridge = [
	[8,0.5],
	[8,0.5],
	[7,0.5],
	[8,0.5],
	[7,1],
	[5,1],
	[7,0.5],
	[7,0.5],
	[5,0.5],
	[7,0.5],
	[5,1],
	[4,0.5],
	[0,0.5],
	[4,1],
	[4,0.5],
	[4,1],
	[4,0.5],
	[4,0.5],
	[4,0.5],
	[4,1],
	[4,0.5],
	[4,1],
	[4,0.5],
	[4,0.5],
	[0,1],

	[7,0.5],
	[5,0.5],
	[7,0.5],
	[5,1],
	[4,1],
	[5,0.5],
	[5,0.5],
	[4,0.5],
	[5,0.5],
	[4,1],
	[1,0.5],
	[4,0.5],
	[0,1],
	[0,0.5],
	[0,1],
	[0,0.5],
	[0,0.5],
	[0,0.5],
	[0,2],
]

var misirlouFill = [
	[12,0.25],
	[11,0.25],
	[8,0.25],
	[7,0.25],
	[5,0.25],
	[4,0.25],
	[1,0.5],
]

var misirlou = []
var repeat = true;

var misirlouBody = []
misirlouBody = misirlouBody.concat(misirlouIntro)
misirlouBody = misirlouBody.concat(misirlouIntro)
misirlouBody = misirlouBody.concat(misirlouBridge)

misirlouBodyLower = misirlouBody.map(function(e){
	var eClone = e.slice(0)
	eClone[0] -= 12;
	return eClone
})


misirlou = misirlou.concat(misirlouBodyLower).concat(misirlouFill).concat(misirlouBody).concat(misirlouFill)


var songChoice = misirlou

var songIsPlaying = true

function playSong(){
	noteIndex = 0;
	playNextNote()
}

function playNextNote(){

	var data = songChoice[noteIndex]
	playNoise(data[0], true)

	noteIndex++;
	if(repeat)
		noteIndex %= songChoice.length
	setTimeout(function(){
		if(songIsPlaying)
			playNextNote()
	}, quarterNotesToMs(data[1], bpm))
}

setTimeout(function(){
	playSong()
}, 500)


function getHalfStep(key){
	var keyIndex = keys.indexOf(key)
	return keyIndex == -1 ? null : keyIndex
}

function keyCodeToCharacter(keyCode){//219
	return String.fromCharCode(keyCode).toLowerCase()
}

document.onkeydown = function(e){

	
	if(e.which == 32)
		return e.preventDefault() || toggleTa()

	if(e.which == 90)
		return (locked = !locked) || (locked || toggleTa())

	var key = keyCodeToCharacter(e.which)

	playNoise(getHalfStep(key))

}

function getFileName(i, isTa){
	var prefix = "run"
	if(isTa)
		prefix = "ta"
	return prefix + '_' + i + '.wav'
}

function playNoise(halfStep, ignoreShift){
	if(halfStep === null)//will need to fix later to allow negative half steps, but it'll work for now
		return

	if(!ignoreShift)
		songIsPlaying = false

	if(shiftDown && !ignoreShift)
		halfStep -= 12

	toggleActive(keys[(halfStep >=0 && halfStep <= 12) ? halfStep : (halfStep + 144) % 12])

	lowLag.play(getFileName(halfStep, ta))

	if(!locked)
		toggleTa()
	//...
}

function removeUnderline(id){
	document.getElementById(id).classList.remove('underline')
}

function addUnderline(id){
	document.getElementById(id).classList.add('underline')
}

function toggleTa(){
	ta = !ta
	if(ta){
		addUnderline('ta')
		removeUnderline('run')	
		document.title = "run"
	} else {
		addUnderline('run')
		removeUnderline('ta')
		document.title = "ta"
	}
	

}

function toggleActive(id){

	if(!document.getElementById(id))
		return
	document.getElementById(id).classList.add('active-key')

	setTimeout(function(){

		document.getElementById(id).classList.remove('active-key')

	}, activeLength)
}


function loadNoises(){
	for(var i = -12; i <= 12; i++){
		lowLag.load(getFileName(i, true));
		lowLag.load(getFileName(i, false));
		
	}	
}

lowLag.init({'urlPrefix':'noises/'})
loadNoises()

WebMidi.enable(

	// Success handler
	function() {

		// Viewing available inputs and outputs
		console.log(WebMidi.inputs);
		console.log(WebMidi.outputs);

		// Getting the current time
		console.log(WebMidi.time);

		// Listening for a 'note on' message (on all devices and channels)
		WebMidi.addListener(
			'noteon',
			function(e){
				var midiKey = e.data[1];
				console.log(midiKey)
				var halfSteps = (midiKey - baseNote)
				halfSteps = (halfSteps < -12 || halfSteps > 12) ? halfSteps % 12 : halfSteps
				console.log(halfSteps)

				playNoise(halfSteps)
			}
		);

	},

	// Failure handler
	function(m) {
		console.log("Could not enable MIDI interface: " + m);
	}

);