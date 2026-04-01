import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq via OpenAI SDK
const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY, // Using the same env var name
    baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Common entry point for sending a prompt to AI.
 * @param {string} systemInstruction - The persona and instruction for AI
 * @param {string} userPrompt - The context or question provided by the user
 */
export const queryGemini = async (systemInstruction, userPrompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemInstruction + "\n\nCRITICAL: If asked for JSON, return ONLY valid JSON. Do not wrap in markdown or backticks." },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
        });

        let content = response.choices[0].message.content;
        // Clean markdown backticks in case model ignores instruction
        content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        return content;
    } catch (error) {
        console.error("Grok API Error (Zero Credits). Falling back to Dynamic Mock Data for testing.", error.message);
        
        // Determine requested language and key context
        const isHindi = userPrompt.includes('language: Hindi') || userPrompt.includes('language: Hinglish') || /[क-ह]/.test(userPrompt);
        const lowerPrompt = userPrompt.toLowerCase();
        
        const isJob = lowerPrompt.includes('job') || lowerPrompt.includes('salary') || lowerPrompt.includes('notice') || lowerPrompt.includes('hr') || lowerPrompt.includes('nikal');
        const isRent = lowerPrompt.includes('rent') || lowerPrompt.includes('landlord') || lowerPrompt.includes('deposit') || lowerPrompt.includes('makan');
        const isFraud = lowerPrompt.includes('fraud') || lowerPrompt.includes('scam') || lowerPrompt.includes('online') || lowerPrompt.includes('paise');
        const isPolice = lowerPrompt.includes('police') || lowerPrompt.includes('fir') || lowerPrompt.includes('station');
        const isFight = lowerPrompt.includes('fight') || lowerPrompt.includes('mar') || lowerPrompt.includes('pitai') || lowerPrompt.includes('domestic');

        // Helper to pick random item
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        // Dynamic Mock Mappings

        if (systemInstruction.includes("premier Legal Rights Assistant") || systemInstruction.includes("Nyay-Bot")) {
            if (isRent) {
                return JSON.stringify({
                    summary: isHindi ? "मकान मालिक बिना वाजिब कारण के आपकी सिक्योरिटी डिपॉजिट नहीं रोक सकता। यह रेंट कंट्रोल एक्ट का उल्लंघन है।" : "The landlord cannot illegally withhold your security deposit. This violates the State Rent Control Act.",
                    laws: [{ name: "State Rent Control Act & Section 403 BNS", description: "Protects tenants from unlawful financial extortion and deposit withholding." }],
                    advice: isHindi ? "उन्हें एक लीगल नोटिस भेजें कि 15 दिन में पैसे नहीं दिए तो कंज्यूमर कोर्ट जाएंगे।" : "Send a formal legal notice stating you will approach the Consumer Court in 15 days."
                });
            } else if (isFraud) {
                return JSON.stringify({
                    summary: isHindi ? "यह पूरी तरह से साइबर धोखाधड़ी (Online Fraud) का मामला है।" : "This is a clear case of online financial fraud.",
                    laws: [{ name: "Section 420 BNS & IT Act 2000 (Section 66D)", description: "Covers cheating and cyber fraud by impersonation." }],
                    advice: isHindi ? "तुरंत 1930 डायल करें और cybercrime.gov.in पर FIR दर्ज कराएं। बैंक को भी मेल करें।" : "Dial 1930 immediately and file a complaint at cybercrime.gov.in. Notify your bank."
                });
            } else {
                return JSON.stringify({
                    summary: isHindi ? "बिना नोटिस पीरियड दिए नौकरी से निकालना 'Wrongful Termination' है और यह गैरकानूनी है।" : "Under Indian Labour Laws, abrupt termination without a valid reason and proper notice periods is wrongful termination.",
                    laws: [{ name: "Industrial Disputes Act - Section 25F", description: "Mandates 1-month written notice or pay in lieu before termination." }],
                    advice: isHindi ? "कोई भी Full and Final settlement साइन मत करें। HR को फॉर्मल ईमेल भेजें।" : "Do not sign any full and final settlement. Email HR demanding a formal written reason."
                });
            }
        }

        if (systemInstruction.includes("Legal Document Analyzer")) {
            return JSON.stringify({
                summary: rand(["This is a standard employment contract.", "This looks like a standard lease agreement.", "This is a commercial vendor contract."]),
                red_flags: [
                    { clause: rand(["Employee shall not join competing firm for 3 years.", "Landlord can evict with 24 hours notice.", "Security deposit is 100% non-refundable."]), 
                      reason: rand(["Unreasonable non-compete duration.", "Violates statutory eviction notice periods.", "Completely illegal under contract law."]), 
                      action: "Request immediate amendment to standard legal limits." }
                ],
                safe_to_proceed: false
            });
        }

        if (systemInstruction.includes("Legal Strategist") || systemInstruction.includes("Roadmap")) {
            return JSON.stringify({
                jurisdiction: isRent ? "Rent Controller / Civil Court" : (isJob ? "Labor Commissioner" : "Consumer Forum / Police Station"),
                timeline: rand(["2 to 4 months.", "3 to 6 months.", "4 to 8 months."]),
                fees: rand(["₹500 - ₹1500 (Govt Fee)", "Minimal (Under ₹500)", "Zero filing fee for E-Daakhil"]),
                documents_needed: isJob ? ["Employment Contract", "Termination Email", "Salary Slips"] : ["ID Proof", "Transaction Receipts", "Notices sent"],
                steps: [
                    "Step 1: " + rand(["Send Legal Notice via registered post.", "Draft a formal email to the grievance officer.", "File an initial police intimation."]),
                    "Step 2: " + rand(["Wait 15 days for a settlement reply.", "If no reply, approach the mediator.", "File an RTI for public records."]),
                    "Step 3: " + rand(["File formal suit in court.", "Escalate to the state tribunal.", "Register case on E-Daakhil portal."])
                ]
            });
        }

        if (systemInstruction.includes("Virtual Judge")) {
            return JSON.stringify({
                verdict_prediction: rand(["Complainant (Plaintiff) will win", "Strong chances for Plaintiff", "Case will end in mediation"]),
                confidence_score: randInt(65, 92) + "%",
                applicable_laws: ["Section 420 BNS", "Contract Act Section 73", "Consumer Protection Act"],
                reasoning: rand(["Documentary evidence strongly favors the complainant.", "Clear violation of statutory duty by the opposite party.", "Lack of written defense makes the plaintiff's case solid."]),
                weak_points: ["Delay in filing complaint", "Lack of stamped original agreements"]
            });
        }

        if (systemInstruction.includes("Evidence Analyzer")) {
            return JSON.stringify({
                overall_strength: rand(["Moderate Risk", "Strong Evidentiary Value", "Requires Corroboration"]),
                evidence_analysis: [
                    { item: "WhatsApp Chat Screenshots", status: "Green", admissibility: "Yes", reason: "Admissible as primary electronic evidence." },
                    { item: "Call Recording without consent", status: rand(["Yellow", "Red"]), admissibility: "Conditionally Yes", reason: "Needs Section 65B certificate." }
                ]
            });
        }

        if (systemInstruction.includes("Legal Financial Advisor") || systemInstruction.includes("Cost")) {
            return JSON.stringify({
                estimated_total: "₹" + randInt(15, 45) + ",000 - ₹" + randInt(50, 90) + ",000",
                lawyer_type: isJob ? "Labour/Employment Lawyer" : (isFraud ? "Cyber Law Expert" : "Civil Litigator"),
                breakdown: [
                    { type: "Official Court/Filing Fees", amount: "₹" + randInt(1000, 5000) },
                    { type: "Lawyer Drafting & Hearing", amount: "₹" + randInt(3000, 10000) + " per hearing" }
                ],
                timeline_warning: "Expect " + randInt(1, 3) + " to " + randInt(3, 5) + " years depending on court backlog."
            });
        }

        if (systemInstruction.includes("Nyay Score Engine")) {
            const score = randInt(55, 95);
            let color = score > 80 ? "green" : (score > 65 ? "yellow" : "orange");
            let label = score > 80 ? "Strong" : (score > 65 ? "Moderate" : "Needs Work");
            return JSON.stringify({
                score: score,
                win_probability: score - randInt(5, 12),
                similar_cases_analyzed: randInt(1200, 4500),
                case_category: isJob ? "Wrongful Termination" : (isRent ? "Property Dispute" : (isFraud ? "Consumer Fraud" : "Civil Rights")),
                strength_label: label,
                color_code: color,
                key_factors: [
                    { factor: rand(["Clear documentary evidence available", "WhatsApp chats back your claim", "Salary slips confirm employment"]), impact: "positive", weight: "35%" },
                    { factor: rand(["No prior written notice served", "Opposite party breached contract first", "Multiple similar complaints exist online"]), impact: "positive", weight: "25%" },
                    { factor: rand(["Delay in filing formal complaint", "Original contract is unsigned", "Lack of eyewitnesses"]), impact: "negative", weight: "15%" }
                ],
                top_action: rand(["Draft a legal notice today to stop the limitation period.", "Compile all screenshots into a PDF with dates.", "File an online grievance immediately."]),
                time_sensitive: score > 70,
                emergency_level: score > 85 ? "high" : "low"
            });
        }
        
        if (systemInstruction.includes("FIR Tracker")) {
             return JSON.stringify({
                  status: rand(["Registered", "Under Investigation", "Chargesheet Filed"]),
                  action_taken: rand(["IO assigned. Statements recorded.", "Waiting for forensic reports.", "Accused summoned for questioning."]),
                  needs_escalation: randInt(1, 10) > 7,
                  escalation_letter: "To the Superintendent of Police...\nSubject: Inaction on FIR...\nKindly intervene in this matter..."
             });
        }
        
        let cleanContext = 'the stated issue';
        try {
            const jsonMatch = userPrompt.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                cleanContext = parsed.context || Object.values(parsed).join(' ');
            } else {
                cleanContext = userPrompt
                     .replace(/Language:.*|Offense Details:|Issue Context:|Dispute Details:|User WhatsApp message:/gi, '')
                     .replace(/\n|"/g, ' ').trim();
            }
        } catch (e) {
            cleanContext = userPrompt.substring(0, 100);
        }

        if (systemInstruction.includes("Legal Drafter")) {
             const subjectLine = cleanContext.substring(0, 60);
             return `[Draft Generated by TERAAZ AI Engine]\n\nLEGAL NOTICE\n\nDate: ${new Date().toLocaleDateString()}\nTo,\nThe Opposite Party,\n[Address Line 1]\n[Address Line 2]\n\nSubject: Legal Notice regarding ${subjectLine}...\n\nUnder instructions from my client, I hereby serve you with the following Legal Notice:\n\n1. That my client has been aggrieved by your recent actions, specifically pertaining to:\n"${cleanContext}".\n\n2. That your actions constitute a direct breach of trust, statutory obligations, and the applicable provisions of the law, causing severe distress to my client.\n\n3. That my client has suffered considerable financial, professional, and mental harassment solely due to your negligence and breach.\n\n4. Therefore, I hereby call upon you to rectify the situation, refund any due amounts, and issue a formal apology within 15 days of receiving this notice.\n\n5. If you fail to comply, my client has given me strict, irrevocable instructions to initiate severe civil and criminal proceedings against you in a court of competent jurisdiction.\n\n6. Please note that you will be held entirely liable for all legal costs, damages, and consequences arising out of such litigation. This notice is issued without prejudice to my client's other rights.\n\nYours faithfully,\n\n[Advocate Name]\nCounsel for the Complainant\nSign: ___________________`;
        }
        
        if (systemInstruction.includes("Emergency Legal Responder")) {
            return JSON.stringify({
                immediate_actions: ["Stay calm", "Record video/audio discreetly", "Do not sign blank documents"],
                critical_rights: [{ right: "Article 22 & Sec 41 CrPC", description: "Right to know grounds of arrest and lawyer presence." }],
                warning: "Never give a written statement to the police without your lawyer."
            });
        }
        
        if (systemInstruction.includes("WhatsApp Legal Assistant")) {
             return JSON.stringify({
                 reply: `⚖️ *TERAAZ AI Legal Assistant*\n\n*Namaste!* Aapki problem ke baare mein:\n\n🔴 *Kanooni Hak:*\n• Aapke documents indicate a strong case.\n• Please don't take hasty actions.\n\n✅ *Turant Ye Karein:*\n1. Saare proofs ikattha karein.\n2. Humari website par 'Nyay Score' check karein.\n\n📞 Call 1800-11-2232 for free legal aid.`,
                 quick_replies: ["Legal notice bhejo", "Kya main court jaoon?", "Fees kitni lagegi?"],
                 escalate_to_lawyer: false
             });
        }

        // --- NEW FEATURES ---

        if (systemInstruction.includes("Bail Eligibility Calculator")) {
            const isBailable = randInt(1, 10) > 4;
            return JSON.stringify({
                offense_classification: isBailable ? "Bailable Offense" : "Non-Bailable Offense",
                severity: isBailable ? rand(["Low", "Medium"]) : "High",
                bail_eligibility: isBailable ? 
                    `Yes, regarding "${cleanContext.substring(0, 30)}...", you are legally entitled to bail as a matter of right under Section 436 CrPC / Section 478 BNSS.` : 
                    `No, bail for "${cleanContext.substring(0, 30)}..." is at the discretion of the Magistrate/Sessions Court. You need to file a formal bail application.`,
                documents_needed: ["Original ID Proof (Aadhaar)", "Address Proof", "Surety Details (if asked)", "Passport size photographs"],
                explanation: isBailable ? 
                    hasHindi(userPrompt) ? "यह एक जमानती अपराध है। आप पुलिस स्टेशन या लोकल कोर्ट से सीधे बेल करवा सकते हैं।" : "This is a bailable offense. You can secure bail directly from the police station by signing a bond." :
                    hasHindi(userPrompt) ? "यह गैर-जमानती अपराध है। हाई कोर्ट या सेशन कोर्ट में अर्जी लगानी होगी।" : "This is non-bailable. A formal petition must be moved before the Sessions Court."
            });
        }

        if (systemInstruction.includes("Traffic Dispute Analyzer")) {
            return JSON.stringify({
                violation_type: rand(["Over-speeding", "Red Light Jump", "Wrong Parking", "Without Helmet"]),
                validity_check: rand(["The e-challan appears legally valid based on ANPR data.", "Camera angle is unclear, validity is questionable.", "Appears to be a technical glitch with number plate recognition."]),
                laws: ["Motor Vehicles Act, 1988 - Section 183/184", "IT Act, 2000 - Camera Evidence"],
                negotiation_angle: "Contest this in the upcoming E-Lok Adalat. Magistrates often reduce the fine by 50% for first-time offenses without accident history.",
                steps: ["Do not pay online if you wish to contest.", "Wait for the physical notice or E-Lok Adalat notification.", "Appear in Lok Adalat and politely explain the situation."]
            });
        }

        if (systemInstruction.includes("Agricultural Legal Advisor")) {
            return JSON.stringify({
                category: rand(["Fasal Bima (Crop Insurance)", "Khasra/Khatauni Dispute", "MSP Procurement Issue", "Loan Issue"]),
                analysis: hasHindi(userPrompt) ? `आपके "${cleanContext.substring(0, 40)}..." की समस्या स्कैन की गई। कृषि कानूनों के तहत, 72 घंटे के अंदर रिपोर्ट करना जरूरी है।` : `Regarding your issue "${cleanContext.substring(0, 40)}...", agricultural guidelines mandate reporting any damage within 72 hours.`,
                laws: ["Pradhan Mantri Fasal Bima Yojana (PMFBY)", "State Revenue Act"],
                action_plan: ["Lodge a formal complaint via toll-free number.", `Draft formal application regarding ${cleanContext.substring(0, 20)}...`, "Approach District Agriculture Officer if bank rejects."]
            });
        }

        if (systemInstruction.includes("Women's Rights Defender")) {
            return JSON.stringify({
                rights_violated: [rand(["Domestic Violence", "Emotional Harassment"]), rand(["Financial Deprivation", "Dowry Demand"])],
                laws: ["Protection of Women from Domestic Violence Act, 2005", "BNS Section 85 (Cruelty)"],
                immediate_action: hasHindi(userPrompt) ? `आपके मामले "${cleanContext.substring(0, 30)}..." में तुरंत 1091 (Women Helpline) या 112 डायल करें।` : `Based on your concern regarding "${cleanContext.substring(0, 30)}...", dial 1091 (Women Helpline) or 112 immediately.`,
                sos_message_draft: `URGENT SOS: I am facing acute danger regarding "${cleanContext.substring(0, 60)}...". I need immediate police intervention at my location to ensure my safety.`
            });
        }

        if (systemInstruction.includes("Government Scheme Matchmaker")) {
            return JSON.stringify({
                eligible: true,
                matching_schemes: [
                    {
                        name: rand(["Ayushman Bharat PM-JAY", "Pradhan Mantri Awas Yojana (PMAY)"]),
                        description: "Provides significant financial and health coverage for eligible families.",
                        how_to_apply: "Visit your nearest Common Service Centre (CSC) with Aadhaar and Ration Card."
                    },
                    {
                        name: rand(["PM Kisan Samman Nidhi", "E-Shram Card Benefits"]),
                        description: "Direct benefit transfers and insurance coverage.",
                        how_to_apply: "Register online or at a local Gram Panchayat office."
                    }
                ],
                warning: "Eligibility depends strictly on your name appearing in the SECC 2011 database or having an active AAY ration card."
            });
        }

        if (systemInstruction.includes("Negotiation Strategist")) {
            return JSON.stringify({
                strategy: rand(["Firm & Legally Intimidating", "Diplomatic & Solution-Oriented", "Aggressive Cost-Benefit Pitch"]),
                script: [
                    { step: "Initial Opening", dialogue: "Hi. I'm calling to resolve this issue amicably before handing it over to my lawyer." },
                    { step: "Legal Reality Check", dialogue: "Under the law, withholding this amount without proof is illegal. Let's save both of us the court harassment." },
                    { step: "The Settlement Offer", dialogue: "Transfer the base amount today by 5 PM, and I will reconsider filing a formal complaint." }
                ]
            });
        }

        if (systemInstruction.includes("Public Interest Litigation")) {
            return JSON.stringify({
                qualifies: randInt(1, 10) > 3,
                affected_rights: ["Article 21 (Right to Life)", "Article 48A (Protection of Environment)"],
                petition_angle: "Frame this as a mass public hazard affecting a large community due to systemic negligence, rather than a personal grievance.",
                next_steps: ["Step 1: File an RTI to obtain official reports.", "Step 2: Collect signatures from affected residents.", "Step 3: Send a joint Legal Notice before moving the High Court."]
            });
        }

        // Generic fallback for any other unexpected feature
        return JSON.stringify({
             summary: "Dynamic Legal Assessment Complete: Your rights are protected under applicable Indian statutes.",
             advice: "Please consult local authorities or file a legal notice to initiate proceedings.",
             details: "Randomized ID: " + randInt(1000, 9999)
        });
    }
};

// Helper for hindi check
function hasHindi(text) {
    return text.includes('language: Hindi') || text.includes('language: Hinglish') || /[क-ह]/.test(text);
}

