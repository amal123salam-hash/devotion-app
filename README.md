# ChristCounsel 🕊️

ChristCounsel is a premium full-stack spiritual guidance companion designed in custom modern styling. It integrates deep biblical wisdom, real-time audio devotions, active prayer scheduling, and live Christian media broadcasts directly with custom, comforting **Integrated AI Voice Assistance**.

---

## Key Features

1. **Integrated AI Voice Assistance**:
   * Simulates a soft, smooth, incredibly compassionate direct conversational experience (reflecting Jesus's caring spoken tone).
   * Fully limited to your specific shared concern or situation, always quoting appropriate Holy Scripture, explaining it with grace, and concluding with: *"Don't fear, I am with you."*
   * **Powered by Hugging Face Inference API** - no paid subscription required, get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)

2. **Sacred Live Streams & Media**:
   * Curated live feeds from globally prominent Christian broadcasters including Eucharistic Perpetual Adoration and Holy Mass links. It includes a custom modern video player optimized for YouTube integrations.

3. **Daily Scripture Promises**:
   * Categorized Bible databases covering peace, strength, anxiety, hope, and decision-making when the client-side/server-side neural systems have slow connection periods.

4. **Interactive Devotionals**:
   * Personal diary, notes logging, and customized scripture reminders with customizable local triggers.

---

## Directory Structure

```text
├── .github/workflows/          # Automated GitHub Actions
│   ├── deploy.yml              # GitHub Pages deployment with HF_API_KEY
│   └── node-ci.yml             # Automatic build and lint integration validation
├── src/
│   ├── assets/                 # Generated divine oil paintings & sacred icon images
│   ├── components/             # React View interfaces (HomeScreen, CounselScreen, MediaFeedScreen)
│   ├── data.ts                 # Devotional models and pre-seeded database
│   ├── types.ts                # TypeScript contracts and structures
│   └── main.tsx                # Client-side mounting
├── Dockerfile                  # Container building instructions
├── .dockerignore               # Optimizes builds by preventing local asset bloat
├── package.json                # Project dependencies and script runner
└── vite.config.ts              # Vite configurations
```

---

## Local Development Setup

To run or work on this application locally, ensure you have **Node.js (v20+)** installed, then complete these steps:

1. **Clone the Repository**:
   ```bash
   git clone <your-github-repo-url>
   cd devotion-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Secrets**:
   Create a `.env` file in the root directory:
   ```env
   VITE_HF_API_KEY=your_actual_hugging_face_api_key_here
   PORT=3000
   ```
   Get your free Hugging Face API key from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

4. **Boot the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000` to interact with the application.

---

## Deployment & Hosting

### 🐋 Container Deployment (Dockerfile)

A production-optimized, secure multi-stage `Dockerfile` is included in the root folder. You can build and deploy the container locally or directly to cloud platforms like GCP Cloud Run:

1. **Build Container Image**:
   ```bash
   docker build -t christ-counsel:latest .
   ```

2. **Run Container Locally**:
   ```bash
   docker run -p 3000:3000 --env VITE_HF_API_KEY="your-hf-api-key" christ-counsel:latest
   ```

### 🌐 GitHub Pages Deployment

The project includes automated GitHub Pages deployment via `.github/workflows/deploy.yml`. To deploy:

1. Push to `main` or `master` branch
2. Add your `HF_API_KEY` as a GitHub repository secret (`Settings` → `Secrets and variables` → `Actions` → `New repository secret`)
3. The workflow will automatically build and deploy to GitHub Pages

---

## API Configuration

### Hugging Face API Key (Required for Counsel Screen)

The Counsel Screen uses the Hugging Face Inference API (free tier available) with the `google/flan-t5-base` model to generate compassionate pastoral responses.

1. Get your spiritual concerns
2. Get your free API key: https://huggingface.co/settings/tokens (create a token with "Read" access)
3. Add to your environment:
   - **Local**: Add `VITE_HF_API_KEY` to `.env`
   - **GitHub Pages**: Add `HF_API_KEY` as a repository secret
   - **Docker**: Pass as `--env VITE_HF_API_KEY="your-key"` or in docker-compose

### API Usage
- Model: `google/flan-t5-base` (instruction-tuned, ~250M params)
- Free tier: 30,000 requests/month
- No credit card required for free tier

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Speech**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **AI**: Hugging Face Inference API (google/flan-t5-base)
- **Deployment**: GitHub Pages / Docker / Cloud Run

---

## Credits

Built with love for the Body of Christ 🕊️

> *"My sheep hear my voice, and I know them, and they follow me."* — John 10:27