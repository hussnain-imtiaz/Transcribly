# Transcribly
# AI-Powered Live Transcription and Note-Taking Assistant

This project is an AI-powered application that provides real-time transcription and note-taking capabilities. The assistant is designed to help students, educators, and professionals capture spoken content accurately, generate summaries, and improve retention of information during lectures, meetings, or any other spoken content sessions.

## Features

- **Real-Time Transcription**: Automatically transcribe speech to text in real-time with continuous updates.
- **Speaker Identification**: Automatically detects and labels different speakers.
- **Timestamped Transcriptions**: Adds timestamps to transcription for easy reference.
- **Text Formatting**: Provides options to format text (bold, italic, underline, highlight).
- **Summarization**: Generates key points and summaries for quick review.
- **Translation**: Supports translation of transcribed text into multiple languages.
- **Export Options**: Allows exporting transcriptions and summaries in PDF or DOCX formats.
- **User-Friendly Controls**: Easy-to-use interface for starting, pausing, resuming, and stopping transcriptions.

## Setup

### Running Locally

1. **Clone the repository**:

    ```bash
    git clone https://github.com/hussnain-imtiaz/Transcribly
    cd Transcribly
    ```

2. **Install Python dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3. **Run the Flask server**:

    ```bash
    python app.py
    ```

4. **Visit the application**:
   Open your browser and navigate to `http://localhost:5000`.

### Running via Docker

1. **Clone the repository**:

    ```bash
    git clone https://github.com/hussnain-imtiaz/Transcribly
    cd Transcribly
    ```

2. **Build the Docker image**:

    ```bash
    docker build -t Transcribly .
    ```

3. **Run the Docker container**:

    ```bash
    docker run -p 3000:3000 -p 5000:5000 Transcribly
    ```

4. **Visit the application**:
   Open your browser and navigate to `http://localhost:3000`.

## Usage

- Click **Start Transcription** to begin live transcription.
- Use the **Pause** and **Resume** buttons to control the transcription.
- Click **Stop** to end the transcription.
- Use the toolbar to format text, highlight, or mark important points.
- Use the **Translate** dropdown to translate text into a selected language.
- Use the **Export** options to save your transcriptions as PDF or DOCX files.
- Click **Extract Key Points** to generate an AI-powered summary of the transcription.

## Requirements

- **Python 3.7+**
- **FFmpeg**: Required for processing audio files.

## Installation

### FFmpeg Installation

#### macOS

```bash
brew install ffmpeg
```

#### Windows
- Download FFmpeg from ffmpeg.org.
- Follow the installation instructions and add FFmpeg to your system PATH.

#### Linux
Use your distribution's package manager to install FFmpeg:

```bash
sudo apt update
sudo apt install ffmpeg
```

## Feedback

We appreciate your feedback to improve this project. If you have any suggestions or encounter any issues, please [create an issue](https://github.com/hussnain-imtiaz/Transcribly/issues) on GitHub.


