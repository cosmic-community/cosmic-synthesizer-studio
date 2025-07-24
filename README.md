# 🎵 Cosmic Synthesizer Studio

![App Preview](https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=300&fit=crop&auto=format)

A powerful web-based synthesizer and music production platform with recording capabilities, effects processing, drum sequencing, and social media sharing. Create professional-quality music directly in your browser with real-time audio processing and cloud-based preset storage.

## ✨ Features

- 🎹 **Advanced Synthesizer Engine** - Multi-oscillator synth with customizable waveforms
- 🎛️ **Professional Effects Rack** - Reverb, delay, filter, distortion, and chorus
- 🥁 **16-Step Drum Sequencer** - Create complex rhythmic patterns
- 🎵 **Multi-track Recording** - Record, layer, and playback compositions
- 📱 **Social Media Sharing** - Share tracks to Twitter, Facebook, and more
- ☁️ **Cloud Preset Storage** - Save and sync synthesizer patches via Cosmic
- 🎚️ **Real-time Audio Visualization** - Waveform displays and level meters
- 🎧 **Low-latency Audio** - Professional-grade Web Audio API implementation

## Clone this Bucket and Code Repository

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Bucket and Code Repository](https://img.shields.io/badge/Clone%20this%20Bucket-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmic-staging.com/projects/new?clone_bucket=68828e632601bea8834abf62&clone_repository=6882902f2601bea8834abf64)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Build a synthesizer app where I can play music with a synthesizer and add various effects. I also want to be able to record a song and play it back or share it to social media. I also want to be able to add drum beats to my song.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Web Audio API** - Professional audio processing
- **Tailwind CSS** - Modern styling framework
- **Cosmic CMS** - Content management and preset storage
- **Canvas API** - Real-time audio visualization
- **Web Share API** - Native social media integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser with Web Audio API support

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Cosmic credentials to `.env.local`:
   ```
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎵 Cosmic SDK Examples

### Save Synthesizer Preset
```typescript
const preset = await cosmic.objects.insertOne({
  type: 'presets',
  title: 'My Awesome Synth',
  metadata: {
    oscillator_type: 'sawtooth',
    filter_cutoff: 1000,
    envelope_attack: 0.1,
    envelope_decay: 0.3,
    envelope_sustain: 0.7,
    envelope_release: 0.5,
    effects: ['reverb', 'delay']
  }
})
```

### Save Recording
```typescript
const recording = await cosmic.objects.insertOne({
  type: 'recordings',
  title: 'My Track',
  metadata: {
    duration: 120.5,
    bpm: 128,
    audio_data: audioBlob,
    social_shares: 0,
    tags: ['electronic', 'ambient']
  }
})
```

## ⚙️ Cosmic CMS Integration

The synthesizer integrates with Cosmic to provide:

- **Preset Management** - Save and load synthesizer configurations
- **Recording Storage** - Store audio recordings and metadata
- **User Compositions** - Track creation history and sharing stats
- **Effect Chains** - Store custom effect combinations
- **Drum Patterns** - Save and share rhythm sequences

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Netlify
1. Build the project: `bun run build`
2. Upload the `out` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Environment Variables
Set these in your deployment platform:
- `COSMIC_BUCKET_SLUG`
- `COSMIC_READ_KEY`
- `COSMIC_WRITE_KEY`

<!-- README_END -->