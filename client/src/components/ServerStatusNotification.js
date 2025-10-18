import React from 'react';
import useServerStatus from '../hooks/useServerStatus';

const ServerStatusNotification = () => {
  const { isServerOnline, checkServerStatus } = useServerStatus();

  if (isServerOnline) {
    return null; // لا نعرض شيئاً إذا كان السيرفر يعمل
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-300 rounded-full mr-3 animate-pulse"></div>
          <span className="font-medium">
            ⚠️ انقطع الاتصال مع السيرفر - يتم إعادة المحاولة...
          </span>
        </div>
        <button
          onClick={checkServerStatus}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
};

export default ServerStatusNotification;