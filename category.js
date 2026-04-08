// Use SessionStorage for "File Mode" navigation
const n = sessionStorage.getItem('cat_name') || 'Discovery';
const q = sessionStorage.getItem('cat_q') || 'Wednesday';
const t = sessionStorage.getItem('cat_t') || '';

document.getElementById('cat-title').innerText = n;
const grid = document.getElementById('grid-container');
const l = document.getElementById('loader');

const mod = document.getElementById('modal');
const modB = document.getElementById('modal-body');

function waz() {
    return JSON.parse(localStorage.getItem('wish') || '[]');
}

function yum(id) {
    const a = waz();
    if (!a.includes(id)) {
        a.push(id);
        localStorage.setItem('wish', JSON.stringify(a));
    }
}

function oop(id) {
    const a = waz().filter(x => x !== id);
    localStorage.setItem('wish', JSON.stringify(a));
}

function rat(id) {
    const d = JSON.parse(localStorage.getItem('rates') || '{}');
    return d[id] || 0;
}

function setr(id, p) {
    const d = JSON.parse(localStorage.getItem('rates') || '{}');
    d[id] = p;
    localStorage.setItem('rates', JSON.stringify(d));
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fA() {
    l.classList.remove('hidden');
    grid.innerHTML = '';
    
    let masterList = [];
    // PRO LEVEL: Fetch multiple pages and sort them by RATING so the best hits (like Wednesday series) show first!
    for(let i=1; i<=4; i++) {
        let pList = await fP(i);
        if(pList) masterList = [...masterList, ...pList];
    }
    
    // Sort overall list by rating desc + Prioritize exact title matches
    masterList.sort((a,b) => {
        const aExact = a.Title.toLowerCase() === q.toLowerCase() ? 100 : 0;
        const bExact = b.Title.toLowerCase() === q.toLowerCase() ? 100 : 0;
        return (parseFloat(b.imdbRating || 0) + bExact) - (parseFloat(a.imdbRating || 0) + aExact);
    });
    
    rG(masterList);
    l.classList.add('hidden');
}

async function fP(p) {
    try {
        const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(q)}&type=${t}&page=${p}`);
        const json = await res.json();
        if(json.Search) {
            let list = [];
            // PRO THROTTLING: Just like the home page, we pace ourselves to avoid 401 Rate Limits
            for(let m of json.Search) {
                const r = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${m.imdbID}`).then(res => res.json());
                if(r.Response === "True") list.push(r);
                await delay(100); 
            }
            // Strict N/A filtering for both posters and ratings + Anti-BTS Purge
            return list.filter(m => {
                const low = m.Title.toLowerCase();
                const bad = ['bts', 'behind the scene', 'one-shot', 'making of', 'special features', 'short film', 'documentary'];
                return m.imdbRating && 
                       m.imdbRating.toLowerCase().replace(/[^a-z]/g, '') !== "na" &&
                       !bad.some(word => low.includes(word));
            });
        }
        return [];
    } catch (e) { return []; }
}

function rG(list) {
    if(list.length === 0) {
        grid.innerHTML = `<h2 style="grid-column: 1/-1; text-align:center; padding:50px;">No rated results found for "${q}". <br> Try checking your spelling or check if your API key reached its limit!</h2>`;
        return;
    }

    list.forEach(m => {
        const d = document.createElement('div');
        d.className = 'movie-card grid-movie slide-up visible';
        d.onclick = () => showD(m.imdbID);
        const poster = (m.Poster && m.Poster.toLowerCase() !== 'n/a') ? m.Poster : `https://placehold.co/400x600/141414/white?text=${encodeURIComponent(m.Title)}`;
        d.innerHTML = `
            <img src="${poster}" alt="${m.Title}" onerror="this.src='https://placehold.co/200x300/141414/white?text=CineScope'">
            <div class="grid-movie-info" style="color:white; padding:10px;">
                <h4 style="margin:0; font-size:1rem;">${m.Title}</h4>
                <p style="font-size:0.8rem; opacity:0.7;">⭐ ${m.imdbRating} | ${m.Year}</p>
            </div>
        `;
        grid.appendChild(d);
    });
}

// Redirect back to main or search new
document.getElementById('goBtn').onclick = () => {
    const s = document.getElementById('srch').value;
    if (s) {
        sessionStorage.setItem('cat_name', 'Search Results');
        sessionStorage.setItem('cat_q', s);
        sessionStorage.setItem('cat_t', '');
        window.location.reload(); 
    }
};

async function showD(id) {
    l.classList.remove('hidden');
    try {
        const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
        const m = await res.json();
        l.classList.add('hidden');
        
        const poster = (m.Poster && m.Poster.toLowerCase() !== 'n/a') ? m.Poster : `https://placehold.co/800x1200/141414/white?text=${encodeURIComponent(m.Title)}`;
        
        // Clean up N/A fields
        const rT = (m.Runtime && m.Runtime !== "N/A") ? m.Runtime : "";
        const rD = (m.Director && m.Director !== "N/A") ? m.Director : "Unknown";
        const rA = (m.Actors && m.Actors !== "N/A") ? m.Actors : "N/A";
        let y = waz();
        let o = rat(id);

        modB.innerHTML = `
            <div class="modal-img-container"> <img class="modal-poster" src="${poster}"> </div>
            <div class="modal-details text-anim">
                <div class="m-info-left">
                    <h1 class="m-title">${m.Title}</h1>
                    <div class="m-meta"> 
                        <span style="color:#46d369">${m.imdbRating} IMDB</span> 
                        <span>${m.Year}</span> 
                        ${rT ? `<span>${rT}</span>` : ""}
                    </div>
                    <p class="m-plot">${m.Plot}</p>
                     <!-- NEW: Where to Watch -->
                    <div class="watch-section">
                        <p class="m-label">Where to Watch</p>
                        <div class="stream-icons">
                            <span class="icon-netflix">N</span>
                            <span class="icon-prime">P</span>
                            <span class="icon-disney">D+</span>
                        </div>
                        <a href="https://www.justwatch.com/us/search?q=${encodeURIComponent(m.Title)}" target="_blank" class="watch-link">Check Availability on JustWatch →</a>
                    </div>
                    <div class="wishlist-section">
                        <button id="b">${y.includes(id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</button>
                    </div>
                    <div class="rating-section">
                        <p>Rate this movie:</p>
                        <div class="stars">
                            ${[1,2,3,4,5].map(s => `<span class="star ${o >= s ? 'selected' : ''}" data-rating="${s}">★</span>`).join('')}
                        </div>
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
        document.getElementById('b').onclick = () => {
            if (y.includes(id)) {
                oop(id);
                y = y.filter(i => i !== id);
                document.getElementById('b').innerText = 'Add to Wishlist';
            } else {
                yum(id);
                y.push(id);
                document.getElementById('b').innerText = 'Remove from Wishlist';
            }
        };
        document.querySelectorAll('.star').forEach(s => {
            s.onclick = () => {
                const p = parseInt(s.dataset.rating);
                setr(id, p);
                o = p;
                document.querySelectorAll('.star').forEach(st => {
                    st.classList.toggle('selected', parseInt(st.dataset.rating) <= p);
                });
            };
        });
        let v = JSON.parse(localStorage.getItem('v') || '[]');
        v = v.filter(i => i !== id);
        v.unshift(id);
        if (v.length > 10) v = v.slice(0,10);
        localStorage.setItem('v', JSON.stringify(v));
    } catch(e) { l.classList.add('hidden'); }
}

function closeM() { mod.classList.add('hidden'); }
window.onclick = (e) => { if (e.target == mod) closeM(); };

fA();
