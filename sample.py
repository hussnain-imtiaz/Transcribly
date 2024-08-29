import requests

# Define the endpoint for the Ollama API
OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"  # Make sure Ollama is running and accessible at this endpoint

# Define the prompt and sample input
prompt = "Your goal is to summarize the text given to you in roughly 300 words. It is from a meeting between one or more people. Only output the summary without any additional text. Focus on providing a summary in freeform text with what people said and the action items coming out of it."

sample_transcription = """
Speaker 1: Today, we discussed the upcoming product launch, and the marketing team has laid out a plan. We'll focus on social media and email campaigns primarily.
Speaker 2: That's right. We also need to finalize the content calendar by next week and ensure that all the materials are ready.
Speaker 1: Agreed. We should also look into influencer partnerships to expand our reach.
Speaker 2: I will coordinate with the creative team to get everything in place. Let's meet again next Wednesday to review the progress.
"""

# Combine the prompt and transcription for the Ollama API
ollama_data = {
    "model": "mistral",  # You can change this to the model you are using
    "prompt": f"{prompt}: {sample_transcription}",
    "stream": False
}

# Make the request to the Ollama API
response = requests.post(OLLAMA_ENDPOINT, json=ollama_data)

# Check the response and print the summary
if response.status_code == 200:
    summary = response.json().get("response", "No summary generated")
    print("Summary:")
    print(summary)
else:
    print(f"Failed to generate summary. Status code: {response.status_code}")
    print("Response:", response.text)
