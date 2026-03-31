// ============================================
// TERAAZ AI — DEMO ENGINE 🔱
// AI Justice Terminal
// ============================================

const submitBtn = document.getElementById('submit-btn');
const emptyState = document.getElementById('output-empty');
const loadingState = document.getElementById('output-loading');
const resultsState = document.getElementById('output-results');
const voiceBtn = document.getElementById('voice-btn');
const inputArea = document.getElementById('legal-input');
const waveformContainer = document.getElementById('waveform-container');
const waveformCanvas = document.getElementById('waveform-canvas');

// ==================== VOICE WAVEFORM VISUALIZER ====================
let audioCtx, analyser, dataArray, waveAnimId;

function startWaveform(stream) {
  if (!waveformCanvas || !waveformContainer) return;
  waveformContainer.classList.add('active');
  waveformCanvas.width = waveformContainer.offsetWidth;
  waveformCanvas.height = waveformContainer.offsetHeight;
  const ctx = waveformCanvas.getContext('2d');

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  function drawWave() {
    waveAnimId = requestAnimationFrame(drawWave);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    const barWidth = (waveformCanvas.width / dataArray.length) * 2;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * waveformCanvas.height * 0.8;
      // Monolith Gold: HSL(44, 100%, 50%)
      const opacity = (dataArray[i] / 255) * 0.8 + 0.1;
      ctx.fillStyle = `rgba(255, 184, 0, ${opacity})`;
      const y = (waveformCanvas.height - barHeight) / 2;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      x += barWidth;
    }
  }
  drawWave();
}

function stopWaveform() {
  if (waveAnimId) cancelAnimationFrame(waveAnimId);
  if (audioCtx) audioCtx.close();
  if (waveformContainer) waveformContainer.classList.remove('active');
}

// ==================== VOICE RECOGNITION ====================
let isRecording = false;
let recognition;
let mediaStream;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    inputArea.value = transcript;
  };

  recognition.onend = () => {
    if (isRecording) recognition.start();
  };
}

voiceBtn.addEventListener('click', async () => {
  if (!recognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  isRecording = !isRecording;
  if (isRecording) {
    voiceBtn.classList.add('recording');
    voiceBtn.innerHTML = '<span class="icon pulse">🔴</span> Sunn raha hoon... (Listening)';
    recognition.start();

    // Start waveform visualizer
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startWaveform(mediaStream);
    } catch (e) {
      console.log('Mic access denied for waveform');
    }
  } else {
    stopRecording();
  }
});

function stopRecording() {
  isRecording = false;
  voiceBtn.classList.remove('recording');
  voiceBtn.innerHTML = '<span class="icon">🎙</span> Bolke Batayein (Speak)';
  if (recognition) recognition.stop();
  stopWaveform();
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
  }
}

// ==================== RESPONSE DATABASE ====================
const responses = {
  landlord: {
    summary: "Kanoon ke anusar, aapka landlord aapko bina notice diye ya bina valid reason ke ghar se nahi nikal sakta. Aapke paas 'Rent Control Act' ke tahat suraksha hai.",
    law: "Rent Control Act, Section 13",
    lawDesc: "Yeh section kirayedar ko galat tareeke se nikaalne se bachata hai.",
    steps: ["Send a legal notice to your landlord", "Visit local Rent Control Tribunal", "File a complaint at District Collector office"]
  },
  salary: {
    summary: "Agar aapka employer salary nahi de raha hai, toh yeh Labour Laws ka ullanghan hai. Aap 'Payment of Wages Act' ke tahat shikayat darj kar sakte hain.",
    law: "Payment of Wages Act, 1936",
    lawDesc: "Yeh act samay par aur puri salary milne ka adhikar deta hai.",
    steps: ["Send a demand notice for unpaid wages", "File a case in Labour Court", "Inform the Labour Commissioner"]
  },
  police: {
    summary: "Police aapko bina warrant ke arrest nahi kar sakti (non-cognizable offences mein). Aapke paas bail aur legal aid ka adhikar hai.",
    law: "CrPC Section 41 & 50",
    lawDesc: "Ye sections police ki arrest power ko regulate karte hain.",
    steps: ["Ask for the Grounds of Arrest", "Inform your family immediately", "Demand to see a lawyer"]
  },
  rti: {
    summary: "RTI Act ke tahat aap kisi bhi sarkari vibhag se jaankari maang sakte hain. Yeh aapka maulik adhikar hai.",
    law: "Right to Information Act, 2005",
    lawDesc: "Yeh act nagrikonko sarkar se transparency ka adhikar deta hai.",
    steps: ["Draft RTI application with specific questions", "Submit to the Public Information Officer", "Pay ₹10 fee (BPL category exempt)"]
  },
  property: {
    summary: "Aapki zameen par kabza karna kanoon ke khilaf hai. Aap civil court mein muqadma darj kar sakte hain aur stay order le sakte hain.",
    law: "Transfer of Property Act, 1882",
    lawDesc: "Yeh act property ke transfer aur adhikar ko regulate karta hai.",
    steps: ["Gather all property documents", "File suit in Civil Court", "Apply for injunction/stay order"]
  },
  default: {
    summary: "Aapki samasya ko humne samajh liya hai. Prarambhik jaanch se lagta hai ki aapke maulik adhikaaron ka hanan ho raha hai.",
    law: "Constitution of India, Article 21",
    lawDesc: "Yeh article har nagrik ko life aur liberty ka adhikar deta hai.",
    steps: ["Consult a legal aid volunteer", "Document all evidence", "Visit the nearest legal aid help center"]
  }
};

