# Q-Music App 🎵

A decentralized music platform built on the QORTAL blockchain network.

## 🎯 Overview

Q-Music is a Web3 music application that allows users to discover, publish, and organize music in a truly decentralized environment. Built with React and integrated with the QORTAL blockchain, it provides a censorship-resistant platform for music sharing and discovery.

## ✨ Features

### 🎵 Music Publishing
- **Upload & Publish**: Upload audio files directly to the QORTAL network
- **Metadata Support**: Add artist information, titles, and descriptions
- **Thumbnail Support**: Optional cover art for your tracks
- **Decentralized Storage**: All content stored on QDN (QORTAL Data Network)

### 📋 Playlist Management
- **Create Playlists**: Organize your favorite tracks into custom playlists
- **Decentralized Playlists**: Playlists are stored on the blockchain
- **Share & Discover**: Browse playlists created by other users
- **No Overwriting**: Each playlist gets a unique identifier

### 🔍 Music Discovery
- **Browse All Songs**: Explore all music published on the network
- **Browse Playlists**: Discover playlists created by the community
- **Homepage Feed**: See the latest releases and playlists
- **Search & Filter**: Find music by various criteria

### 🎧 Audio Player
- **Built-in Player**: Integrated audio player with standard controls
- **Persistent Player**: Player stays fixed at the bottom of the screen
- **Queue Management**: Add songs to play queue
- **Responsive Design**: Works on both desktop and mobile

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS3 with responsive design
- **Blockchain**: QORTAL Network integration
- **Storage**: QDN (QORTAL Data Network)
- **API**: QORTAL Core API
- **Audio**: Web Audio API

## 🏗️ Architecture

### Smart Identifier System
- Songs: `qmusic_track_${title}_${randomCode}`
- Playlists: `qmusic_playlist_${title}_${randomCode}`
- Each item gets a unique 8-character random code ensuring no conflicts

### API Integration
- Uses QORTAL's `SEARCH_QDN_RESOURCES` for content discovery
- `PUBLISH_MULTIPLE_QDN_RESOURCES` for content publishing
- Supports both AUDIO and PLAYLIST services
- Metadata stored with descriptions and thumbnails

### Data Structure
```javascript
// Song Structure
{
  name: "publisher_name",
  service: "AUDIO", 
  identifier: "qmusic_track_title_ABC123XY",
  title: "Song Title",
  description: "artist=Artist Name",
  file: audioFile
}

// Playlist Structure  
{
  name: "creator_name",
  service: "PLAYLIST",
  identifier: "qmusic_playlist_name_DEF456ZW", 
  title: "Playlist Name",
  data64: "base64_encoded_playlist_data"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- QORTAL Core running locally or access to QORTAL UI
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/iffinland/qmusic-app.git

# Navigate to project directory
cd qmusic-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### QORTAL Integration
This app requires the QORTAL Core API to function. It can be run:
- Inside the QORTAL UI (recommended)
- With QORTAL Core running locally
- Connected to a QORTAL gateway

## 📱 Usage

1. **Connect**: Ensure QORTAL connection is active
2. **Login**: Use your QORTAL credentials
3. **Publish Music**: Upload audio files with metadata
4. **Create Playlists**: Organize tracks into playlists
5. **Discover**: Browse music published by the community
6. **Enjoy**: Stream music directly in the browser

## 🔐 Decentralization Benefits

- **No Central Authority**: No single point of failure
- **Censorship Resistant**: Content cannot be arbitrarily removed
- **User Owned**: You control your own content and data
- **Transparent**: All transactions visible on blockchain
- **Immutable**: Published content is permanently preserved

## 🤝 Contributing

This is an open-source project. Contributions are welcome! Please feel free to:
- Report bugs
- Suggest features  
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source. Please check the license file for details.

## 🔗 Links

- **QORTAL**: [qortal.org](https://qortal.org)
- **QDN Documentation**: QORTAL Data Network docs
- **Community**: Join the QORTAL community for support

## 🎵 About

Q-Music represents the future of decentralized music distribution. By leveraging blockchain technology, it creates a platform where artists and listeners can interact directly without intermediaries, ensuring fair compensation and creative freedom.

---

*Built with ❤️ for the decentralized music community*

