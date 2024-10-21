const animalFacts = {
    bear: "熊的嗅覺非常靈敏，能聞到很遠的食物味道！",
    dog: "狗狗有獨一無二的鼻紋喔！",
    cat: "貓咪睡覺時間佔一天的70%！",
    fox: "狐狸有超過40種叫聲喔！",
    rabbit: "兔子有360度的視野喔！",
    mouse: "老鼠非常聰明喔！",
    monkey: "猴子也有指紋喔！",
    elephant: "大象是唯一不能跳的哺乳動物！"
};


let lastMatchedAnimal = '';

const storyElements = {
    weather: ['☀️', '🌧️', '❄️'],
    scene: ['🏞️', '🏠', '🏫'],
    object: ['🍎', '📚', '🎈']
};

function enterStoryMode(animal) {
    lastMatchedAnimal = animal;
    const gameBoard = document.getElementById('game-board');
    const storyCreation = document.getElementById('story-creation');
    const selectedAnimal = document.getElementById('selected-animal');

    gameBoard.classList.add('hidden');
    storyCreation.classList.remove('hidden');

    selectedAnimal.innerHTML = '';
    const animalImage = document.createElement('img');
    animalImage.src = `${window.env.IMAGES_PATH}${animal}.png`;
    animalImage.alt = animal;
    animalImage.style.width = '150px';
    selectedAnimal.appendChild(animalImage);

    const factText = document.createElement('p');
    factText.textContent = animalFacts[animal];
    selectedAnimal.appendChild(factText);

    playAnimalFactAudio(animal);
    createStoryBoard();
}

function createStoryBoard() {
    const storyBoard = document.getElementById('story-board');
    storyBoard.innerHTML = '';

    Object.entries(storyElements).forEach(([category, elements], index) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = `story-category story-category-${category}`;
        categoryDiv.innerHTML = `<h3>${getCategoryName(category)}</h3>`;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'story-buttons';

        elements.forEach(element => {
            const button = document.createElement('button');
            button.className = 'story-element-button';
            button.textContent = element;
            button.onclick = () => selectStoryElement(category, element, button);
            buttonsDiv.appendChild(button);
        });

        categoryDiv.appendChild(buttonsDiv);
        storyBoard.appendChild(categoryDiv);
        
        // 只顯示天氣選項，隱藏其他類別
        if (index !== 0) {
            categoryDiv.style.display = 'none';
        }
    });


    // 隱藏生成故事按鈕
    const generateStoryButton = document.getElementById('generate-story');
    generateStoryButton.style.display = 'none';
}


function getCategoryName(category) {
    const categoryNames = {
        weather: '天氣',
        scene: '場景',
        object: '物品'
    };
    return categoryNames[category] || category;
}

function selectStoryElement(category, element, button) {
    const categoryButtons = button.parentElement.children;
    Array.from(categoryButtons).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    const categories = Object.keys(storyElements);
    const currentIndex = categories.indexOf(category);

    console.log(`選擇的類別: ${category}, 目前索引: ${currentIndex}, 總類別數: ${categories.length}`);

    if (currentIndex < categories.length - 1) {
        // 隱藏當前類別，顯示下一個類別
        document.querySelector(`.story-category-${category}`).style.display = 'none';
        const nextCategory = categories[currentIndex + 1];
        document.querySelector(`.story-category-${nextCategory}`).style.display = 'block';
        console.log(`顯示下一個類別: ${nextCategory}`);
    } else {
        // 如果最後一個類別（物品），顯示生成故事按鈕
        console.log('顯示生成故事按鈕');
        const generateStoryButton = document.getElementById('generate-story');
        generateStoryButton.style.display = 'block';
        generateStoryButton.classList.remove('hidden');
    }
}


function generateStory() {
    console.log("呼叫生成故事函數");
    const loadingAnimation = document.getElementById('loading-animation');
    loadingAnimation.style.display = 'block';

    const generateButton = document.getElementById('generate-story');
    generateButton.textContent = '生成中...';
    generateButton.disabled = true;

    const selectedElements = {};
    Object.keys(storyElements).forEach(category => {
        const categoryName = getCategoryName(category);
        const categoryDiv = Array.from(document.querySelectorAll('.story-category')).find(div => 
            div.querySelector('h3').textContent === categoryName
        );
        if (categoryDiv) {
            const selectedButton = categoryDiv.querySelector('.story-element-button.selected');
            selectedElements[category] = selectedButton ? selectedButton.textContent : '';
        }
    });


    console.log("選擇的元素:", selectedElements);

    const emojiToText = {
        '☀️': '晴天',
        '🌧️': '雨天',
        '❄️': '雪天',
        '🏞️': '公園',
        '🏠': '家裡',
        '🏫': '學校',
        '🍎': '蘋果',
        '📚': '書本',
        '🎈': '氣球'
    };

    const selectedElementsText = {};
    Object.keys(selectedElements).forEach(category => {
        selectedElementsText[category] = emojiToText[selectedElements[category]] || selectedElements[category];
    });

    const prompt = `創作一個迪士尼風格的溫馨家庭故事，適合3-8歲的小朋友。故事要求：

    1. 主角：一位小${lastMatchedAnimal}公主或王子與他/她的家人。
    2. 場景：在${selectedElementsText.scene}中慶祝特別的日子。
    3. 天氣：${selectedElementsText.weather}
    4. 重要物品：${selectedElementsText.object}
    5. 挑戰：忘記了一樣重要的物品或事情，需要大家一起努力解決。
    6. 情節：包括一些小冒險，主角與家人一起完成任務。
    7. 結尾：以家庭和睦、愛與感謝為結束，讓故事有溫馨的感覺。
    8. 風格：輕鬆、有趣、富有魔法色彩，適合小朋友的語言和詞彙。
    9. 長度：大約80字左右，保持簡潔。

    請根據這些要求，創作一個溫馨有趣的故事，讓孩子感受到家庭溫暖和奇幻冒險的魅力。`;

    console.log("提示:", prompt);

    // 這裡將替換為真正的 GPT API 調用
    callGPTAPI(prompt).then(generatedStory => {
        console.log("生成的故事:", generatedStory);
        document.getElementById('story-display').textContent = generatedStory;
        loadingAnimation.style.display = 'none';
        generateButton.textContent = '生成完畢';
        generateButton.disabled = false;
        speakStory(generatedStory);
    }).catch(error => {
        console.error('生成故事時發生錯誤:', error);
        loadingAnimation.style.display = 'none';
        generateButton.textContent = '重新生成故事';
        generateButton.disabled = false;
    });
}


