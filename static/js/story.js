const animalFacts = {
    bear: "熊的嗅觉非常灵敏，能闻到很远的食物味道！",
    dog: "狗狗有独一无二的鼻纹喔！",
    cat: "猫咪睡觉时间占一天的70%！",
    fox: "狐狸有超过40种叫声喔！",
    rabbit: "兔子有360度的视野喔！",
    mouse: "老鼠非常聪明喔！",
    monkey: "猴子也有指纹喔！",
    elephant: "大象是唯一不能跳的哺乳动物！"
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
        
        // 只显示天气选项，隐藏其他类别
        if (index !== 0) {
            categoryDiv.style.display = 'none';
        }
    });


    // 隐藏生成故事按钮
    const generateStoryButton = document.getElementById('generate-story');
    generateStoryButton.style.display = 'none';
}


function getCategoryName(category) {
    const categoryNames = {
        weather: '天气',
        scene: '场景',
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

    console.log(`选择的类别: ${category}, 当前索引: ${currentIndex}, 总类别数: ${categories.length}`);

    if (currentIndex < categories.length - 1) {
        // 隐藏当前类别，显示下一个类别
        document.querySelector(`.story-category-${category}`).style.display = 'none';
        const nextCategory = categories[currentIndex + 1];
        document.querySelector(`.story-category-${nextCategory}`).style.display = 'block';
        console.log(`显示下一个类别: ${nextCategory}`);
    } else {
        // 如果后一个类别（物品），显示生成故事按钮
        console.log('显示生成故事按钮');
        const generateStoryButton = document.getElementById('generate-story');
        generateStoryButton.style.display = 'block';
        generateStoryButton.classList.remove('hidden');
    }
}


function generateStory() {
    console.log("呼叫生成故事函数");
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


    console.log("选择的元素:", selectedElements);

    const emojiToText = {
        '☀️': '晴天',
        '🌧️': '雨天',
        '❄️': '雪天',
        '🏞️': '公园',
        '🏠': '家里',
        '🏫': '学校',
        '🍎': '苹果',
        '📚': '书本',
        '🎈': '气球'
    };

    const selectedElementsText = {};
    Object.keys(selectedElements).forEach(category => {
        selectedElementsText[category] = emojiToText[selectedElements[category]] || selectedElements[category];
    });

    const prompt = `创作一个迪士尼风格的温馨家庭故事，适合3-8岁的小朋友。故事要求：

    1. 主角：一位小${lastMatchedAnimal}公主或王子与她/他的家人。
    2. 场景：在${selectedElementsText.scene}中庆祝特别的日子。
    3. 天气：${selectedElementsText.weather}
    4. 重要物品：${selectedElementsText.object}
    5. 挑战：忘记了重要物品或事情，需要大家一起努力解决。
    6. 情节：包括一些小冒险，主角与家人一起完成任务。
    7. 结尾：以家庭和睦、爱与感谢为结束，让故事有温馨的感觉。
    8. 风格：轻松、有趣、富有魔法色彩，适合小朋友的语言和词汇。
    9. 长度：大约80字左右，保持简洁。

    请根据这些要求，创作一个温馨有趣的故事，让孩子感受到家庭温暖和奇幻冒险的魅力。`;

    console.log("提示:", prompt);

    // 这里将替换为真正的 GPT API 调用
    callGPTAPI(prompt).then(generatedStory => {
        console.log("生成的故事:", generatedStory);
        document.getElementById('story-display').textContent = generatedStory;
        loadingAnimation.style.display = 'none';
        generateButton.textContent = '生成完毕';
        generateButton.disabled = false;
        speakStory(generatedStory);
    }).catch(error => {
        console.error('生成故事时发生错误:', error);
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

    // 重置类别显示
    document.querySelector('.story-category-weather').style.display = 'block';
    document.querySelector('.story-category-scene').style.display = 'none';
    document.querySelector('.story-category-object').style.display = 'none';
}


function playAnimalFactAudio(animal) {
    const audio = new Audio(`${window.env.SOUNDS_PATH}${animal}-fact.mp3`);
    audio.play().catch(e => console.error("播放音频失败:", e));
}

// 添加这个函数来获取 ATEN token
async function getATENToken() {
    try {
        const response = await fetch('/api/aten-token');  // 使用相对路径从后端获取 API token
        if (!response.ok) {
            throw new Error(`HTTP 错误！状态: ${response.status}`);
        }
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('获取 ATEN token 时发生错误:', error);
        throw error;
    }
}

// 修改 speakStory 函数
async function speakStory(text) {
    console.log("透过 ATEN TTS API 朗读故事");
    const proxyUrl = '/api/tts';  // 使用相对路径

    // 将 emoji 转换为中文描述
    const emojiToText = {
        '☀️': '晴天',
        '🌧️': '雨天',
        '❄️': '雪天',
        '🏞️': '公园',
        '🏠': '家里',
        '🏫': '学校',
        '🍎': '苹果',
        '📚': '书本',
        '🎈': '气球'
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
        
        // 发送合成请求
        const synthesisResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // 加入 Bearer 格式
            },
            body: JSON.stringify({ ssml: ssml })
        });

        if (!synthesisResponse.ok) {
            throw new Error(`HTTP 错误！状态: ${synthesisResponse.status}`);
        }

        const synthesisData = await synthesisResponse.json();
        console.log("Synthesis Data:", synthesisData);  // 调试时记录响应

        // 检查合成状态，并播放音频
        if (synthesisData.status === 'Success') {
            console.log("Audio URL:", synthesisData.synthesis_path);
            const audio = new Audio(synthesisData.synthesis_path);
            audio.play().catch(e => console.error("播放音频失败:", e));
        } else {
            throw new Error('合成失败');
        }
    } catch (error) {
        console.error('语音合成过程中发生错误:', error);
    }
}

// 新增函数：查询支持的声优列表
async function getVoiceList() {
    const proxyUrl = '/api/voices'; // 这应该是您后端代理 API 的 URL 用于获取声优列表

    try {
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP 错误！状态: ${response.status}`);
        }

        const data = await response.json();
        console.log("可用的声优:", data);
        return data;
    } catch (error) {
        console.error('获取声优列表时发生错误:', error);
        return null;
    }
}

// 在 DOMContentLoaded 事件中调用 getVoiceList
document.addEventListener('DOMContentLoaded', () => {
    const generateStoryButton = document.getElementById('generate-story');
    const resetStoryButton = document.getElementById('reset-story');
    
    if (generateStoryButton) {
        generateStoryButton.addEventListener('click', generateStory);
        console.log("已添加生成故事按钮监听器");
    } else {
        console.error("找不到生成故事按钮");
    }

    if (resetStoryButton) {
        resetStoryButton.textContent = '重新生成故事';
        resetStoryButton.addEventListener('click', generateStory);
        console.log("已添加重置故事按钮监听器");
    } else {
        console.error("找不到重置故事按钮");
    }

    // 获取并显示声优列表
    getVoiceList().then(voices => {
        if (voices) {
            console.log("可用的声优:", voices);
            // 这里可以添加代码来在 UI 中显示声优列表
        }
    });
});


window.enterStoryMode = enterStoryMode;

async function callGPTAPI(prompt) {
    console.log("使用提示呼叫 GPT API:", prompt);
    
    try {
        const response = await fetch('/api/generate-story', {  // 使用相对路径
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP 错误！状态: ${response.status}`);
        }

        const data = await response.json();
        return data.story;
    } catch (error) {
        console.error('呼叫 GPT API 时发生错误:', error);
        throw error;
    }
}







