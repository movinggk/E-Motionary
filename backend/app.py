import sqlite3
from datetime import datetime
import calendar
from flask import Flask, request, redirect, url_for, render_template_string, jsonify
from flask_cors import CORS
import requests
from openai import OpenAI
import os
import base64

# === Configuration: Insert your keys here ===
FLASK_SECRET = "your_flask_secret_here"
AUDD_API_TOKEN = "8c71a605acd79e8771c612a1e412db5f"
OPENAI_API_KEY = "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"
# ============================================

# Initialize Flask app and OpenAI client
app = Flask(__name__)
app.secret_key = FLASK_SECRET
CORS(app)  # Enable CORS for React frontend
client = OpenAI(api_key=OPENAI_API_KEY)

# Database file path
DB_PATH = "integrated_diary.db"

# Initialize the database and create tables if they don't exist
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create songs table
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT,
            listened_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        '''
    )
    
    # Create photos table
    cursor.execute(
        '''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_url TEXT NOT NULL,
            label TEXT,
            taken_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        '''
    )
    
    conn.commit()
    conn.close()

# Ensure database is ready on startup
init_db()

# API Routes for React frontend

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

@app.route('/api/songs', methods=['GET'])
def get_songs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, artist, listened_at FROM songs ORDER BY listened_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    songs = []
    for row in rows:
        songs.append({
            'id': row[0],
            'title': row[1],
            'artist': row[2],
            'listened_at': row[3]
        })
    
    return jsonify(songs)

@app.route('/api/photos', methods=['GET'])
def get_photos():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, data_url, label, taken_at FROM photos ORDER BY taken_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    photos = []
    for row in rows:
        photos.append({
            'id': row[0],
            'data_url': row[1],
            'label': row[2],
            'taken_at': row[3]
        })
    
    return jsonify(photos)

@app.route('/api/calendar-data', methods=['GET'])
def get_calendar_data():
    """Get both songs and photos for calendar display"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get songs
    cursor.execute("SELECT title, artist, listened_at FROM songs ORDER BY listened_at DESC")
    songs = cursor.fetchall()
    
    # Get photos
    cursor.execute("SELECT data_url, label, taken_at FROM photos ORDER BY taken_at DESC")
    photos = cursor.fetchall()
    
    conn.close()
    
    # Format data for calendar
    calendar_data = {
        'songs': [{'title': row[0], 'artist': row[1], 'timestamp': row[2]} for row in songs],
        'photos': [{'data_url': row[0], 'label': row[1], 'timestamp': row[2]} for row in photos]
    }
    
    return jsonify(calendar_data)

@app.route('/api/add-song', methods=['POST'])
def add_song():
    data = request.get_json()
    title = data.get('title')
    artist = data.get('artist', '')
    
    if title:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "INSERT INTO songs (title, artist, listened_at, created_at) VALUES (?, ?, ?, ?)",
            (title, artist, now, now)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Song added successfully'})
    
    return jsonify({'success': False, 'message': 'Title is required'}), 400

@app.route('/api/add-photo', methods=['POST'])
def add_photo():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No JSON data provided'}), 400
        
        data_url = data.get('data_url')
        label = data.get('label', '')
        
        print(f"Received photo data - URL length: {len(data_url) if data_url else 0}, Label: {label}")
        
        if not data_url:
            return jsonify({'success': False, 'message': 'Data URL is required'}), 400
        
        if not data_url.startswith('data:image/'):
            return jsonify({'success': False, 'message': 'Invalid data URL format'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT INTO photos (data_url, label, taken_at, created_at) VALUES (?, ?, ?, ?)",
            (data_url, label, now, now)
        )
        conn.commit()
        conn.close()
        
        print("Photo saved successfully to database")
        return jsonify({'success': True, 'message': 'Photo added successfully'})
        
    except Exception as e:
        print(f"Error saving photo: {str(e)}")
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

@app.route('/api/recognize-song', methods=['POST'])
def recognize_song():
    """Audio recognition endpoint for music"""
    if 'audio_data' not in request.files:
        return jsonify({'success': False, 'message': 'No audio data provided'}), 400
    
    audio_file = request.files['audio_data']
    files = {'file': (audio_file.filename, audio_file.stream, audio_file.mimetype)}
    data = {'api_token': AUDD_API_TOKEN}
    
    try:
        resp = requests.post('https://api.audd.io/', data=data, files=files)
        result = resp.json().get('result')
        
        if result:
            title = result.get('title')
            artist = result.get('artist')
            
            # Save to database
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            now = datetime.utcnow().isoformat()
            cursor.execute(
                "INSERT INTO songs (title, artist, listened_at, created_at) VALUES (?, ?, ?, ?)",
                (title, artist, now, now)
            )
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'song': {'title': title, 'artist': artist},
                'message': 'Song recognized and saved'
            })
        else:
            return jsonify({'success': False, 'message': 'Could not recognize song'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Ask questions about music and photo history"""
    data = request.get_json()
    question = data.get('question')
    
    if not question:
        return jsonify({'success': False, 'message': 'Question is required'}), 400
    
    # Get all data
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT title, artist, listened_at FROM songs")
    songs = cursor.fetchall()
    
    cursor.execute("SELECT label, taken_at FROM photos")
    photos = cursor.fetchall()
    
    conn.close()
    
    # Format history
    history = []
    for title, artist, ts in songs:
        artist_text = f" by {artist}" if artist else ""
        history.append(f"Song: {title}{artist_text} at {ts}")
    
    for label, ts in photos:
        label_text = f" ({label})" if label else ""
        history.append(f"Photo{label_text} at {ts}")
    
    history_text = "\n".join(history)
    
    # Ask OpenAI
    messages = [
        {"role": "system", "content": "You are a helpful assistant that answers questions about a user's music listening and photo history."},
        {"role": "system", "content": f"History:\n{history_text}"},
        {"role": "user", "content": question}
    ]
    
    try:
        response = client.chat.completions.create(
            model='gpt-4o',
            messages=messages
        )
        answer = response.choices[0].message.content
        return jsonify({'success': True, 'answer': answer})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

@app.route('/api/photos/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """Delete a specific photo"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM photos WHERE id = ?", (photo_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Photo deleted'})

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear all history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM songs")
    cursor.execute("DELETE FROM photos")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'History cleared'})

@app.route('/api/test-photo', methods=['GET'])
def test_photo():
    """Test endpoint to verify photo saving works"""
    try:
        # Test data URL (small 1x1 pixel JPEG)
        test_data_url = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT INTO photos (data_url, label, taken_at, created_at) VALUES (?, ?, ?, ?)",
            (test_data_url, "Test Photo", now, now)
        )
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Test photo saved successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Test failed: {str(e)}'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001) 