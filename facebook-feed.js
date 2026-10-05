(() => {
  const App = window.JobFastCapture, S = App.Shared;
  const MESSAGE = '[data-ad-rendering-role="story_message"], [data-ad-preview="message"], [data-ad-comet-preview="message"]';
  const Feed = { running: false, stopped: false, status: { running: false, scanned: 0, found: 0 } };
  Feed.isPage = () => /^(www\.)?facebook\.com$/.test(location.hostname);
  function posts() {
    const candidates = [...document.querySelectorAll('[role="feed"] [aria-posinset], [role="feed"] [role="article"], [role="main"] [role="article"]')];
    for (const message of document.querySelectorAll(MESSAGE)) {
      const card = message.closest('[aria-posinset], [role="article"]');
      if (card) candidates.push(card);
    }
    return [...new Set(candidates)].filter(n => n.querySelector(MESSAGE) && !candidates.some(p => p !== n && p.contains(n) && p.querySelector(MESSAGE)));
  }
  function url(raw) { try { return new URL(raw, location.href); } catch { return null; } }
  function permalink(post) {
    for (const a of post.querySelectorAll('a[href]')) {
      const u = url(a.getAttribute('href')); if (!u || !/(^|\.)facebook\.com$/.test(u.hostname)) continue;
      const match = u.pathname.match(/\/groups\/([^/]+)\/(?:posts|permalink)\/([^/]+)/);
      if (match) return `https://www.facebook.com/groups/${match[1]}/posts/${match[2]}/`;
      if (/\/posts\/[^/]+/.test(u.pathname)) return `https://www.facebook.com${u.pathname}`;
      if (u.searchParams.has('story_fbid')) return `https://www.facebook.com/permalink.php?story_fbid=${encodeURIComponent(u.searchParams.get('story_fbid'))}&id=${encodeURIComponent(u.searchParams.get('id') || '')}`;
      const gm = (u.searchParams.get('set') || '').match(/^gm\.(\d+)/);
      const group = u.searchParams.get('idorvanity') || location.pathname.match(/\/groups\/([^/]+)/)?.[1];
      if (gm && group) return `https://www.facebook.com/groups/${group}/posts/${gm[1]}/`;
    }
    return null;
  }
  function author(post) {
    const nameNode = post.querySelector('[data-ad-rendering-role="profile_name"]');
    const a = nameNode?.closest('a[href]') || nameNode?.querySelector('a[href]') || post.querySelector('h2 a[href], h3 a[href], strong a[href]');
    const u = url(a?.getAttribute('href'));
    let profileUrl = null;
    if (u) {
      const id = u.pathname.match(/\/groups\/[^/]+\/user\/(\d+)/)?.[1];
      profileUrl = id ? `https://www.facebook.com/profile.php?id=${id}` : `https://www.facebook.com${u.pathname}${u.pathname === '/profile.php' ? '?id=' + (u.searchParams.get('id') || '') : ''}`;
    }
    return {name: S.textOf(nameNode || a) || null, profileUrl};
  }
  function body(post) { return S.textOf(post.querySelector(MESSAGE)); }
  function parse(post, allPosts = false) {
    const text = body(post); if (!text) return null;
    if (!globalThis.EmployerFilter.isEmployerPost(text)) return null;
    const by = author(post), link = permalink(post);
    const id = link?.match(/\/posts\/(\d+)/)?.[1] || (link ? new URL(link).searchParams.get('story_fbid') : null);
    const externalId = id || `text-${S.hashString((by.profileUrl || by.name || '') + '|' + text)}`;
    const emails = S.unique(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []);
    const phones = S.unique(text.match(/(?:\+66[ -]?|0)[2-9](?:[ -]?\d){7,8}\b/g) || []);
    const contacts = S.unique([...emails, ...phones, ...(text.match(/(?:line\s*(?:id)?\s*[:：@]\s*[^\s,;]+|https?:\/\/line\.me\/[^\s]+)/gi) || [])]);
    const imageUrls = S.unique([...post.querySelectorAll('img')].filter(img => !img.closest('[role="article"]') || img.closest('[role="article"]') === post || post.getAttribute('aria-posinset')).filter(img => !/profile|avatar|รูปโปรไฟล์/i.test(img.alt || '') && ((img.naturalWidth || img.width || Number(img.getAttribute('width'))) > 80)).map(img => img.currentSrc || img.src).filter(src => /^https?:/.test(src)));
    const title = text.split(/\n/).find(line => /developer|engineer|programmer|backend|frontend|full.?stack|รับสมัคร|ตำแหน่ง/i.test(line)) || text.split(/\n/)[0];
    return {source:'facebook', pageType:'feed', externalId, title:title.slice(0,220), company:null, location:null,
      salaryText:S.extractSalary(text) || text.match(/[\d,]+\s*[-–]\s*[\d,]+\s*บาท/)?.[0] || null,
      postedBy:by.name, posterProfileUrl:by.profileUrl,
      dmContact:by.profileUrl ? {type:'facebook_dm',name:by.name,profileUrl:by.profileUrl} : null,
      contractText:text.match(/(?:contract|สัญญาจ้าง|งานสัญญา)[^\n]{0,100}/i)?.[0] || null,
      emails, contacts, imageUrls, description:text, requirements:S.extractRequirements(text), technologies:S.extractTechnologies(text),
      jobUrl:link || location.href.split('?')[0], postedAt:S.extractPostedAt(post)};
  }
  Feed.scanVisible = (options = {}) => posts().map(p => parse(p, options.allPosts)).filter(Boolean);
  Feed.stop = () => { Feed.stopped = true; };
  Feed.collectAll = async (options = {}) => {
    if (Feed.running) throw new Error('Scan is already running');
    Feed.running = true; Feed.stopped = false;
    Feed.status = {running:true,scanned:0,found:0};
    const found = new Map(), seen = new Set(); let stale = 0;
    try {
      for (let round = 0; round < Math.min(200, options.maxRounds || 40) && !Feed.stopped; round++) {
        const cards = posts(); const before = seen.size;
        for (const card of cards) {
          if (Feed.stopped) break;
          if (!card.isConnected) continue;
          const message = card.querySelector(MESSAGE);
          if (!message) continue;
          const more = [...message.querySelectorAll('[role="button"],button')].find(b => /^(see more|ดูเพิ่มเติม|แสดงเพิ่มเติม)$/i.test(S.textOf(b)));
          if (more) { more.click(); await S.sleep(250); }
          if (!card.isConnected || !card.querySelector(MESSAGE)) continue;
          const key = permalink(card) || ((author(card).profileUrl || '') + '|' + body(card));
          seen.add(key);
          const job = parse(card, options.allPosts); if (job) found.set(job.externalId,job);
        }
        if (found.size) {
          const result = await chrome.runtime.sendMessage({type:'SAVE_JOBS',jobs:[...found.values()]});
          if (!result?.ok) throw new Error(result?.error || 'Cannot save posts');
        }
        Feed.status = {running:true,scanned:seen.size,found:found.size,round:round+1};
        stale = seen.size === before ? stale+1 : 0;
        if (stale >= 5 || Feed.stopped) break;
        cards.at(-1)?.scrollIntoView({block:'end',behavior:'instant'});
        window.scrollBy({top:Math.max(500,window.innerHeight*0.8),behavior:'instant'});
        await S.sleep(1400);
      }
      // Runs in the tab, so closing the popup does not interrupt capture or API sending.
      const state = await chrome.storage.local.get({autoSend:false,endpoint:'http://localhost:3000/api/jobs/import'});
      if (state.autoSend && found.size) {
        const sent = await chrome.runtime.sendMessage({type:'SEND_API',endpoint:state.endpoint,jobs:[...found.values()]});
        if (!sent?.ok) throw new Error(sent?.error || 'API send failed');
      }
      return [...found.values()];
    } finally { Feed.running=false; Feed.status.running=false; }
  };
  App.FacebookFeed = Feed;
})();
