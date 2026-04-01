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

// ==================== TAB SWITCHING LOGIC ====================
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => {
      tc.style.display = 'none';
      tc.classList.remove('active');
    });

    // Add active to clicked
    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
    }

    // Reset output area
    emptyState.classList.remove('hidden');
    resultsState.classList.add('hidden');
    loadingState.classList.add('hidden');
  });
});

// ==================== FILE UPLOAD HANDLER ====================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
let selectedFile = null;

if (dropZone && fileInput) {
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      dropZone.querySelector('p').textContent = `📎 ${selectedFile.name}`;
      dropZone.style.borderColor = '#00ff88'; // Success green
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(255,184,0,0.15)';
  });
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(255,184,0,0.05)';
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(255,184,0,0.05)';
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      selectedFile = e.dataTransfer.files[0];
      dropZone.querySelector('p').textContent = `📎 ${selectedFile.name}`;
      dropZone.style.borderColor = '#00ff88';
    }
  });
}

// ==================== API HELPERS ====================
async function callAPI(endpoint, payload, isFormData = false) {
  const options = {
    method: 'POST',
  };

  if (isFormData) {
    options.body = payload; // browser sets multipart/form-data boundary automatically
  } else {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(`http://localhost:3000/api/${endpoint}`, options);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
}

function showLoading(text = "Teraaz AI soch raha hai...") {
  emptyState.classList.add('hidden');
  resultsState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  document.querySelector('#output-loading p').textContent = text;
}

function hideLoading() {
  loadingState.classList.add('hidden');
  resultsState.classList.remove('hidden');
}

const dynamicContainer = document.getElementById('results-dynamic-container');

// ==================== 1. RIGHTS & ROADMAP HANDLER ====================
const submitRightsBtn = document.getElementById('submit-rights-btn');
if (submitRightsBtn) {
  submitRightsBtn.addEventListener('click', async () => {
    const text = inputArea.value.trim();
    if (!text) {
      inputArea.style.animation = 'none';
      void inputArea.offsetWidth;
      inputArea.style.animation = 'shake 0.5s ease';
      return;
    }

    showLoading("Aapke Adhikaar aur Kanoon check ho rahe hain...");
    
    const uiLanguage = document.getElementById('ui-language').value || 'Hindi';

    // Parallel calls to Rights API and Roadmap API with language
    const [rightsRes, roadmapRes] = await Promise.all([
      callAPI('rights', { scenario: text, language: uiLanguage }),
      callAPI('roadmap', { issue: text, language: uiLanguage })
    ]);

    let html = '';

    // Rights Section
    if (!rightsRes.error) {
       html += `
         <section class="result-box bento-box" style="margin-bottom: 2rem;">
            <div class="section-label" style="color:#00ff88">YOUR RIGHTS</div>
            <div style="margin-top: 1rem; font-size: 1.2rem; line-height: 1.6;">${rightsRes.summary || "Analysis complete."}</div>
            
            <div style="margin-top: 1.5rem;">
               <div style="font-weight:700; color:var(--monolith-gold); margin-bottom: 0.5rem;">APPLICABLE LAWS:</div>
               ${rightsRes.laws ? rightsRes.laws.map(l => `
                  <div style="margin-bottom: 1rem; border-left: 2px solid var(--monolith-gold); padding-left: 1rem;">
                    <strong style="color:white">${l.name}</strong><br>
                    <span style="color:var(--text-mid); font-size:0.95rem;">${l.description}</span>
                  </div>
               `).join('') : ''}
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background:rgba(255,50,50,0.1); border-radius: 10px;">
               <strong style="color:#ff4444">ADVICE:</strong> ${rightsRes.advice || "Consult a lawyer immediately."}
            </div>
         </section>
       `;
    }

    // Roadmap Section
    if (!roadmapRes.error) {
       html += `
         <section class="result-box bento-box">
            <div class="section-label" style="color:#0099ff">ACTION ROADMAP</div>
            <div style="margin-top: 1rem;">
               <p><strong>Jurisdiction:</strong> ${roadmapRes.jurisdiction}</p>
               <p><strong>Timeline:</strong> ${roadmapRes.timeline} | <strong>Fees:</strong> ${roadmapRes.fees}</p>
            </div>
            
            <div style="margin-top: 1.5rem;">
               <div style="font-weight:700; color:#0099ff; margin-bottom: 0.5rem;">STEP-BY-STEP PLAN:</div>
               <ul style="list-style-type: none; padding-left: 0;">
                 ${roadmapRes.steps ? roadmapRes.steps.map(s => `
                    <li style="margin-bottom: 0.8rem; position: relative; padding-left: 1.5rem; color: var(--text-mid);">
                      <span style="position:absolute; left:0; color:#0099ff">▶</span> ${s}
                    </li>
                 `).join('') : ''}
               </ul>
            </div>
         </section>
       `;
    }

    if (html === '') {
       html = `<div style="color:red; text-align:center; padding: 2rem; border: 1px solid red; border-radius: 10px;">
          <strong>API Request Failed:</strong><br><br>
          ${rightsRes.message || roadmapRes.message || "Unknown error occurred."}
          <br><br>
          <span style="color: var(--text-mid); font-size: 0.9rem;">(If you see a '429 Quota Exceeded' error, your Google Gemini API Key has run out of its free limit. Please provide a new key or wait for the quota to reset.)</span>
       </div>`;
    }

    dynamicContainer.innerHTML = html;
    hideLoading();

    if (window.innerWidth <= 768) {
      resultsState.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ==================== 2. DOCUMENT ANALYSIS HANDLER ====================
const submitDocBtn = document.getElementById('submit-doc-btn');
if (submitDocBtn) {
  submitDocBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      alert("Please upload a PDF or Document first.");
      return;
    }

    showLoading("Parsing document clauses securely in-memory...");

    const formData = new FormData();
    formData.append('document', selectedFile);

    const docRes = await callAPI('document/analyze', formData, true);
    
    let html = '';
    if (!docRes.error) {
       const isSafe = docRes.safe_to_proceed;
       const safeColor = isSafe ? '#00ff88' : '#ff4444';
       const safeText = isSafe ? 'SAFE TO PROCEED' : 'DANGEROUS CLAUSES FOUND';

       html += `
         <section class="result-box bento-box">
            <div class="section-label" style="color:${safeColor}">${safeText}</div>
            <div style="margin-top: 1rem; font-size: 1.2rem; line-height: 1.6;">${docRes.summary}</div>
            
            <div style="margin-top: 2rem;">
               <div style="font-weight:700; color:#ff4444; margin-bottom: 1rem;">🚨 RED FLAGS IDENTIFIED:</div>
               ${docRes.red_flags && docRes.red_flags.length > 0 ? docRes.red_flags.map(r => `
                  <div style="margin-bottom: 1.5rem; border-left: 4px solid #ff4444; padding-left: 1rem; background:rgba(255,0,0,0.05); padding: 1rem; border-radius: 5px;">
                    <div style="font-family:monospace; color:var(--text-bright); margin-bottom:0.5rem;">" ${r.clause} "</div>
                    <div style="color:#ffaaAA; font-size:0.9rem; margin-bottom: 0.5rem;"><strong>Risk:</strong> ${r.reason}</div>
                    <div style="color:#00ff88; font-size:0.9rem;"><strong>Action:</strong> ${r.action}</div>
                  </div>
               `).join('') : '<p style="color:#00ff88">No major red flags detected.</p>'}
            </div>
         </section>
       `;
    } else {
       html = `<div style="color:red; text-align:center">Failed to parse document. File might be too large or unreadable.</div>`;
    }

    dynamicContainer.innerHTML = html;
    hideLoading();
  });
}

// ==================== 3. LEGAL DRAFTING HANDLER ====================
const submitDraftBtn = document.getElementById('submit-draft-btn');
if (submitDraftBtn) {
  submitDraftBtn.addEventListener('click', async () => {
    const type = document.getElementById('draft-type').value;
    const details = document.getElementById('draft-details').value.trim();

    if (!details) {
      alert("Please provide the basic details so we can draft the document.");
      return;
    }

    showLoading("Generating formal legal draft...");

    const payload = {
       type: type,
       details: { context: details }
    };

    const draftRes = await callAPI('drafting/generate', payload);
    
    if (!draftRes.error) {
       document.getElementById('draft-result-text').value = draftRes.content || draftRes.note;
       
       dynamicContainer.innerHTML = `
         <section class="result-box bento-box">
            <div class="section-label" style="color:var(--monolith-gold)">DRAFT READY</div>
            <p style="margin-top:1rem; color:var(--text-mid)">Your <strong>${type}</strong> is ready. Please review it carefully.</p>
            <button class="btn btn-primary btn-full" onclick="document.getElementById('drafting-modal').classList.add('active')" style="margin-top: 2rem;">RE-OPEN DOCUMENT</button>
         </section>
       `;
       
       // Auto-open modal
       document.getElementById('drafting-modal').classList.add('active');
    } else {
       dynamicContainer.innerHTML = `<div style="color:red; text-align:center">Failed to generate draft. ${draftRes.message || ''}</div>`;
    }
    
    hideLoading();
  });
}

// Modal handling for Drafts
const draftModal = document.getElementById('drafting-modal');
const closeDraft = document.getElementById('close-draft');
const copyDraft = document.getElementById('copy-draft-btn');
const downloadDraft = document.getElementById('download-draft-btn');

if (closeDraft) closeDraft.onclick = () => draftModal.classList.remove('active');

if (copyDraft) {
  copyDraft.onclick = () => {
    const text = document.getElementById('draft-result-text');
    text.select();
    document.execCommand('copy');
    copyDraft.textContent = "COPIED! ✔";
    setTimeout(() => { copyDraft.textContent = "COPY TO CLIPBOARD 📋"; }, 2000);
  };
}

if (downloadDraft) {
  downloadDraft.onclick = () => {
    const draftTypeRaw = document.getElementById('draft-type').value;
    const type = draftTypeRaw.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const text = document.getElementById('draft-result-text').value;

    if (!window.jspdf) {
        alert("PDF generator is still loading. Please try again in a second.");
        return;
    }
    
    // Setup jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Formatting
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const textLines = doc.splitTextToSize(text, pageWidth - margin * 2);
    
    let y = margin;
    
    // Simple Auto-Pagination
    for (let i = 0; i < textLines.length; i++) {
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.text(textLines[i], margin, y);
        y += 14; // Line height
    }
    
    doc.save(`teraaz_legal_${type}.pdf`);
    
    downloadDraft.textContent = "DOWNLOADED! ✔";
    setTimeout(() => { downloadDraft.innerHTML = "DOWNLOAD AS PDF ⬇️"; }, 2000);
  };
}

// ==========================================
// ADVANCED 5 FEATURES HANDLERS
// ==========================================

const submitJudgeBtn = document.getElementById('submit-judge-btn');
if (submitJudgeBtn) {
  submitJudgeBtn.addEventListener('click', async () => {
    const details = document.getElementById('judge-details').value.trim();
    if (!details) { alert("Please provide the dispute details."); return; }
    
    showLoading("Evaluating Evidence & Simulating Court Judgment...");
    const res = await callAPI('ai-judge/simulate', { dispute: details });
    
    if (!res.error) {
      const lawsHtml = res.applicable_laws.join(', ');
      const weakHtml = res.weak_points.map(w => "<li>" + w + "</li>").join('');
      
      dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:var(--monolith-gold)">⚖️ COURT SIMULATION VERDICT</div>
          <h2 style="color:var(--text-bright); margin-top:1rem; font-size: 2rem;">Likely Winner: ${res.verdict_prediction}</h2>
          <div style="font-size: 1.2rem; margin-top: 0.5rem; color: var(--text-mid);">Confidence: <strong style="color:var(--monolith-gold)">${res.confidence_score}</strong></div>
          
          <div style="margin-top: 1.5rem; background: rgba(255,184,0,0.05); padding: 1rem; border-radius: 10px; border: 1px solid var(--glass-border);">
            <strong style="color:var(--monolith-gold)">Applicable Laws:</strong><br/>
            ${lawsHtml}
          </div>
          
          <div style="margin-top: 1.5rem;">
            <strong style="color:var(--monolith-gold)">Court Reasoning:</strong><br/>
            <p style="color:var(--text-mid); margin-top:0.5rem;">${res.reasoning}</p>
          </div>
          
          <div style="margin-top: 1.5rem;">
            <strong style="color:#ff4444">Risk Factors (Weak Points):</strong><br/>
            <ul style="color:var(--text-mid); margin-top:0.5rem; padding-left:1rem;">
              ${weakHtml}
            </ul>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitSabootBtn = document.getElementById('submit-saboot-btn');
if (submitSabootBtn) {
  submitSabootBtn.addEventListener('click', async () => {
    const details = document.getElementById('saboot-details').value.trim();
    if (!details) { alert("Please list your evidence items."); return; }
    
    showLoading("Validating Evidence Admissibility (BSA)...");
    const res = await callAPI('evidence/check', { evidence: details });
    
    if (!res.error) {
       let itemsHtml = "";
       res.evidence_analysis.forEach(ev => {
          let color = ev.status === 'Green' ? '#00e676' : (ev.status === 'Yellow' ? '#ffea00' : '#ff1744');
          itemsHtml += "<div style='margin-top: 1rem; padding: 1rem; border-left: 4px solid " + color + "; background: rgba(255,255,255,0.02); border-radius: 6px;'>" +
              "<strong style='color:var(--text-bright)'>" + ev.item + "</strong>" +
              "<div style='color: " + color + "; font-size:0.9rem; margin-top:0.3rem;'>Admissible: " + ev.admissibility + "</div>" +
              "<div style='color:var(--text-mid); font-size:0.95rem; margin-top:0.5rem;'>" + ev.reason + "</div>" +
            "</div>";
       });

       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:var(--monolith-gold)">📜 EVIDENCE ANALYSIS REPORT</div>
          <div style="font-size: 1.2rem; margin-top: 1rem; color: var(--text-mid);">Overall Case Strength: <strong style="color:var(--text-bright)">${res.overall_strength}</strong></div>
          <div style="margin-top: 1.5rem;">
            ${itemsHtml}
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitCostBtn = document.getElementById('submit-cost-btn');
if (submitCostBtn) {
  submitCostBtn.addEventListener('click', async () => {
    const details = document.getElementById('cost-details').value.trim();
    if (!details) { alert("Please describe your case to get an estimate."); return; }
    
    showLoading("Calculating Legal Fees & Durations...");
    const res = await callAPI('cost/estimate', { details: details });
    
    if (!res.error) {
       let linesHtml = "";
       res.breakdown.forEach(b => {
           linesHtml += "<div style='display:flex; justify-content:space-between; margin-top:0.5rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.5rem;'><span>" + b.type + "</span> <strong>" + b.amount + "</strong></div>";
       });
       
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box" style="font-family: monospace;">
          <div class="section-label" style="color:var(--monolith-gold)">💰 FINANCIAL IMPACT ESTIMATE</div>
          
          <div style="background: rgba(0,0,0,0.5); padding: 2rem; border-radius: 10px; border: 1px dotted var(--monolith-gold); margin-top: 2rem; color:var(--text-bright);">
             <div style="text-align:center; font-size:1.5rem; margin-bottom: 2rem;">Total: ${res.estimated_total}</div>
             ${linesHtml}
             <div style="margin-top: 2rem; color:var(--monolith-gold)">
                > Lawyer Type Needed: ${res.lawyer_type}<br/>
                > ${res.timeline_warning}
             </div>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitNegotiationBtn = document.getElementById('submit-negotiation-btn');
if (submitNegotiationBtn) {
  submitNegotiationBtn.addEventListener('click', async () => {
    const details = document.getElementById('negotiate-details').value.trim();
    if (!details) { alert("Please provide the context for negotiation."); return; }
    
    showLoading("Generating Psychological Negotiation Strategy...");
    const res = await callAPI('negotiation/script', { context: details });
    
    if (!res.error) {
       let scriptHtml = "";
       res.script.forEach(s => {
          scriptHtml += "<div style='margin-top: 1rem; background: var(--bg-deep); padding: 1.5rem; border-radius: 10px; border-left: 3px solid var(--monolith-gold);'>" +
             "<div style='font-size: 0.8rem; letter-spacing: 1px; color: var(--text-dim); text-transform: uppercase;'>STEP: " + s.step + "</div>" +
             "<div style='font-size: 1.15rem; color: var(--text-bright); margin-top: 0.5rem; line-height: 1.5;'>\"" + s.dialogue + "\"</div>" +
          "</div>";
       });

       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:var(--monolith-gold)">🗣️ PRE-LITIGATION SETTLEMENT SCRIPT</div>
          <p style="color:var(--text-mid); margin-top:1rem;">Strategy: <strong>${res.strategy}</strong></p>
          <div style="margin-top: 2rem;">
            ${scriptHtml}
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitPilBtn = document.getElementById('submit-pil-btn');
if (submitPilBtn) {
  submitPilBtn.addEventListener('click', async () => {
    const details = document.getElementById('pil-details').value.trim();
    if (!details) { alert("Please describe the public issue."); return; }
    
    showLoading("Evaluating Constitutional Validity for PIL...");
    const res = await callAPI('pil/evaluate', { issue: details });
    
    if (!res.error) {
       const qualDisplay = res.qualifies ? "✓ Qualifies for PIL" : "✕ Unlikely to Qualify";
       const qualColor = res.qualifies ? '#00e676' : '#ff4444';
       const rightsHtml = res.affected_rights.join(', ');
       const stepsHtml = res.next_steps.map(s => "<li>" + s + "</li>").join('');
       
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:var(--monolith-gold)">🏛️ SUPREME COURT / HIGH COURT PIL TEST</div>
          
          <h2 style="color:${qualColor}; margin-top:1rem; font-size: 1.8rem;">
            ${qualDisplay}
          </h2>
          
          <div style="margin-top: 1.5rem; background: rgba(255,184,0,0.05); padding: 1rem; border-radius: 10px; border: 1px solid var(--glass-border);">
            <strong style="color:var(--monolith-gold)">Fundamental Rights Infringed:</strong><br/>
            <span style="color:var(--text-mid)">${rightsHtml}</span>
          </div>
          
          <div style="margin-top: 1.5rem;">
            <strong style="color:var(--monolith-gold)">Legal Argument Framing:</strong><br/>
            <p style="color:var(--text-mid); margin-top:0.5rem;">${res.petition_angle}</p>
          </div>
          
          <div style="margin-top: 1.5rem;">
            <strong style="color:var(--text-bright)">Required Action Plan:</strong><br/>
            <ul style="color:var(--text-mid); margin-top:0.5rem; padding-left:1rem;">
              ${stepsHtml}
            </ul>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

// ==========================================
// THE NEXT-GEN 5 FEATURES HANDLERS
// ==========================================

const submitKisanBtn = document.getElementById('submit-kisan-btn');
if (submitKisanBtn) {
  submitKisanBtn.addEventListener('click', async () => {
    const details = document.getElementById('kisan-details').value.trim();
    if (!details) { alert("Please provide agricultural dispute details."); return; }
    
    showLoading("Checking Fasal Bima & Agricultural Laws...");
    const res = await callAPI('kisan/analyze', { details: details });
    
    if (!res.error) {
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:#00ff88">👨‍🌾 KISAN TRACKER ANALYSIS</div>
          <h2 style="color:var(--monolith-gold); margin-top:1rem;">Category: ${res.category}</h2>
          <div style="margin-top: 1rem; color: var(--text-bright); font-size:1.1rem; line-height: 1.6;">${res.analysis}</div>
          
          <div style="margin-top: 1.5rem; background: rgba(0,255,136,0.05); padding: 1rem; border-left: 3px solid #00ff88;">
            <strong>Relevant Laws / Schemes:</strong><br/>
            ${res.laws.join(', ')}
          </div>
          
          <div style="margin-top: 1.5rem;">
            <strong style="color:var(--text-bright)">Immediate Action Plan:</strong><br/>
            <ul style="color:var(--text-mid); margin-top:0.5rem; padding-left:1.5rem;">
              ${res.action_plan.map(s => "<li>" + s + "</li>").join('')}
            </ul>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitTrafficBtn = document.getElementById('submit-traffic-btn');
if (submitTrafficBtn) {
  submitTrafficBtn.addEventListener('click', async () => {
    const details = document.getElementById('traffic-details').value.trim();
    if (!details) { alert("Please provide e-challan details."); return; }
    
    showLoading("Analyzing E-Challan Validity...");
    const res = await callAPI('traffic/analyze', { details: details });
    
    if (!res.error) {
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:var(--monolith-gold)">🚦 TRAFFIC CHALLAN ANALYZER</div>
          <h2 style="color:#ff4444; margin-top:1rem;">Violation: ${res.violation_type}</h2>
          <div style="margin-top: 1rem; color: var(--text-bright);">${res.validity_check}</div>
          
          <div style="margin-top: 1.5rem; color: var(--text-mid);">
            <strong>Applicable Sections:</strong> ${res.laws.join(', ')}
          </div>
          
          <div style="margin-top: 1.5rem; padding: 1rem; border: 1px dotted var(--monolith-gold);">
            <strong style="color:var(--monolith-gold)">Lok Adalat Negotiation Angle:</strong><br/>
            ${res.negotiation_angle}
          </div>
          
          <ul style="margin-top: 1.5rem; color:var(--text-mid); padding-left:1.5rem;">
            ${res.steps.map(s => "<li>" + s + "</li>").join('')}
          </ul>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitBailBtn = document.getElementById('submit-bail-btn');
if (submitBailBtn) {
  submitBailBtn.addEventListener('click', async () => {
    const details = document.getElementById('bail-details').value.trim();
    if (!details) { alert("Please provide incident/offense details."); return; }
    
    showLoading("Calculating Bail Eligibility (BNSS)...");
    const res = await callAPI('bail/calculate', { details: details });
    
    if (!res.error) {
       const isBailable = res.offense_classification.toLowerCase().includes('bailable');
       const color = isBailable ? '#00e676' : '#ff4444';
       
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:${color}">⚖️ ZAMANAT (BAIL) CALCULATOR</div>
          <h2 style="color:${color}; margin-top:1rem; font-size:2rem;">${res.offense_classification}</h2>
          <div style="color:var(--text-mid);">Severity: <strong>${res.severity}</strong></div>
          
          <div style="margin-top: 1.5rem; font-size:1.2rem; line-height:1.5; color:var(--text-bright);">
            ${res.bail_eligibility}
          </div>
          <div style="margin-top: 1rem; color:var(--text-mid);">${res.explanation}</div>
          
          <div style="margin-top: 1.5rem; background:rgba(255,255,255,0.05); padding:1rem;">
            <strong style="color:var(--monolith-gold)">Documents Needed for Bail Bond:</strong><br/>
            <ul style="margin-top:0.5rem; padding-left:1.5rem;">
              ${res.documents_needed.map(s => "<li>" + s + "</li>").join('')}
            </ul>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitMahilaBtn = document.getElementById('submit-mahila-btn');
if (submitMahilaBtn) {
  submitMahilaBtn.addEventListener('click', async () => {
    const details = document.getElementById('mahila-details').value.trim();
    if (!details) { alert("Please provide the situation details."); return; }
    
    showLoading("Activating Mahila Kavach Protocol...");
    const res = await callAPI('mahila/protect', { details: details });
    
    if (!res.error) {
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box" style="border-color: #ff4444;">
          <div class="section-label" style="color:#ff4444">🚺 MAHILA KAVACH RIGHTS DEFENDER</div>
          <div style="margin-top: 1rem;">
            <strong style="color:#ffaaAA">Rights Violated:</strong> ${res.rights_violated.join(', ')}<br/>
            <strong style="color:var(--text-mid)">Laws:</strong> ${res.laws.join(', ')}
          </div>
          
          <div style="margin-top: 1.5rem; background: rgba(255,0,0,0.1); padding: 1.5rem; border-left: 5px solid #ff4444; font-size: 1.2rem; line-height: 1.5;">
            <strong style="color:#ff4444">EMERGENCY ACTION:</strong><br/>
            ${res.immediate_action}
          </div>
          
          <div style="margin-top: 1.5rem; border: 1px dashed var(--monolith-gold); padding: 1rem;">
            <strong style="color:var(--monolith-gold)">Panic SOS Message Draft (Copy & Send):</strong><br/>
            <p style="margin-top:0.5rem; color:var(--text-bright); font-family:monospace;">${res.sos_message_draft}</p>
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

const submitYojanaBtn = document.getElementById('submit-yojana-btn');
if (submitYojanaBtn) {
  submitYojanaBtn.addEventListener('click', async () => {
    const details = document.getElementById('yojana-details').value.trim();
    if (!details) { alert("Please provide demographics."); return; }
    
    showLoading("Matching with State & Central Government Schemes...");
    const res = await callAPI('yojana/match', { details: details });
    
    if (!res.error) {
       let schemesHtml = "";
       res.matching_schemes.forEach(sc => {
          schemesHtml += `<div style="margin-top:1rem; padding:1rem; background:rgba(255,184,0,0.05); border-left:3px solid var(--monolith-gold);">
             <strong style="color:var(--monolith-gold); font-size:1.2rem;">${sc.name}</strong>
             <p style="color:var(--text-bright); font-size:0.95rem; margin-top:0.5rem;">${sc.description}</p>
             <div style="margin-top:0.5rem; color:#00ff88; font-size:0.9rem;">📍 Application: ${sc.how_to_apply}</div>
          </div>`;
       });
       
       dynamicContainer.innerHTML = `
        <section class="result-box bento-box">
          <div class="section-label" style="color:#00e676">💸 YOJANA (SCHEME) TRACKER</div>
          <h2 style="color:var(--text-bright); margin-top:1rem;">Eligibility: <span style="color:${res.eligible ? '#00e676' : '#ff4444'}">${res.eligible ? 'Matches Found' : 'No Immediate Match'}</span></h2>
          
          <div style="margin-top: 1.5rem;">
            ${schemesHtml}
          </div>
          
          <div style="margin-top: 1.5rem; color:#ffaaAA; font-size:0.9rem;">
            <strong>Note:</strong> ${res.warning}
          </div>
        </section>
      `;
    }
    hideLoading();
  });
}

// Removed old static tab switching code. The new tab logic is handled correctly at the top.

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
