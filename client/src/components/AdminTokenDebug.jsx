import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Debug component to check admin authentication status
 * Add this temporarily to your admin interface to verify token
 */
function AdminTokenDebug() {
  const [tokenInfo, setTokenInfo] = useState({});

  useEffect(() => {
    const checkToken = () => {
      const adminToken = api.getAdminToken();
      const sessionToken = localStorage.getItem('sessionToken');
      
      setTokenInfo({
        hasAdminToken: !!adminToken,
        adminTokenLength: adminToken ? adminToken.length : 0,
        hasSessionToken: !!sessionToken,
        adminTokenPreview: adminToken ? `${adminToken.substring(0, 8)}...` : 'none'
      });
    };

    checkToken();
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-white/20 text-xs font-mono z-50">
      <div className="font-bold mb-2">Admin Auth Debug</div>
      <div>Admin Token: {tokenInfo.hasAdminToken ? '✅' : '❌'}</div>
      <div>Token Preview: {tokenInfo.adminTokenPreview}</div>
      <div>Session Token: {tokenInfo.hasSessionToken ? '✅' : '❌'}</div>
    </div>
  );
}

export default AdminTokenDebug;
