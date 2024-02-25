// this project uses code samples from https://developer.mozilla.org/

let btnStart = document.getElementById("btn-start");
let btnStop = document.getElementById("btn-stop");
let sliderFreq = document.getElementById("slider-freq");
let infoFreq = document.getElementById("info-freq");

let oscillator;
let audioCtx;
let idInterval;


// przycisk uruchamiający oscylator i animację
btnStart.onclick = function(){ 

    // create web audio api context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create Oscillator node
    oscillator = audioCtx.createOscillator();

    //oscillator.type = "sine";
	oscillator.type = getOscType();
    oscillator.frequency.setValueAtTime(getOscFreq(), audioCtx.currentTime); // value in hertz


    // create analyser
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    const analyser = audioCtx.createAnalyser();

    // Fast Fourier Transform frequency domain
    analyser.fftSize = 2048;
    //analyser.fftSize = 1024;
    // how many data points we will be collecting - half of fftSize
    const bufferLength = analyser.frequencyBinCount;
    // array to collect samples
    const dataArray = new Uint8Array(bufferLength);

    // get samples from analyser to array
    analyser.getByteTimeDomainData(dataArray);

    oscillator.connect(analyser);
    analyser.connect(audioCtx.destination);

    // canvas
    let canvas = document.getElementById("myCanvas");
    let canvasCtx = canvas.getContext("2d");
    
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    // rysuje klatkę animacji
    function draw() {
		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        //const drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = "rgb(200 200 200)";
        //canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);  
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = "rgb(0 0 0)";
        
        canvasCtx.beginPath();  
        
        const sliceWidth = (WIDTH / bufferLength);
        let x = 0;
        
        // flaga początku rysowania funkcji w każdej klatce animacji
        // (w celu synchronizowania klatek - zeby rysunek funkcji nie biegał)
        let stratDrawFlag = false; 

		// wyrysowuje cały bufor
        for (let i = 0; i < bufferLength; i++) {
			
		    //if(oscillator.type == "triangle")
				//console.log(dataArray[i]);
			
			// szukamy synchronizacji - zaczynamy rysować
			if(oscillator.type == "sine"){
				// szukamy pierwszego przejścia funkcji przez zero (y==0)
				if (dataArray[i] == 0 && !stratDrawFlag){
					stratDrawFlag = true;
				}
			}else if(oscillator.type == "triangle"){
				// szukamy y max (max funkcji)
				if (dataArray[i] < dataArray[i+1] && dataArray[i+1] > dataArray[i+2] && !stratDrawFlag){
					stratDrawFlag = true;
				}
			}
			else if(oscillator.type == "square"){
				// szukamy y min
				if (dataArray[i] < 10 && !stratDrawFlag){
					//yMin = dataArray[i];
					//console.log("min:" + yMin);
					stratDrawFlag = true;
				}
				/*	
				if (dataArray[i] == dataArray[i+1] && dataArray[i+1] == dataArray[i+2] && !stratDrawFlag){
					//yMin = dataArray[i];
					//console.log("min:" + yMin);
					stratDrawFlag = true;
				}
				*/
			}else if(oscillator.type == "sawtooth"){
				// szukamy y max
				if (dataArray[i] < dataArray[i+1] && dataArray[i+1] > dataArray[i+2] && !stratDrawFlag){
					//yMin = dataArray[i];
					//console.log("min:" + yMin);
					stratDrawFlag = true;
				}
			}
			
            // w każdej klatce animacji wykres zaczyna się rysować 
            // gdy falaga stratDrawFlag zostanie ustawiona
            if(stratDrawFlag){
                if (x < WIDTH){
                    const v = dataArray[i] / 128.0;
                    const y = v * (HEIGHT / 2);  
                
                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    } 
                        x += sliceWidth;
                    }
            }
        }
        //canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();    
    }

    //draw();
    idInterval = window.setInterval(draw,1000);
    oscillator.start();
    // oscylator generuje dźwiek przez 2s
    //oscillator.stop(audioCtx.currentTime + 2);

    // zabezpieczenie przed powtórnym nacisnięciem przycisku
    btnStart.disabled = true;
}

// przycisk zatrzymujacy oscylator oraz animację
btnStop.onclick = function(){
    oscillator.stop();
	clearInterval(idInterval);
    btnStart.disabled = false;
}


// wartośc defaultowa slidera
infoFreq.innerHTML = sliderFreq.value;

// zmiana częstotliwości
sliderFreq.oninput = function() {
  infoFreq.innerHTML = this.value;
  oscillator.frequency.setValueAtTime(this.value, audioCtx.currentTime);
} 

// zmiana typu oscylatora
function chnageOscType(oscType) {
  oscillator.type = oscType.value;
  //alert(oscType.value);
}
 
// ustawiamy typ oscylatora w zależności od ustawień radio buttonów
function getOscType(){
	let oscTypeRadio = document.getElementsByName("radio-type");
	let oscType = "sine";
	for(let i=0; i < oscTypeRadio.length; i++){
		if (oscTypeRadio[i].checked == true){
			oscType = oscTypeRadio[i].value;
		}
	}
	return oscType;
}

// ustawiamy częstotliwość osylatora w zależności od ustawienia suwaka
function getOscFreq(){
	return sliderFreq.value;
}