# Super Code Learner 🔮

Super Code Learner is an interactive React (TypeScript + Vite) web application that transmutes dry programming syntax into epic educational fantasy/sci-fi narratives. It makes understanding code structures, algorithms, recursion, and API calls highly engaging by casting them as characters, quests, and kingdoms.

This project is fully ready for deployment on **Vercel** and local execution.

---

## 🌟 Key Features

1. **AI Transmutation Spell**: Feed any programming code (JavaScript, Python, C++, SQL, etc.) or choose from our preloaded library. The system queries OpenRouter's `liquid/lfm-2.5-1.2b-thinking:free` reasoning model to build a full story world.
2. **Interactive Code Chamber (Code-to-Story Mapping)**:
   - Line-by-line highlighting in the editor showing exactly which lines of code correspond to the active narrative chapter.
   - Hovering over a character in the "Guild of Characters" instantly highlights their corresponding variable/function inside the code view!
3. **Procedural Ambient Soundtrack Synthesizer**: Built using the native **Web Audio API** (requires no external MP3 loading). Generates three procedural soundscapes:
   - 🌟 *Fantasy Portal* (slow, mystical chord progressions using sine & triangle oscillators)
   - 💻 *Cyber Grid* (plucky minor-pentatonic retro chiptune arpeggios)
   - 🛸 *Cosmic Void* (deep-space binaural beats and sweeping oscillators with random star blips)
4. **Vocal Narrator**: Integrated Web Speech API narrator that reads the stories aloud in a customizable voice.
5. **Dungeon Trial Challenges (Interactive Quizzes)**: Reinforces your understanding at the end of each story with multiple-choice challenge questions, instant logic checks, and custom rank titles (e.g. *Grand Magus of Code*).
6. **Spellbook of Thoughts**: Displays the AI model's hidden thoughts and logic-parsing steps in an expandable drawer, allowing you to see the AI's internal reasoning.

---

## 🛠️ Tech Stack
- **Core**: React 18, TypeScript (TSX)
- **Bundler**: Vite 5
- **Icons**: Lucide React
- **Aesthetics**: Glassmorphic custom CSS (Vanilla)

---

## 🚀 Running Locally

Since Node.js was not detected in your command PATH, you will need to install Node.js (version 18+ recommended) before running it locally. Once Node.js is installed, follow these commands:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The server will start on [http://localhost:3000](http://localhost:3000) and automatically open in your default browser.*

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## ☁️ Vercel Deployment

The application is fully configured for deployment on Vercel:
1. **Option A (GitHub)**:
   - Push this workspace folder to a GitHub repository.
   - Import the repository into the [Vercel Dashboard](https://vercel.com).
   - Vercel will auto-detect the Vite framework and configure the deployment commands (`npm run build` and output directory `dist`) automatically.

2. **Option B (Vercel CLI)**:
   - Run:
     ```bash
     npm i -g vercel
     vercel
     ```
   - Follow the interactive prompts to link and deploy the project directly from your computer.
