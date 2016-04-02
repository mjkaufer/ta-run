var keys = [].slice.call(document.getElementsByClassName('note')).map(function(e){
	return e.id
});

var timeoutList = []
var activeLength = 100
var shiftDown = false
var baseNote = 69//midi a4


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

function getHalfStep(key){
	var keyIndex = keys.indexOf(key)
	return keyIndex == -1 ? null : keyIndex
}

function keyCodeToCharacter(keyCode){//219
	return String.fromCharCode(keyCode).toLowerCase()
}

document.onkeydown = function(e){
	
	var key = keyCodeToCharacter(e.which)
	

	playNoise(getHalfStep(key))

}

function getFileName(i){
	return 'noises/test_' + i + '.wav'
}

function playNoise(halfStep){
	if(halfStep === null)//will need to fix later to allow negative half steps, but it'll work for now
		return

	if(shiftDown)
		halfStep -= 12

	toggleActive(keys[(halfStep >=0 && halfStep <= 12) ? halfStep : (halfStep + 144) % 12])

	lowLag.play(getFileName(halfStep))
	//...
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
	for(var i = 0; i <= 12; i++){
		lowLag.load(getFileName(i));
		i != 0 && lowLag.load(getFileName(-i))
	}	
}

lowLag.init()
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