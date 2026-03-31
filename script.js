let sV = [];
const c = document.getElementById('rows-container');
const l = document.getElementById('loader');
const mod = document.getElementById('modal');
const modB = document.getElementById('modal-body');

const topIds = ['tt0111161', 'tt0068646', 'tt0468569', 'tt0137523', 'tt1375666', 'tt0109830', 'tt1345836', 'tt0816692', 'tt0110912', 'tt0076759', 'tt0167260', 'tt0120737'];
const trendIds = ['tt1535483', 'tt15239678', 'tt1160419', 'tt10872600', 'tt1877830', 'tt11003518', 'tt12411924', 'tt14548482', 'tt4425200', 'tt9362722'];
const animeIds = ['tt0409591', 'tt0877057', 'tt2560140', 'tt0450892', 'tt11003518', 'tt0417299', 'tt0388629', 'tt0983216', 'tt2293922', 'tt0440621'];
// MARVEL PINNED LIST (V4): High-quality, main saga movies ONLY. No One-Shots, No BTS.
const marvelIds = [
    'tt0371746', // Iron Man (2008)
    'tt6443346', // Black Widow (2021)
    'tt0848228', // The Avengers (2012)
    'tt4154664', // Infinity War (2018)
    'tt4154756', // Endgame (2019)
    'tt2395427', // Age of Ultron (2015)
    'tt0458339', // Captain America (2011)
    'tt2473801', // Thor: Ragnarok (2017)
    'tt1825683', // Black Panther (2018)
    'tt2015381', // Guardians (2014)
    'tt2250912', // Spider-Man Homecoming (2017)
    'tt12891538' // Black Panther Wakanda Forever (2022)
];