function resetStory() {
    document.querySelectorAll('.story-element-button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById('story-display').textContent = '';
    const generateButton = document.getElementById('generate-story');
    generateButton.textContent = '生成故事';
    generateButton.disabled = false;
    generateButton.style.display = 'none';

    // 重置類別顯示
    document.querySelector('.story-category-weather').style.display = 'block';
    document.querySelector('.story-category-scene').style.display = 'none';
    document.querySelector('.story-category-object').style.display = 'none';
}


function playAnimalFactAudio(animal) {
    const audio = new Audio(`${window.env.SOUNDS_PATH}${animal}-fact.mp3`);
    audio.play().catch(e => console.error("播放音訊失敗:", e));
}

// 添加這個函數來獲取 ATEN token
async function getATENToken() {
    const response = await fetch('/api/aten-token');  // 使用相對路徑
    const data = await response.json();
    return data.token;
}

// 修改 speakStory 函數
async function speakStory(text) {
    console.log("透過 ATEN TTS API 朗讀故事");
    const proxyUrl = '/api/tts';  // 使用相對路徑

    // 將 emoji 轉換為中文描述
    const emojiToText = {
        '☀️': '晴天',
        '🌧️': '雨天',
        '❄️': '雪天',
        '🏞️': '公園',
        '🏠': '家裡',
        '🏫': '學校',
        '🍎': '蘋果',
        '📚': '書本',
        '🎈': '氣球'
    };

    let processedText = text;
    for (const [emoji, description] of Object.entries(emojiToText)) {
        processedText = processedText.replace(new RegExp(emoji, 'g'), description);
    }

    const ssml = `<speak xmlns='http://www.w3.org/2001/10/synthesis' version='1.1' xml:lang='zh-TW'>
        <voice name='Hannah_colloquial'>${processedText}</voice>
    </speak>`;

    try {
        const token = await getATENToken();
        
        // 步驟1：發送合成請求
        const synthesisResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ ssml: ssml })
        });

        if (!synthesisResponse.ok) {
            throw new Error(`HTTP 錯誤！狀態: ${synthesisResponse.status}`);
        }

        const synthesisData = await synthesisResponse.json();
        
        // 步驟2：檢查合成狀態（這部分可能需要根據您的後端實現進行調整）
        if (synthesisData.status === 'Success') {
            const audio = new Audio(synthesisData.audioUrl);
            audio.play().catch(e => console.error("播放音訊失敗:", e));
        } else {
            throw new Error('合成失敗');
        }
    } catch (error) {
        console.error('語音合成過程中發生錯誤:', error);
    }
}

// 新增函數：查詢支援的聲優列表
async function getVoiceList() {
    const proxyUrl = '/api/voices'; // 這應該是您後端代理 API 的 URL 用於獲取聲優列表

    try {
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP 錯誤！狀態: ${response.status}`);
        }

        const data = await response.json();
        console.log("可用的聲優:", data);
        return data;
    } catch (error) {
        console.error('獲取聲優列表時發生錯誤:', error);
        return null;
    }
}

// 在 DOMContentLoaded 事件中調用 getVoiceList
document.addEventListener('DOMContentLoaded', () => {
    const generateStoryButton = document.getElementById('generate-story');
    const resetStoryButton = document.getElementById('reset-story');
    
    if (generateStoryButton) {
        generateStoryButton.addEventListener('click', generateStory);
        console.log("已添加生成故事按鈕監聽器");
    } else {
        console.error("找不到生成故事按鈕");
    }

    if (resetStoryButton) {
        resetStoryButton.textContent = '重新生成故事';
        resetStoryButton.addEventListener('click', generateStory);
        console.log("已添加重置故事按鈕監聽器");
    } else {
        console.error("找不到重置故事按鈕");
    }

    // 獲取並顯示聲優列表
    getVoiceList().then(voices => {
        if (voices) {
            console.log("可用的聲優:", voices);
            // 這裡可以添加程式碼來在 UI 中顯示聲優列表
        }
    });
});


window.enterStoryMode = enterStoryMode;

async function callGPTAPI(prompt) {
    console.log("使用提示呼叫 GPT API:", prompt);
    
    try {
        const response = await fetch('/api/generate-story', {  // 使用相對路徑
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP 錯誤！狀態: ${response.status}`);
        }

        const data = await response.json();
        return data.story;
    } catch (error) {
        console.error('呼叫 GPT API 時發生錯誤:', error);
        throw error;
    }
}




