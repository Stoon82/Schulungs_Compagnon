import { useState, useEffect } from 'react';
import { QrCode, Settings, X, Copy, Share2, Check } from 'lucide-react';
import QRCode from 'qrcode';

function QRCodeButton({ isAdmin, sessionCode = null }) {
  const [showModal, setShowModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [accessUrl, setAccessUrl] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [detectingNgrok, setDetectingNgrok] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate QR code on mount for inline display
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
    
    // Add session code to URL if provided
    const url = sessionCode ? `${baseUrl}?session=${sessionCode}` : baseUrl;
    
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
      setAccessUrl(url);
    } else {
      localStorage.removeItem('tunnel_url');
      setAccessUrl(window.location.origin);
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
          title: sessionCode ? 'Join Training Session' : 'Join The Compagnon',
          text: sessionCode ? `Join with code: ${sessionCode}` : 'Join our training session!',
          url: accessUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to share:', error);
        }
      }
    } else {
      // Fallback to copy if share API not available
      handleCopyLink();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-all cursor-pointer border-2 border-cyan-500/30 hover:border-cyan-500/50"
        title="Click to share session"
      >
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Join the Session
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Scan this QR code or share the link below
            </p>
            
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-lg mx-auto block">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto" />
              </div>
            )}
            
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-2">Share this link:</p>
              <div className="flex items-center gap-2 mb-3">
                <p className="flex-1 text-sm font-mono text-gray-900 break-all bg-white px-3 py-2 rounded border border-gray-300">
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
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {isAdmin && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Settings size={16} className="inline mr-2" />
                    Tunnel URL (Admin Only):
                  </label>
                  <button
                    onClick={fetchNgrokUrl}
                    disabled={detectingNgrok}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {detectingNgrok ? '🔄 Detecting...' : '🔄 Auto-Detect'}
                  </button>
                </div>
                <input
                  type="text"
                  value={tunnelUrl}
                  onChange={(e) => updateTunnelUrl(e.target.value)}
                  placeholder="Auto-detected or enter manually"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
                {tunnelUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                    <p className="text-xs text-green-700 font-medium">✅ Tunnel active! QR code updated.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-700">⚠️ Using localhost - configure tunnel for mobile access</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default QRCodeButton;
