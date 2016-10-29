// var play = require('play');
var player = require('play-sound')(opts = {})

// play with a callback
var names = ['ta','aa','ru','uu','un']

var maxIndex = names.length


function playSound(i){
	if(i > names.length)
		return

	player.play('./noises/' + names[i] + '.wav', function(){
		playSound(i+1)
		// console.log("all done")
	});
}

playSound(0)
