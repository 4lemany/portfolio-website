import os
import sys
import json
import asyncio
import datetime
import subprocess
import urllib.request
import urllib.error

# Top voices for Spanish (Spain)
VOICE_ALVARO = "es-ES-AlvaroNeural"
VOICE_ELVIRA = "es-ES-ElviraNeural"

def fetch_top_weekly_papers(limit=6):
    """
    Fetches papers from Hugging Face Daily Papers API across the last 7 days,
    deduplicates them, and picks the top-voted papers.
    """
    print(" Fetching top papers from Hugging Face Daily Papers API...")
    papers_by_id = {}
    today = datetime.date.today()

    for i in range(7):
        target_date = today - datetime.timedelta(days=i)
        date_str = target_date.strftime("%Y-%m-%d")
        url = f"https://huggingface.co/api/daily_papers?date={date_str}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WeeklyDigestBot/1.0", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if isinstance(data, list):
                        for item in data:
                            p = item.get("paper", {})
                            pid = p.get("id")
                            if pid and pid not in papers_by_id:
                                papers_by_id[pid] = {
                                    "id": pid,
                                    "title": p.get("title", "Untitled"),
                                    "summary": p.get("summary", ""),
                                    "upvotes": p.get("upvotes", 0),
                                    "authors": [a.get("name", "") for a in p.get("authors", [])][:4],
                                    "publishedAt": p.get("publishedAt", date_str),
                                    "hfUrl": f"https://huggingface.co/papers/{pid}",
                                    "pdfUrl": f"https://arxiv.org/pdf/{pid}.pdf",
                                    "githubRepo": p.get("githubRepo")
                                }
        except Exception as e:
            print(f" Warning fetching date {date_str}: {e}")

    all_papers = list(papers_by_id.values())
    if not all_papers:
        # Fallback to direct latest endpoint
        try:
            url = "https://huggingface.co/api/daily_papers"
            req = urllib.request.Request(url, headers={"User-Agent": "WeeklyDigestBot/1.0", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode('utf-8'))
                for item in data:
                    p = item.get("paper", {})
                    pid = p.get("id")
                    if pid and pid not in papers_by_id:
                        papers_by_id[pid] = {
                            "id": pid,
                            "title": p.get("title", "Untitled"),
                            "summary": p.get("summary", ""),
                            "upvotes": p.get("upvotes", 0),
                            "authors": [a.get("name", "") for a in p.get("authors", [])][:4],
                            "publishedAt": p.get("publishedAt", today.strftime("%Y-%m-%d")),
                            "hfUrl": f"https://huggingface.co/papers/{pid}",
                            "pdfUrl": f"https://arxiv.org/pdf/{pid}.pdf",
                            "githubRepo": p.get("githubRepo")
                        }
        except Exception as e:
            print(f" Error fetching default latest: {e}")

    sorted_papers = sorted(papers_by_id.values(), key=lambda x: x.get("upvotes", 0), reverse=True)
    top_papers = sorted_papers[:limit]
    print(f" Retrieved {len(top_papers)} top-voted papers from this week.")
    return top_papers


def call_gemini_api(api_key, papers):
    """
    Calls Gemini API with the top papers to generate the podcast dialogue
    and slide summaries in European Spanish (Spain).
    """
    print(" Calling Gemini API to generate podcast script and slides in Spanish (Spain)...")
    
    # Candidate models in order of priority: Gemini 3.8 and Gemini 4 Argon
    candidate_models = ["gemini-3.8-flash", "gemini-4-argon", "gemini-3.8-pro"]
    
    system_prompt = (
        "Eres el director de un programa divulgativo de inteligencia artificial y ciencia en España, "
        "al más puro estilo 'Audio Overview' de NotebookLM. Dos investigadores españoles (Álvaro y Elvira) "
        "analizan con entusiasmo, humor sutil y gran rigor técnico los papers más votados de la semana en Hugging Face.\n\n"
        "Reglas obligatorias:\n"
        "1. Idioma: Español de España (castellano natural, con expresiones habituales como '¡ojo a esto!', 'brutal', 'una vuelta de tuerca', 'totalmente de acuerdo', 'vamos al grano', etc.).\n"
        "2. El podcast debe ser fluido, como una charla real entre colegas en una cafetería de una universidad o centro de investigación, evitando sonar a lectura robótica.\n"
        "3. Debes generar un JSON VÁLIDO con la estructura exacta especificada."
    )

    papers_text = ""
    for idx, p in enumerate(papers, 1):
        papers_text += (
            f"Paper #{idx}:\n"
            f"- Título: {p['title']}\n"
            f"- Votos en HF: {p['upvotes']}\n"
            f"- Autores: {', '.join(p['authors'])}\n"
            f"- Resumen: {p['summary']}\n\n"
        )

    user_prompt = f"""
Analiza estos {len(papers)} papers más votados de la semana en Hugging Face:

{papers_text}

Genera un objeto JSON ESTRICTO (sin explicaciones adicionales antes ni después) con la siguiente estructura exacta:
{{
  "weekTitle": "Título llamativo para el resumen de la semana (ej. 'Semana 42: La revolución de los agentes y la destilación de razonamiento')",
  "dateRange": "Rango de fechas de los últimos 7 días",
  "introduction": "Breve párrafo introductorio para la web sobre qué tendencias han dominado la comunidad esta semana.",
  "podcast": [
    {{
      "speaker": "Álvaro",
      "text": "Texto del diálogo..."
    }},
    {{
      "speaker": "Elvira",
      "text": "Texto del diálogo..."
    }}
  ],
  "slides": [
    {{
      "slideNumber": 1,
      "title": "Título de la diapositiva",
      "paperId": "ID del paper correspondiente",
      "paperTitle": "Título del paper",
      "keyPoints": [
        "Punto clave 1...",
        "Punto clave 2...",
        "Punto clave 3..."
      ],
      "takeaway": "Frase de conclusión de por qué este paper es relevante."
    }}
  ]
}}

El diálogo del podcast debe tener entre 10 y 16 turnos de conversación en total (5-8 por locutor), cubriendo los aspectos más sorprendentes de los papers.
"""

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.7,
            "maxOutputTokens": 4000
        }
    }

    req_data = json.dumps(payload).encode("utf-8")

    custom_model = os.environ.get("GEMINI_MODEL")
    candidate_models = ["gemini-3.8-flash", "gemini-4-argon", "gemini-3.8-pro", "gemini-4"]
    if custom_model:
        clean_model = custom_model.replace("models/", "").strip()
        models = [clean_model] + [m for m in candidate_models if m != clean_model]
    else:
        models = candidate_models

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            print(f" Attempting with model {model}...")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=90) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Remove markdown fences if model returned them
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                parsed = json.loads(raw_text.strip())
                print(f" Success with model {model}!")
                return parsed
        except urllib.error.HTTPError as http_err:
            try:
                err_details = http_err.read().decode("utf-8", errors="ignore")
                print(f" Model {model} failed (HTTP {http_err.code}): {err_details}")
            except Exception:
                print(f" Model {model} failed (HTTP {http_err.code}): {http_err}")
        except Exception as e:
            print(f" Model {model} failed: {e}")

    raise RuntimeError("Failed to generate content with all candidate Gemini models.")


