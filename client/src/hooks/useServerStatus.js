import { useState, useEffect } from 'react';

const useServerStatus = () => {
  const [isServerOnline, setIsServerOnline] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setIsServerOnline(true);
      } else {
        setIsServerOnline(false);
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setIsServerOnline(false);
    }
  };

  useEffect(() => {
    // التحقق من حالة السيرفر كل دقيقتين (120 ثانية)
    const interval = setInterval(checkServerStatus, 120000);
    
    // التحقق الأولي
    checkServerStatus();

    return () => clearInterval(interval);
  }, []);

  return { isServerOnline, checkServerStatus };
};

export default useServerStatus;