// ==================== SUBMIT HANDLER ====================
submitBtn.addEventListener('click', () => {
  const text = inputArea.value.toLowerCase();
  if (text.trim() === '') {
    // Shake the input
    inputArea.style.animation = 'none';
    void inputArea.offsetWidth;
    inputArea.style.animation = 'shake 0.5s ease';
    return;
  }

  // Determine response
  let res = responses.default;
  if (text.includes('landlord') || text.includes('ghar') || text.includes('tenant') || text.includes('nikal') || text.includes('kiraya')) {
    res = responses.landlord;
  } else if (text.includes('salary') || text.includes('paisa') || text.includes('employer') || text.includes('pay') || text.includes('wages')) {
    res = responses.salary;
  } else if (text.includes('police') || text.includes('arrest') || text.includes('thana') || text.includes('jail')) {
    res = responses.police;
  } else if (text.includes('rti') || text.includes('information') || text.includes('jaankari') || text.includes('sarkari')) {
    res = responses.rti;
  } else if (text.includes('zameen') || text.includes('land') || text.includes('property') || text.includes('kabza') || text.includes('plot')) {
    res = responses.property;
  }

  // Show loading
  emptyState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  resultsState.classList.add('hidden');

  setTimeout(() => {
    // Populate results
    document.getElementById('result-summary').innerText = res.summary;
    document.getElementById('result-law').innerText = res.law;
    document.getElementById('result-law-desc').innerText = res.lawDesc;
    const stepsList = document.getElementById('result-steps');
    stepsList.innerHTML = res.steps.map(s => `<li>${s}</li>`).join('');

    loadingState.classList.add('hidden');
    resultsState.classList.remove('hidden');

    // Typewriter effect
    const summaryEl = document.getElementById('result-summary');
    const originalText = summaryEl.innerText;
    summaryEl.innerText = '';
    let i = 0;
    const interval = setInterval(() => {
      summaryEl.innerText += originalText[i];
      i++;
      if (i >= originalText.length) clearInterval(interval);
    }, 12);

    if (window.innerWidth <= 768) {
      resultsState.scrollIntoView({ behavior: 'smooth' });
    }
  }, 2500);
});

// ==================== TAB SWITCHING ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Change language hint
    const lang = btn.dataset.lang;
    const placeholders = {
      hindi: 'यहाँ अपनी समस्या लिखें...\nउदाहरण: मेरा मालिक मुझे बिना वजह निकाल रहा है',
      english: 'Describe your legal problem here...\nExample: My landlord is evicting me without notice',
      hinglish: 'Yahan apni samasya likhein...\nExample: Mera landlord mujhe bina wajah ghar se nikal raha hai'
    };
    inputArea.placeholder = placeholders[lang] || placeholders.hinglish;

    if (recognition) {
      recognition.lang = lang === 'hindi' ? 'hi-IN' : 'en-IN';
    }
  });
});

// ==================== FILE UPLOAD ====================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
if (dropZone && fileInput) {
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      dropZone.querySelector('p').textContent = `📎 ${e.target.files[0].name}`;
    }
  });
}

// ==================== SHAKE ANIMATION ====================
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);
