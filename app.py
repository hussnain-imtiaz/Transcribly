from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO
from docx import Document
from reportlab.lib.pagesizes import letter
from deep_translator import GoogleTranslator
import requests
from reportlab.pdfgen import canvas
import whisper
import os

model = whisper.load_model("base")  # Load Whisper model

app = Flask(__name__)

OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma:2b"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/transcription')
def transcription():
    return render_template('transcription.html')

# @app.route('/transcribe', methods=['POST'])
# def transcribe_audio():
#     try:
#         # Save the received audio file
#         audio_file = request.files['audio']
#         audio_path = "temp_audio.wav"
#         audio_file.save(audio_path)
#
#         # Transcribe audio using Whisper
#         result = model.transcribe(audio_path)
#         transcription_text = result['text']
#
#         # Cleanup
#         os.remove(audio_path)
#
#         return jsonify({'transcription': transcription_text})
#
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/export/pdf', methods=['POST'])
def export_pdf():
    transcription = request.form.get('transcription')

    # Create a buffer to hold the PDF data
    buffer = BytesIO()

    # Create a PDF canvas
    c = canvas.Canvas(buffer, pagesize=letter)
    text_object = c.beginText(40, 750)
    text_object.setFont("Helvetica", 12)

    # Split the transcription by new lines to maintain structure
    for line in transcription.split('\n'):
        text_object.textLine(line)

    # Finalize the PDF
    c.drawText(text_object)
    c.showPage()
    c.save()

    # Move the buffer's file pointer to the start
    buffer.seek(0)

    # Use send_file with Content-Disposition header
    return send_file(buffer, as_attachment=True, download_name='transcription.pdf', mimetype='application/pdf')

@app.route('/export/docx', methods=['POST'])
def export_docx():
    transcription = request.form.get('transcription')

    # Create a new Document
    document = Document()

    # Split the transcription by new lines to maintain structure
    for line in transcription.split('\n'):
        document.add_paragraph(line)

    # Create a buffer to hold the DOCX data
    buffer = BytesIO()
    document.save(buffer)

    # Move the buffer's file pointer to the start
    buffer.seek(0)

    # Use send_file with Content-Disposition header
    return send_file(buffer, as_attachment=True, download_name='transcription.docx',
                     mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')

@app.route('/summarize', methods=['POST'])
def summarize():
    transcription = request.form.get('transcription')

    # Sending request to Ollama's API for summarization
    ollama_prompt = f"Just start summary directly after 'Notes:'. Summarize the following text under 150 words: {transcription}. "
    ollama_data = {
        "model": OLLAMA_MODEL,
        "prompt": ollama_prompt,
        "stream": False,
        "keep_alive": "1m",
    }

    response = requests.post(OLLAMA_ENDPOINT, json=ollama_data)
    print(response)
    if response.status_code == 200:
        summary = response.json()["response"]
    else:
        summary = "There was an error processing the summarization."

    return jsonify({'summary': summary})

@app.route('/translate', methods=['POST'])
def translate():
    text = request.form.get('text')
    target_language = request.form.get('targetLanguage')
    translated_text = GoogleTranslator(source='auto', target=target_language).translate(text)
    return jsonify({'translatedText': translated_text})

if __name__ == '__main__':
    app.run(debug=True)
