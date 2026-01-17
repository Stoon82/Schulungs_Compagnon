import { useState, useEffect } from 'react';
import { QrCode, Copy, Share2, Check, X, Settings } from 'lucide-react';
import QRCode from 'qrcode';

function SessionQRCode({ sessionCode, isAdmin = true }) {
  const [showModal, setShowModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [accessUrl, setAccessUrl] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [detectingNgrok, setDetectingNgrok] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
    if (isAdmin) {
      fetchNgrokUrl();
    }
  }, [sessionCode]);

  useEffect(() => {
    if (showModal && isAdmin) {
      fetchNgrokUrl();
    }
  }, [showModal]);

  const fetchNgrokUrl = async () => {
    setDetectingNgrok(true);
    try {
      const response = await fetch('/api/ngrok/tunnel');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.tunnels && data.tunnels.length > 0) {
          const httpsTunnel = data.tunnels.find(t => t.proto === 'https');
          if (httpsTunnel) {
            const ngrokUrl = httpsTunnel.public_url;
            updateTunnelUrl(ngrokUrl);
          } else {
            const httpTunnel = data.tunnels.find(t => t.proto === 'http');
            if (httpTunnel) {
              updateTunnelUrl(httpTunnel.public_url);
            }
          }
        }
      }
    } catch (error) {
      console.log('Ngrok detection failed:', error.message);
    } finally {
      setDetectingNgrok(false);
    }
  };

  const generateQRCode = async () => {
    const savedTunnelUrl = localStorage.getItem('tunnel_url');
    const baseUrl = savedTunnelUrl || window.location.origin;
    
    // Create URL with session code as query parameter
    const url = `${baseUrl}?session=${sessionCode}`;
    
    setAccessUrl(url);
    setTunnelUrl(savedTunnelUrl || '');
    
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const updateTunnelUrl = (url) => {
    setTunnelUrl(url);
    if (url) {
      localStorage.setItem('tunnel_url', url);
    } else {
      localStorage.removeItem('tunnel_url');
    }
    generateQRCode();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Schulung beitreten',
          text: `Tritt der Schulung bei mit Code: ${sessionCode}`,
          url: accessUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to share:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40"
        title="QR-Code anzeigen"
      >
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12 rounded" />
        ) : (
          <QrCode size={48} className="text-white" />
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Sitzung teilen
                </h3>
                <p className="text-gray-400 text-sm">
                  QR-Code scannen oder Link teilen
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Session Code Display */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-6 border border-purple-500/30">
              <p className="text-sm text-gray-400 mb-2 text-center">Sitzungscode:</p>
              <p className="text-4xl font-bold text-white text-center tracking-widest">
                {sessionCode}
              </p>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="bg-white p-6 rounded-xl mb-6 shadow-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto mx-auto" />
                <p className="text-xs text-gray-600 text-center mt-3">
                  Scannen für automatischen Beitritt
                </p>
              </div>
            )}
            
            {/* Share Link */}
            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Link teilen:</p>
              <div className="flex items-center gap-2 mb-3">
                <p className="flex-1 text-sm font-mono text-white break-all bg-black/30 px-3 py-2 rounded border border-white/10">
                  {accessUrl}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span>Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Link kopieren</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 size={18} />
                  <span>Teilen</span>
                </button>
              </div>
            </div>

            {/* Admin Tunnel Settings */}
            {isAdmin && (
              <div className="bg-blue-500/10 rounded-lg p-4 mb-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Settings size={16} className="inline mr-2" />
                    Tunnel URL (Admin):
                  </label>
                  <button
                    onClick={fetchNgrokUrl}
                    disabled={detectingNgrok}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {detectingNgrok ? '🔄 Suche...' : '🔄 Auto-Detect'}
                  </button>
                </div>
                <input
                  type="text"
                  value={tunnelUrl}
                  onChange={(e) => updateTunnelUrl(e.target.value)}
                  placeholder="Auto-erkannt oder manuell eingeben"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                {tunnelUrl ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-2 mt-2">
                    <p className="text-xs text-green-400 font-medium">✅ Tunnel aktiv! QR-Code aktualisiert.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-400">⚠️ Localhost - Tunnel für mobilen Zugriff konfigurieren</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionQRCode;