async def generate_speech_for_dialogue(podcast_items, output_mp3_path):
    """
    Uses edge-tts to synthesize audio for each speaker with Spain Spanish neural voices,
    then combines them into a single podcast mp3 file.
    """
    try:
        import edge_tts
    except ImportError:
        print(" Error: edge-tts is not installed. Run `pip install edge-tts`")
        return False

    temp_dir = os.path.join(os.path.dirname(output_mp3_path), "_temp_audio_chunks")
    os.makedirs(temp_dir, exist_ok=True)
    chunk_files = []

    print(f" Generating audio with edge-tts ({len(podcast_items)} dialogue turns)...")
    try:
        for idx, item in enumerate(podcast_items):
            speaker = item.get("speaker", "Álvaro")
            text = item.get("text", "")
            voice = VOICE_ALVARO if "alvaro" in speaker.lower() else VOICE_ELVIRA

            chunk_filename = os.path.join(temp_dir, f"chunk_{idx:03d}.mp3")
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(chunk_filename)
            chunk_files.append(chunk_filename)

        print(" Stitching audio chunks together into single podcast MP3...")
        
        # Check if ffmpeg is available
        has_ffmpeg = False
        try:
            subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            has_ffmpeg = True
        except Exception:
            has_ffmpeg = False

        if has_ffmpeg:
            concat_list_file = os.path.join(temp_dir, "concat.txt")
            with open(concat_list_file, "w", encoding="utf-8") as f:
                for chunk in chunk_files:
                    # Escape paths for ffmpeg concat
                    safe_path = chunk.replace("\\", "/")
                    f.write(f"file '{safe_path}'\n")

            cmd = [
                "ffmpeg", "-y", "-f", "concat", "-safe", "0",
                "-i", concat_list_file,
                "-c", "copy",
                output_mp3_path
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            # Fallback direct binary concatenate for MP3 stream
            with open(output_mp3_path, "wb") as outfile:
                for chunk in chunk_files:
                    with open(chunk, "rb") as infile:
                        outfile.write(infile.read())

        print(f" Podcast audio successfully generated: {output_mp3_path}")
        return True
    finally:
        # Cleanup temp chunks
        for chunk in chunk_files:
            try:
                if os.path.exists(chunk):
                    os.remove(chunk)
            except Exception:
                pass
        concat_list = os.path.join(temp_dir, "concat.txt")
        if os.path.exists(concat_list):
            try:
                os.remove(concat_list)
            except Exception:
                pass
        try:
            os.rmdir(temp_dir)
        except Exception:
            pass


def main():
    api_key = (
        os.environ.get("GEMINI_API_KEY") or
        os.environ.get("GOOGLE_API_KEY") or
        os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
    )
    if not api_key:
        print(" Error: GEMINI_API_KEY environment variable is required.")
        sys.exit(1)

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_digest_dir = os.path.join(repo_root, "public", "digest")
    src_data_dir = os.path.join(repo_root, "src", "data")
    os.makedirs(public_digest_dir, exist_ok=True)
    os.makedirs(src_data_dir, exist_ok=True)

    # 1. Fetch top papers of the week
    papers = fetch_top_weekly_papers(limit=6)
    if not papers:
        print(" No papers found to process. Exiting.")
        sys.exit(1)

    # 2. Generate script and slides via Gemini
    digest_content = call_gemini_api(api_key, papers)

    # 3. Add paper metadata to the final digest
    digest_content["generatedAt"] = datetime.datetime.now().isoformat()
    digest_content["audioUrl"] = "/digest/weekly_podcast.mp3"
    digest_content["papers"] = papers

    # 4. Synthesize Audio
    output_mp3 = os.path.join(public_digest_dir, "weekly_podcast.mp3")
    podcast_items = digest_content.get("podcast", [])
    
    if podcast_items:
        try:
            asyncio.run(generate_speech_for_dialogue(podcast_items, output_mp3))
        except Exception as e:
            print(f" Warning: Audio synthesis encountered an issue: {e}")

    # 5. Save digest JSON
    public_json_path = os.path.join(public_digest_dir, "digest.json")
    src_json_path = os.path.join(src_data_dir, "weekly_digest.json")

    with open(public_json_path, "w", encoding="utf-8") as f:
        json.dump(digest_content, f, ensure_ascii=False, indent=2)

    with open(src_json_path, "w", encoding="utf-8") as f:
        json.dump(digest_content, f, ensure_ascii=False, indent=2)

    print(" Weekly digest generated successfully!")
    print(f" JSON saved to: {public_json_path} and {src_json_path}")


if __name__ == "__main__":
    main()
