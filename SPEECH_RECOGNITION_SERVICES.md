# Speech Recognition Services for Pronunciation Adventure Game

## Overview
The Pronunciation Adventure game requires:
1. **Microphone Access**: Browser-based audio capture
2. **Speech Recognition**: Converting speech to text
3. **Pronunciation Evaluation**: Assessing accuracy of English pronunciation

## Recommended Services

### 1. **Google Cloud Speech-to-Text API** (Recommended)
- **Best for**: High accuracy, multiple languages, pronunciation scoring
- **Features**:
  - Real-time streaming recognition
  - Pronunciation assessment (confidence scores)
  - Multiple language support
  - Word-level timestamps
- **Pricing**: Pay-as-you-go, ~$0.006 per 15 seconds
- **Setup**:
  ```bash
  pip install google-cloud-speech
  ```
- **Documentation**: https://cloud.google.com/speech-to-text/docs
- **Pros**: Excellent accuracy, pronunciation scoring built-in
- **Cons**: Requires Google Cloud account, API key management

### 2. **Azure Speech Services** (Microsoft)
- **Best for**: Enterprise integration, pronunciation assessment
- **Features**:
  - Pronunciation Assessment API (specifically for language learning)
  - Real-time transcription
  - Confidence scores per word
  - Detailed pronunciation feedback (accuracy, completeness, fluency)
- **Pricing**: Free tier available, then ~$1 per hour
- **Setup**:
  ```bash
  pip install azure-cognitiveservices-speech
  ```
- **Documentation**: https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/
- **Pros**: Built specifically for language learning, detailed feedback
- **Cons**: Azure account required

### 3. **AssemblyAI**
- **Best for**: Easy integration, good accuracy
- **Features**:
  - Real-time transcription
  - Word-level confidence scores
  - Simple REST API
- **Pricing**: Free tier (5 hours/month), then $0.00025 per second
- **Documentation**: https://www.assemblyai.com/docs
- **Pros**: Easy to use, good documentation
- **Cons**: Less specialized for pronunciation assessment

### 4. **Deepgram**
- **Best for**: Real-time streaming, low latency
- **Features**:
  - Real-time transcription
  - Word-level timestamps and confidence
  - Custom models
- **Pricing**: Free tier available, then pay-as-you-go
- **Documentation**: https://developers.deepgram.com/
- **Pros**: Fast, good for real-time applications
- **Cons**: Less specialized for pronunciation

### 5. **Web Speech API** (Browser Native - Limited)
- **Best for**: Simple demos, no backend required
- **Features**:
  - Built into Chrome/Edge browsers
  - No API key needed
  - Real-time transcription
- **Limitations**:
  - No pronunciation scoring
  - Chrome/Edge only
  - Less accurate than cloud services
  - No backend processing
- **Use Case**: Good for initial prototyping, but not production-ready for pronunciation assessment

## Recommended Implementation Approach

### Option 1: Azure Speech Services (Best for Language Learning)
Azure's Pronunciation Assessment API is specifically designed for language learning applications.

**Backend Implementation**:
```python
# eigokit_backend/app/services/speech_evaluation.py
from azure.cognitiveservices.speech import SpeechConfig, SpeechRecognizer, PronunciationAssessmentConfig
import os

def evaluate_pronunciation(audio_data: bytes, reference_text: str) -> dict:
    """
    Evaluate pronunciation using Azure Speech Services
    
    Returns:
        {
            "accuracy_score": float,  # 0-100
            "completeness_score": float,  # 0-100
            "fluency_score": float,  # 0-100
            "pronunciation_score": float,  # Overall score
            "words": [
                {
                    "word": str,
                    "accuracy_score": float,
                    "error_type": str  # "None", "Omission", "Insertion", "Mispronunciation"
                }
            ]
        }
    """
    speech_config = SpeechConfig(
        subscription=os.getenv("AZURE_SPEECH_KEY"),
        region=os.getenv("AZURE_SPEECH_REGION")
    )
    
    pronunciation_config = PronunciationAssessmentConfig(
        reference_text=reference_text,
        grading_system="HundredMark",
        granularity="Phoneme",
        enable_miscue=True
    )
    
    # Process audio and return scores
    # ... implementation details
```

**Frontend Implementation**:
```javascript
// eigokit_student/src/components/games/PronunciationAdventure.jsx
const handleRecord = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('reference_text', currentWord.english_word);
      
      const response = await studentAPI.evaluatePronunciation(formData);
      // Display feedback based on response
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    setTimeout(() => {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }, 3000); // Record for 3 seconds
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Please allow microphone access to use this feature.');
  }
};
```

### Option 2: Google Cloud Speech-to-Text (Alternative)
Similar implementation but using Google's API with confidence scores.

## Implementation Steps

1. **Choose a Service**: Recommend Azure Speech Services for pronunciation assessment
2. **Backend Setup**:
   - Add service credentials to environment variables
   - Create `/api/students/{student_id}/evaluate-pronunciation` endpoint
   - Process audio and return scores
3. **Frontend Setup**:
   - Request microphone permissions
   - Record audio using MediaRecorder API
   - Send audio to backend for evaluation
   - Display feedback to student
4. **Database**:
   - Store pronunciation scores in `game_sessions` table
   - Track improvement over time

## Environment Variables Needed

```bash
# For Azure Speech Services
AZURE_SPEECH_KEY=your_key_here
AZURE_SPEECH_REGION=your_region_here

# OR for Google Cloud
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

## Cost Considerations

- **Azure**: Free tier (5 hours/month), then ~$1/hour
- **Google**: ~$0.006 per 15 seconds (~$1.44/hour)
- **Recommendation**: Start with Azure free tier, scale as needed

## Security Considerations

1. **API Keys**: Store in environment variables, never commit to git
2. **Audio Data**: Consider encryption for sensitive audio
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **User Privacy**: Inform users about audio processing

## Next Steps

1. Sign up for Azure Speech Services (or chosen service)
2. Add backend endpoint for pronunciation evaluation
3. Update frontend to record and send audio
4. Test with sample vocabulary words
5. Add visual feedback for pronunciation scores
6. Store results in database for progress tracking