const cats = [
    { n: 'Top Masterpieces', ids: topIds },
    { n: 'Trending Now', ids: trendIds },
    { n: 'Japanese Anime', ids: animeIds },
    { n: 'Marvel Universe', ids: marvelIds },
    { n: 'US TV Shows', q: 'Friends', t: 'series' },
    { n: 'Star Wars Saga', q: 'Star Wars', t: 'movie' },
    { n: 'Indian Movies', q: 'India', t: 'movie' },
    { n: 'Action Classics', q: 'Action', t: 'movie' },
    { n: 'Sci-Fi Future', q: 'Future', t: 'movie' },
    { n: 'Horror Faves', q: 'Horror', t: 'movie' },
    { n: 'Comedy Gold', q: 'Funny', t: 'movie' },
    { n: 'Nature Docs', q: 'Nature', t: 'series' }
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fR() {
    l.classList.remove('hidden');
    c.innerHTML = '';
    
    // CACHE VERSION v4 (Forced update to remove One-Shots/Cache issues)
    const cacheV = 'cine_cache_v4'; 
    const cache = sessionStorage.getItem(cacheV);
    if(cache) { processAll(JSON.parse(cache)); return; }

    let all = [];
    for(let cat of cats) {
        let res = null;
        if(cat.ids) res = await fIDs_P(cat.n, cat.ids);
        else res = await fC_P(cat.n, cat.q, cat.t);
        if(res && res.list.length > 0) {
            all.push(res);
            rR(res.n, res.q, res.t, res.list);
            sV = [...sV, ...res.list];
            await delay(300);
        }
    }
    sessionStorage.setItem(cacheV, JSON.stringify(all));
    l.classList.add('hidden');
    sB();
    obs();
}

function processAll(all) {
    all.forEach(res => {
        if(res && res.list.length > 0) {
            rR(res.n, res.q, res.t, res.list);
            sV = [...sV, ...res.list];
        }
    });
    l.classList.add('hidden');
    sB();
    obs();
}

async function fIDs_P(n, ids) {
    try {
        let list = [];
        for(let id of ids) {
           const r = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}`).then(res => res.json());
           if(r.Response === "True") list.push(r);
           await delay(100);
        }
        list = list.filter(m => {
            const low = m.Title.toLowerCase();
            const bad = ['bts', 'behind the scene', 'one-shot', 'making of', 'special features', 'short film'];
            return m.imdbRating && 
                   m.imdbRating.toLowerCase().replace(/[^a-z]/g, '') !== "na" &&
                   !bad.some(word => low.includes(word));
        });
        list.sort((a,b) => parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0));
        return { n, q: '', t: '', list };
    } catch (e) { return null; }
}

async function fC_P(n, q, t) {
    try {
        const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${q}&type=${t}`);
        const json = await res.json();
        if(json.Search) {
            let list = [];
            for(let m of json.Search.slice(0, 10)) {
                const r = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${m.imdbID}`).then(res => res.json());
                if(r.Response === "True") list.push(r);
                await delay(100);
            }
            list = list.filter(m => {
                const low = m.Title.toLowerCase();
                const bad = ['bts', 'behind the scene', 'one-shot', 'making of', 'special features', 'short film'];
                return m.imdbRating && 
                       m.imdbRating.toLowerCase().replace(/[^a-z]/g, '') !== "na" &&
                       !bad.some(word => low.includes(word));
            });
            list.sort((a,b) => parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0));
            return { n, q, t, list };
        }
        return null;
    } catch (e) { return null; }
}

function rR(n, q, t, list, first = false) {
    const r = document.createElement('div');
    r.className = 'row fade-in visible';
    r.innerHTML = `<h2 class="row-title">${n}</h2><div class="row-cards"></div>`;
    if(first) c.prepend(r); else c.appendChild(r);
    const rowC = r.querySelector('.row-cards');
    list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card slide-up visible';
        card.onclick = () => showD(m.imdbID);
        const poster = (m.Poster && m.Poster.toLowerCase() !== 'n/a') ? m.Poster : `https://placehold.co/400x600/141414/white?text=${encodeURIComponent(m.Title)}`;
        card.innerHTML = `
            <img src="${poster}" alt="${m.Title}" onerror="this.src='https://placehold.co/200x300/141414/white?text=CineScope'">
            <div class="card-info"> <p><b>${m.Title}</b></p> <p>⭐ ${m.imdbRating} | ${m.Year}</p> </div>
        `;
        rowC.appendChild(card);
    });

    // PRO: Always add a View All / Explore card at the end of EVERY list
    const vA = document.createElement('div');
    vA.className = 'view-all-card slide-up visible';
    vA.innerHTML = `<span>View All</span>`;
    
    // If it's an ID-based row, use the Category Name as the query
    const finalQ = q || n.split(' ')[0]; // Use first word of category if q is missing
    vA.onclick = () => gC(n, finalQ, t);
    rowC.appendChild(vA);
}

function gC(name, q, t) {
    sessionStorage.setItem('cat_name', name);
    sessionStorage.setItem('cat_q', q);
    sessionStorage.setItem('cat_t', t);
    window.location.href = 'category.html';
}

async function showD(id) {
    l.classList.remove('hidden');
    try {
        const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
        const m = await res.json();
        l.classList.add('hidden');
        const poster = (m.Poster && m.Poster.toLowerCase() !== 'n/a') ? m.Poster : `https://placehold.co/800x1200/141414/white?text=${encodeURIComponent(m.Title)}`;
        const rT = (m.Runtime && m.Runtime !== "N/A") ? m.Runtime : "";
        const rD = (m.Director && m.Director !== "N/A") ? m.Director : "Unknown";
        const rA = (m.Actors && m.Actors !== "N/A") ? m.Actors : "N/A";
        modB.innerHTML = `
            <div class="modal-img-container"> <img class="modal-poster" src="${poster}"> </div>
            <div class="modal-details text-anim">
                <div class="m-info-left">
                    <h1 class="m-title">${m.Title}</h1>
                    <div class="m-meta"> <span style="color:#46d369">${m.imdbRating} IMDB</span> <span>${m.Year}</span> ${rT ? `<span>${rT}</span>` : ""} </div>
                    <p class="m-plot">${m.Plot}</p>
                    <div class="watch-section">
                        <p class="m-label">Where to Watch</p>
                        <div class="stream-icons"> <span class="icon-netflix">N</span> <span class="icon-prime">P</span> <span class="icon-disney">D+</span> </div>
                        <a href="https://www.justwatch.com/us/search?q=${encodeURIComponent(m.Title)}" target="_blank" class="watch-link">Check Availability on JustWatch →</a>
                    </div>
                </div>
                <div class="m-info-right">
                    <p class="m-label">Cast</p><p class="m-val">${rA}</p>
                    <p class="m-label">Genres</p><p class="m-val">${m.Genre}</p>
                    <p class="m-label">Director</p><p class="m-val">${rD}</p>
                </div>
            </div>
        `;
        mod.classList.remove('hidden');
    } catch(e) { l.classList.add('hidden'); }
}

function closeM() { mod.classList.add('hidden'); }
window.onclick = (e) => { if (e.target == mod) closeM(); };

function sB() {
    const rd = sV[Math.floor(Math.random() * sV.length)];
    if(rd) {
        document.getElementById('bTitle').innerText = rd.Title;
        document.getElementById('bInfo').onclick = () => showD(rd.imdbID);
        const ban = document.querySelector('.banner');
        if(ban) {
            const poster = (rd.Poster && rd.Poster.toLowerCase() !== 'n/a') ? rd.Poster : '';
            ban.style.backgroundImage = `linear-gradient(to top, #141414 10%, transparent 100%), url('${poster}')`;
        }
        const bC = document.querySelector('.banner-content');
        if(bC) bC.classList.add('banner-anim');
    }
}

function obs() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.slide-up, .fade-in').forEach(el => observer.observe(el));
}

