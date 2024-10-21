document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameBoard = document.getElementById('game-board');
    const storyCreation = document.getElementById('story-creation');

    // 初始化時只顯示主菜單
    mainMenu.classList.remove('hidden');
    gameBoard.classList.add('hidden');
    storyCreation.classList.add('hidden');

    const startGame2x4Button = document.getElementById('start-game-2x4');
    const startGame4x4Button = document.getElementById('start-game-4x4');
    const returnToMenuButtons = document.querySelectorAll('#return-to-menu');
    const backgroundMusic = document.getElementById('background-music');

    function startGame(size) {
        mainMenu.classList.add('hidden');
        gameBoard.classList.remove('hidden');
        storyCreation.classList.add('hidden');
        if (typeof window.startGame === 'function') {
            window.startGame(size);
        } else {
            console.error('startGame 函数未定义');
        }
        if (backgroundMusic) backgroundMusic.play().catch(e => console.error("无法播放背景音乐:", e));
    }

    if (startGame2x4Button) {
        startGame2x4Button.addEventListener('click', () => startGame('2x4'));
    }

    if (startGame4x4Button) {
        startGame4x4Button.addEventListener('click', () => startGame('4x4'));
    }

    returnToMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            mainMenu.classList.remove('hidden');
            gameBoard.classList.add('hidden');
            storyCreation.classList.add('hidden');
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
            }
        });
    });
});

// 移除 startGame 函数，因为它现在在 game.js 中定义

// 添加以下函數到 main.js

let backgroundMusic;

function initializeBackgroundMusic() {
    backgroundMusic = document.getElementById('background-music');
    backgroundMusic.volume = 0.5; // 設置初始音量為 50%
}

function setBackgroundMusicVolume(volume) {
    if (backgroundMusic) {
        backgroundMusic.volume = volume;
    }
}

// 在文件加載完成後初始化背景音樂
document.addEventListener('DOMContentLoaded', initializeBackgroundMusic);

function showMainMenu() {
    // 現有的代碼...
    setBackgroundMusicVolume(0.5); // 恢復到 50% 音量
}

function showGameOverScreen() {
    // 現有的代碼...
    setBackgroundMusicVolume(0.5); // 恢復到 50% 音量
}