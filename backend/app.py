import os
from dotenv import load_dotenv
import openai
import requests
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from .models import db, Animal
from openai import OpenAI

load_dotenv()  # 加載 .env 文件中的環境變量

app = Flask(__name__, instance_path='/path/to/writeable/directory')
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)  # 啟用 CORS

# 從環境變量獲取 OpenAI API 密鑰
openai.api_key = os.getenv("OPENAI_API_KEY")
ATEN_API_TOKEN = os.getenv("ATEN_API_TOKEN")

# 使用 SQLite 作為輕量級資料庫
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/forest_animal_game.db'
db.init_app(app)

# 在應用上下文中創建資料表
with app.app_context():
    db.create_all()  # 創建資料表（如果尚未創建）

# 設置資源路徑
IMAGES_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'images')
SOUNDS_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'sounds')

# ATEN TTS API 設置
ATEN_API_URL = 'https://www.aivoice.com.tw/business/enterprise/api/v1'

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGES_PATH, filename)

@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    return send_from_directory(SOUNDS_PATH, filename)

@app.route('/api/animals', methods=['GET'])
def get_animals():
    animals = Animal.query.all()
    return jsonify([animal.to_dict() for animal in animals])

@app.route('/api/generate-story', methods=['POST', 'OPTIONS'])
def generate_story():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.json
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "未提供提示"}), 400

    try:
        # 使用新的 API 調用方式
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "你是一個專門為兒童創作溫馨有趣故事的助手。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        story = response.choices[0].message.content.strip()
        return jsonify({"story": story})
    except openai.error.OpenAIError as e:
        # 捕獲 OpenAI API 特定的錯誤
        print(f"OpenAI API 調用錯誤: {str(e)}")
        return jsonify({"error": "生成故事時發生錯誤", "details": str(e)}), 500
    except Exception as e:
        # 捕獲其他可能的錯誤
        print(f"未知錯誤: {str(e)}")
        return jsonify({"error": "生成故事時發生未知錯誤", "details": str(e)}), 500

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    ssml = data['ssml']

    # 发出合成请求
    synthesis_response = requests.post(
        f'{ATEN_API_URL}/syntheses',
        headers={'Authorization': f'Bearer {ATEN_API_TOKEN}', 'Content-Type': 'application/json'},
        json={'ssml': ssml}
    )

    if synthesis_response.status_code != 200:
        print(f"Error: {synthesis_response.status_code}, {synthesis_response.text}")
        return jsonify({'error': 'Synthesis request failed', 'details': synthesis_response.text}), 500

    synthesis_data = synthesis_response.json()
    synthesis_id = synthesis_data.get('synthesis_id')
    if not synthesis_id:
        return jsonify({'error': 'Failed to retrieve synthesis ID'}), 500

    return jsonify({
        'status': 'Processing',
        'synthesis_id': synthesis_id
    })

@app.route('/api/voices', methods=['GET'])
def get_voices():
    response = requests.get(
        f'{ATEN_API_URL}/models',
        headers={'Authorization': f'Bearer {ATEN_API_TOKEN}'}
    )

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch voices'}), 500

    return jsonify(response.json())

@app.route('/api/aten-token')
def get_aten_token():
    return jsonify({'token': ATEN_API_TOKEN})

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify(error=str(e)), 405

@app.route('/api/syntheses/<synthesis_id>/status', methods=['GET'])
def check_synthesis_status(synthesis_id):
    status_response = requests.get(
        f'{ATEN_API_URL}/syntheses/{synthesis_id}',
        headers={'Authorization': f'Bearer {ATEN_API_TOKEN}'}
    )

    if status_response.status_code != 200:
        return jsonify({'error': 'Failed to check synthesis status', 'details': status_response.text}), 500

    status_data = status_response.json()
    return jsonify(status_data)

# 刪除 app.run() 以便由 Vercel 管理伺服器
