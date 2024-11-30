const soundEffects = {
    pop: [new Audio('res/sfx/pop1.wav'), new Audio('res/sfx/pop2.wav')],
    pressure: [new Audio('res/sfx/pressure1.mp3'), new Audio('res/sfx/pressure2.mp3')],
    settle: [new Audio('res/sfx/settle.mp3'), new Audio('res/sfx/settle.mp3')],
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
    playerMoney: 0
};
const pump = {
    pumpStaticPressure: 10,
    pumpPressureDecayRate: 3,
    pumpStrokeVolume: 10
}
const bellySizeDisplay = document.getElementById('bellySize');
const bellyGrowthDisplay = document.getElementById('bellyGrowth');
const recordSizeDisplay = document.getElementById('recordSize');
const recordGrowthDisplay = document.getElementById('recordGrowth');
const pressureFill = document.getElementById('pressureFill');
const messageDisplay = document.getElementById('message');
const maxPressure = 100;

function pumpAir() {
    player.pressure += pump.pumpStaticPressure;
    if(player.pressure >= maxPressure){
    	playRandomSoundEffect(getSoundEffect('pop'));
        popBelly();
        return;
    } else if(player.pressure >= maxPressure * 0.9){
    	playRandomSoundEffect(getSoundEffect('pressure'));
        messageDisplay.textContent = "Careful! Close to popping!"
    }
    inflateBelly();
    updatePressureBar();
    playRandomSoundEffect(getSoundEffect('pump'));
}

// Pressure decay over time (using pump.pumpPressureDecayRate)
setInterval(() => {
    if (player.pressure > 0) {
        player.pressure -= pump.pumpPressureDecayRate / 20;
        if (player.pressure < maxPressure * 0.9){
            messageDisplay.textContent = "";
        }
        updatePressureBar();
    }
}, 50);

function updatePressureBar() {
    const percentage = Math.min((player.pressure / maxPressure) * 100, 100);
    pressureFill.style.width = percentage + "%";
}

function inflateBelly(){
    player.bellySize += pump.pumpStrokeVolume;
    player.bellyGrowth = player.bellySize - player.bellyMinSize;
    updateDisplay();
}

function updateDisplay() {
    bellySizeDisplay.textContent = Math.round(player.bellySize);
    bellyGrowthDisplay.textContent = Math.round(player.bellyGrowth);

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
