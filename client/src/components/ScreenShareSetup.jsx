import { useState, useRef, useEffect } from 'react';
import { Monitor, MonitorOff, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react';

/**
 * ScreenShareSetup Component
 * Screen sharing and webcam controls for presentations
 */
function ScreenShareSetup({ socket, sessionId }) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState('screen');
  const [quality, setQuality] = useState('medium');
  
  const screenStreamRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScreenShare();
      stopWebcam();
    };
  }, []);

  const startScreenShare = async () => {
    try {
      const displayMediaOptions = {
        video: {
          cursor: 'always',
          displaySurface: selectedScreen,
          width: quality === 'high' ? 1920 : quality === 'medium' ? 1280 : 640,
          height: quality === 'high' ? 1080 : quality === 'medium' ? 720 : 480,
          frameRate: quality === 'high' ? 30 : 15
        },
        audio: isMicOn
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      screenStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Emit to other participants via socket
      if (socket && sessionId) {
        socket.emit('screen-share:start', {
          sessionId,
          quality
        });
      }

      setIsScreenSharing(true);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Error starting screen share:', err);
      alert('Fehler beim Starten der Bildschirmfreigabe: ' + err.message);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (socket && sessionId) {
      socket.emit('screen-share:stop', { sessionId });
    }

    setIsScreenSharing(false);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: isMicOn
      });

      webcamStreamRef.current = stream;

      if (socket && sessionId) {
        socket.emit('webcam:start', { sessionId });
      }

      setIsWebcamOn(true);

    } catch (err) {
      console.error('Error starting webcam:', err);
      alert('Fehler beim Starten der Webcam: ' + err.message);
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }

    if (socket && sessionId) {
      socket.emit('webcam:stop', { sessionId });
    }

    setIsWebcamOn(false);
  };

  const toggleMic = async () => {
    if (isMicOn) {
      // Mute
      if (screenStreamRef.current) {
        screenStreamRef.current.getAudioTracks().forEach(track => track.enabled = false);
      }
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getAudioTracks().forEach(track => track.enabled = false);
      }
      setIsMicOn(false);
    } else {
      // Unmute
      if (screenStreamRef.current) {
        screenStreamRef.current.getAudioTracks().forEach(track => track.enabled = true);
      }
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getAudioTracks().forEach(track => track.enabled = true);
      }
      setIsMicOn(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Monitor className="text-blue-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">Bildschirmfreigabe</h2>
          <p className="text-sm text-gray-400">
            Teilen Sie Ihren Bildschirm mit den Teilnehmern
          </p>
        </div>
      </div>

      {/* Preview */}
      {isScreenSharing && (
        <div className="mb-6 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Settings */}
      {!isScreenSharing && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Quelle auswählen
            </label>
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="screen">Gesamter Bildschirm</option>
              <option value="window">Anwendungsfenster</option>
              <option value="browser">Browser-Tab</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Qualität
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="low">Niedrig (640x480, 15fps)</option>
              <option value="medium">Mittel (1280x720, 15fps)</option>
              <option value="high">Hoch (1920x1080, 30fps)</option>
            </select>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isScreenSharing
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
          }`}
        >
          {isScreenSharing ? (
            <>
              <MonitorOff size={20} />
              Stoppen
            </>
          ) : (
            <>
              <Monitor size={20} />
              Teilen
            </>
          )}
        </button>

        <button
          onClick={isWebcamOn ? stopWebcam : startWebcam}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isWebcamOn
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isWebcamOn ? (
            <>
              <Video size={20} />
              Webcam An
            </>
          ) : (
            <>
              <VideoOff size={20} />
              Webcam
            </>
          )}
        </button>

        <button
          onClick={toggleMic}
          className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isMicOn
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {isMicOn ? (
            <>
              <Mic size={20} />
              Mikro An
            </>
          ) : (
            <>
              <MicOff size={20} />
              Mikro
            </>
          )}
        </button>

        <button
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
        >
          <Settings size={20} />
          Einstellungen
        </button>
      </div>

      {/* Status */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className={`p-3 rounded-lg ${isScreenSharing ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 border border-white/10'}`}>
          <Monitor className={`mx-auto mb-2 ${isScreenSharing ? 'text-blue-400' : 'text-gray-500'}`} size={24} />
          <p className="text-xs text-gray-400">Bildschirm</p>
          <p className={`text-sm font-semibold ${isScreenSharing ? 'text-blue-400' : 'text-gray-500'}`}>
            {isScreenSharing ? 'Aktiv' : 'Inaktiv'}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isWebcamOn ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}`}>
          <Video className={`mx-auto mb-2 ${isWebcamOn ? 'text-green-400' : 'text-gray-500'}`} size={24} />
          <p className="text-xs text-gray-400">Webcam</p>
          <p className={`text-sm font-semibold ${isWebcamOn ? 'text-green-400' : 'text-gray-500'}`}>
            {isWebcamOn ? 'Aktiv' : 'Inaktiv'}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isMicOn ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5 border border-white/10'}`}>
          <Mic className={`mx-auto mb-2 ${isMicOn ? 'text-green-400' : 'text-gray-500'}`} size={24} />
          <p className="text-xs text-gray-400">Mikrofon</p>
          <p className={`text-sm font-semibold ${isMicOn ? 'text-green-400' : 'text-gray-500'}`}>
            {isMicOn ? 'Aktiv' : 'Inaktiv'}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>💡 Hinweis:</strong> Die Bildschirmfreigabe wird in Echtzeit an alle Teilnehmer
          übertragen. Stellen Sie sicher, dass Sie keine sensiblen Informationen teilen.
        </p>
      </div>
    </div>
  );
}

export default ScreenShareSetup;
