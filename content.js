(() => {
 const feed = window.JobFastCapture.FacebookFeed;
 chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
  if (message.type === 'SCAN_STATUS') { sendResponse({ok:true,...feed.status}); return; }
  if (message.type === 'STOP_SCAN') { feed.stop(); sendResponse({ok:true}); return; }
  if (!['SCAN_JOBS','AUTO_SCAN_JOBS'].includes(message.type)) return;
  (async () => {
   try {
    if (!feed.isPage()) throw new Error('Open Facebook Feed or a Facebook Group');
    const jobs = message.type === 'AUTO_SCAN_JOBS' ? await feed.collectAll(message.options || {}) : feed.scanVisible(message.options || {});
    sendResponse({ok:true,jobs,debug:{pageType:'feed',total:jobs.length}});
   } catch(error) { sendResponse({ok:false,error:error.message}); }
  })();
  return true;
 });
})();