document.getElementById('goBtn').onclick = () => {
    const q = document.getElementById('srch').value;
    if (q) gC('Search Results', q, '');
};

document.getElementById('mode').onclick = () => document.body.classList.toggle('dark');

const cW = document.getElementById('chat-win');
if(cW) {
    document.getElementById('openChat').onclick = () => cW.classList.remove('closed');
    document.getElementById('closeChat').onclick = () => cW.classList.add('closed');
    document.getElementById('send').onclick = () => {
        const i = document.getElementById('chatIn');
        const m = i.value;
        if (!m) return;
        addM(m, 'user');
        i.value = '';
        callGroq(m);
    };
}

async function callGroq(msg) {
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system",
                    content: `You are CineBot, a movie expert. 
                    1. For small talk (hi, how are you), respond warmly but DO NOT provide a "suggest" object.
                    2. For moods/genres:
                       - If SAD: Recommend COMEDY.
                       - If HAPPY: Recommend ACTION or ADVENTURE.
                    3. Output ONLY JSON: {"message": "your reply", "suggest": {"name": "Recommended For You", "q": "search term", "t": "movie"}}`
                }, { role: "user", content: msg }]
            })
        });
        const json = await res.json();
        const match = json.choices[0].message.content.match(/\{.*\}/s);
        const raw = JSON.parse(match[0]);
        addM(raw.message, 'ai');
        if(raw.suggest) addForYou(raw.suggest);
    } catch(e) { addM("I'm feeling a bit out of it. check our top picks!", 'ai'); }
}

async function addForYou(s) {
    const res = await fC_P(s.name, s.q, s.t);
    if(res && res.list.length > 0) {
        const old = document.querySelector('.row-foryou');
        if(old) old.remove();
        const r = document.createElement('div');
        r.className = 'row fade-in visible row-foryou';
        r.innerHTML = `<h2 class="row-title">✨ ${res.n}</h2><div class="row-cards"></div>`;
        c.prepend(r);
        const rowC = r.querySelector('.row-cards');
        res.list.forEach(m => {
            const card = document.createElement('div');
            card.className = 'movie-card slide-up visible';
            card.onclick = () => showD(m.imdbID);
            const p = (m.Poster && m.Poster.toLowerCase() !== 'n/a') ? m.Poster : `https://placehold.co/400x600/141414/white?text=${encodeURIComponent(m.Title)}`;
            card.innerHTML = `
                <img src="${p}" alt="${m.Title}">
                <div class="card-info"> <p><b>${m.Title}</b></p> <p>⭐ ${m.imdbRating} | ${m.Year}</p> </div>
            `;
            rowC.appendChild(card);
        });
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }
}

function addM(t, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = t;
    const msgs = document.getElementById('msgs');
    if(msgs) { msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight; }
}

addM("Hi, I am cine bot, how can I assist you today? movie reccomendations or just a friend for normal talks, I am all ears!", 'ai');
fR();
