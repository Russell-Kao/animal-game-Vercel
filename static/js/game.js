const animals = ['bear', 'dog', 'cat', 'fox', 'rabbit', 'mouse', 'monkey', 'elephant'];
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true; // 新增變量來控制是否可以翻牌

function startGame(size) {
    const cardsContainer = document.getElementById('cards-container');
    let rows, cols;
    if (size === '2x4') {
        rows = 2;
        cols = 4;
    } else { // 4x4
        rows = 4;
        cols = 4;
    }
    const totalCards = rows * cols;
    const animalSubset = animals.slice(0, totalCards / 2);
    cards = [...animalSubset, ...animalSubset]
        .sort(() => Math.random() - 0.5)
        .map((animal, index) => ({
            id: index,
            animal: animal,
            flipped: false,
            matched: false
        }));

    cardsContainer.innerHTML = '';
    cardsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    cardsContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">
                <img src="${window.env.IMAGES_PATH}${card.animal}.png" alt="${card.animal}">
            </div>
        `;
        cardElement.addEventListener('click', () => flipCard(card.id));
        cardsContainer.appendChild(cardElement);
    });

    matchedPairs = 0;
    flippedCards = [];
    canFlip = true; // 遊戲開始時允許翻牌
}

function flipCard(id) {
    const card = cards.find(c => c.id === id);
    if (!canFlip || card.flipped || card.matched) return; // 如果不能翻牌或卡片已翻開或已匹配，則直接返回

    playFlipSound();
    card.flipped = true;
    flippedCards.push(card);
    updateCardDisplay(card);

    if (flippedCards.length === 2) {
        canFlip = false; // 翻開第二張牌後，禁止繼續翻牌
        setTimeout(checkMatch, 1000);
    }
}

function updateCardDisplay(card) {
    const cardElement = document.querySelector(`.card[data-id="${card.id}"]`);
    cardElement.classList.toggle('flipped', card.flipped);
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.animal === card2.animal) {
        card1.matched = card2.matched = true;
        matchedPairs++;
        document.querySelectorAll(`.card[data-id="${card1.id}"], .card[data-id="${card2.id}"]`)
            .forEach(el => el.classList.add('matched'));
        playMatchSound();
        playAnimalSound(card1.animal); // 確保這行代碼存在
        if (matchedPairs === cards.length / 2) {
            setTimeout(() => {
                alert('恭喜你赢了！');
                if (confirm('想再玩一次吗？')) {
                    startGame('4x4');  // 或者重新開始之前的遊戲模式
                } else {
                    transitionToStoryCreation(card1.animal);
                }
            }, 1000);
        }
    } else {
        // 如果不匹配，將卡片翻回去
        setTimeout(() => {
            card1.flipped = card2.flipped = false;
            updateCardDisplay(card1);
            updateCardDisplay(card2);
        }, 500);
    }
    flippedCards = [];
    canFlip = true; // 重新允許翻牌
}

function playSound(soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch(e => console.error(`播放音效失败: ${soundPath}`, e));  // 增加錯誤處理
}

function playFlipSound() {
    playSound(`${window.env.SOUNDS_PATH}flip.wav`);
}

function playMatchSound() {
    playSound(`${window.env.SOUNDS_PATH}match.wav`);
}

function playAnimalSound(animal) {
    setBackgroundMusicVolume(0.2);  // 降低背景音樂音量
    const audio = new Audio(`${window.env.SOUNDS_PATH}${animal}.wav`);
    audio.play().catch(e => console.error(`播放 ${animal} 音效失敗:`, e));

    audio.onended = () => {
        setBackgroundMusicVolume(0.5);  // 恢復背景音樂音量
    };
}

function transitionToStoryCreation(animal) {
    const gameBoard = document.getElementById('game-board');
    const storyCreation = document.getElementById('story-creation');

    gameBoard.classList.add('hidden');
    storyCreation.classList.remove('hidden');

    // 如果有背景音乐，可以在这里停止
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    // 直接調用 enterStoryMode
    enterStoryMode(animal);
}

// 导出 startGame 函数，使其可以从 main.js 调用
window.startGame = startGame;

function fadeInBackgroundMusic() {
    const backgroundMusic = document.getElementById('background-music');
    backgroundMusic.volume = 0;
    backgroundMusic.play();
    let volume = 0;
    const fadeIn = setInterval(() => {
        if (volume < 1) {
            volume += 0.1;
            backgroundMusic.volume = volume;
        } else {
            clearInterval(fadeIn);
        }
    }, 200);
}

function playTaiwaneseAudio(animal) {
    setBackgroundMusicVolume(0.2); // 降低背景音樂音量
    const audio = new Audio(`${window.env.SOUNDS_PATH}${animal}-taiwanese.mp3`);
    audio.volume = 1.0; // 確保台語音頻是全音量
    audio.play().catch(e => console.error("播放音频失败:", e));
    
    // 音頻播放結束後恢復背景音樂音量
    audio.onended = () => {
        setBackgroundMusicVolume(0.5);
    };
}

function stopBackgroundMusic() {
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;  // 每次暫停後重置播放時間
    }
}
