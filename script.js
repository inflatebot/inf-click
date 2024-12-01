const soundEffects = {
    pop: [new Audio('res/sfx/pop1.wav'), new Audio('res/sfx/pop2.wav')],
    pressure: [new Audio('res/sfx/pressure1.wav'), new Audio('res/sfx/pressure2.wav')],
    settle: [new Audio('res/sfx/settle1.mp3'), new Audio('res/sfx/settle2.mp3')],
    pump: [new Audio('res/sfx/pump1.wav'), new Audio('res/sfx/pump2.wav')]
};

function getSoundEffect(effectName) {
    return soundEffects[effectName];
}

function playRandomSoundEffect(effectArray) {
    if (effectArray && effectArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * effectArray.length);
        const soundEffect = effectArray[randomIndex];
        soundEffect.currentTime = 0; // Rewind the sound to the beginning
        soundEffect.play().catch(error => {
            console.error("Error playing sound:", error);
        });
    } else {
        console.error("Sound effect array is empty or not found.");
    }
}

const player = {
    bellySize: 100,
    pressure: 0,
    bellyMinSize: 100,
    bellyGrowth: 0,
    bellyRecordSize: 100,
    bellyRecordGrowth: 0,
    playerMoney: 0,
    maxPressure: 100
};

// Pump object -- this will be a prototype later
const pump = {
    pumpStaticPressure: 5,
    pumpPressureDecayRate: 1,
    pumpStrokeVolume: 5
}

const pressureMessages = {
    0:"\n",
    1:"You feel a bit full.",
    2:"You're feeling quite bloated.",
    3:"Your midsection is tense.",
    4:"Your skin is painfully taut...",
    5:"You feel like you're about to burst...!"
}

const sizeMessages = {
    0:"\n",
    1:"Your gut has a slight bulge to it.",
    2:"You're looking rather round.",
    3:"Your belly spills out the front of your shirt.",
    4:"Your belly could only be described as 'pregnant-looking.'",
    5:"Your whole middle is dominated with your massive balloon-belly."
}

const bellySizeDisplay = document.getElementById('bellySize');
const bellyGrowthDisplay = document.getElementById('bellyGrowth');
const recordSizeDisplay = document.getElementById('recordSize');
const recordGrowthDisplay = document.getElementById('recordGrowth');
const pressureFill = document.getElementById('pressureFill');
const messageDisplay = document.getElementById('message');
const pressureText = document.getElementById('pressureText');
const sizeText = document.getElementById('sizeText');

//Gameplay functions
function pumpAir() {
    player.pressure += pump.pumpStaticPressure;
    if(player.pressure >= player.maxPressure){
    	playRandomSoundEffect(getSoundEffect('pop'));
        popBelly();
        return;
    } else if(player.pressure >= player.maxPressure * 0.9){
    	playRandomSoundEffect(getSoundEffect('pressure'));
        messageDisplay.textContent = "Careful! Close to popping!" // TODO: integrate this w/the threshold system
    }
    inflateBelly();
    updatePressureBar();
    playRandomSoundEffect(getSoundEffect('pump'));
}

// some more game state stuff
let previousPressure = 0;
let previousBellySize = player.bellyMinSize;
let sizeRange = player.bellySize*2

// Pressure decay over time (using pump.pumpPressureDecayRate)
setInterval(() => {
    if (player.pressure > 0) {
        player.pressure -= pump.pumpPressureDecayRate / 20;
        updatePressureBar();

        //Threshold checks
        const pressureLevel = Math.floor(player.pressure / 20); //0-4
        const previousPressureLevel = Math.floor(previousPressure /20);
        if(pressureLevel != previousPressureLevel){
            pressureLevelChange(previousPressureLevel, pressureLevel);
        }
        previousPressure = player.pressure;

        const sizeLevel = Math.floor((player.bellySize - player.bellyMinSize) / (sizeRange/10) ); //0-9
        const previousSizeLevel = Math.floor((previousBellySize - player.bellyMinSize) / (sizeRange/10));
        if(sizeLevel != previousSizeLevel){
            sizeLevelChange(previousSizeLevel,sizeLevel);
        }
        previousBellySize = player.bellySize;
    }
}, 20);

function pressureLevelChange(oldLevel, newLevel){
    if (newLevel < 0){
        newLevel = 0 //just nipping this possibility in the bud 'cuz it displays -1 sometimes if you let it sit
    }
	if(newLevel > oldLevel){
    	messageDisplay.textContent = `Pressure Level Increased: ${newLevel}`;
        playRandomSoundEffect(getSoundEffect('pressure'));
	} else if (newLevel < oldLevel){
		messageDisplay.textContent = `Pressure Level Decreased: ${newLevel}`;         
        playRandomSoundEffect(getSoundEffect('settle'));  
	}
    pressureText.textContent = pressureMessages[newLevel]
}

function sizeLevelChange(oldLevel, newLevel){
	if(newLevel > oldLevel){
    	messageDisplay.textContent =  `Size Level Increased: ${newLevel}`;
	} else if (newLevel < oldLevel){
		messageDisplay.textContent = `Size Level Decreased: ${newLevel}`;
	}
    sizeText.textContent = sizeMessages[newLevel]
}

function updatePressureBar() {
    const percentage = Math.min((player.pressure / player.maxPressure) * 100, 100);
    pressureFill.style.width = percentage + "%";
}

function inflateBelly(){
    player.bellySize += pump.pumpStrokeVolume;
    player.bellyGrowth = player.bellySize - player.bellyMinSize;
    updateDisplay();
}

function updateDisplay() {
    bellySizeDisplay.textContent = Math.round(player.bellySize*100)/100;
    bellyGrowthDisplay.textContent = Math.round(player.bellyGrowth*100)/100;

    // Update record displays only if new records achieved
    if (player.bellySize > player.bellyRecordSize) {
        player.bellyRecordSize = Math.round(player.bellySize);
        recordSizeDisplay.textContent = player.bellyRecordSize;
    }
    if (player.bellyGrowth > player.bellyRecordGrowth){
        player.bellyRecordGrowth = Math.round(player.bellyGrowth);
        recordGrowthDisplay.textContent = player.bellyRecordGrowth;
    }
}

function popBelly() {
    alert(`You popped!! But you grew to ${player.bellyGrowth} and earned <TODO:EARNINGS>!`);
    player.pressure = 0;
    updatePressureBar();
    player.bellySize = player.bellyMinSize; //reset size
    player.bellyGrowth = 0;
    player.playerMoney += player.bellyGrowth; //award money based on growth this run.
    updateDisplay();
    messageDisplay.textContent = "";
}

// Initialize display values:
updateDisplay();
