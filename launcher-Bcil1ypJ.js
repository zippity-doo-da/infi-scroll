const n=[{id:"silhouette-fantasy-city",name:"Silhouette Fantasy City",description:"A moonlit illustrated city with authored streets, passing storms, and rare ambient events.",preview:"/assets/silhouette-fantasy-city/v1/master-panorama-style-guide-v4.png"},{id:"fantasy-city",name:"Fantasy City",description:"The original unified fantasy-city asset package and authored district sequence.",preview:"/assets/fantasy-city/unified-v1/approval-preview.jpg"},{id:"fifth-element-city",name:"Fifth Element City",description:"Retro-futurist traffic descending through a deep vertical city canyon.",preview:"/assets/vertical-element/v1/master-panorama-style-guide-v2-no-vehicles.png"},{id:"coruscant-city",name:"Coruscant City",description:"A dense elevated metropolis with traffic moving across multiple aerial depths.",preview:"/assets/coruscant/v1/master-panorama-style-guide.png"},{id:"evention-typographic",name:"Evention Typographic",description:"A monochrome typographic world with independently moving message bands.",preview:"/assets/evention-typographic/v1/master-panorama-style-guide.svg",builderPreset:"evention-typographic"},{id:"evention-typographic-color",name:"Evention Color",description:"The Evention typographic composition using its branded color system.",preview:"/assets/evention-typographic-color/v1/master-panorama-style-guide.svg",builderPreset:"evention-typographic-color"},{id:"evention-chicago",name:"Chicago",description:"An illustrated downtown river canyon with water taxi and elevated train traffic.",preview:"/assets/evention-chicago/v1/master-panorama-style-guide.png"}],o=document.querySelector("#app");let e=n[0];const i=localStorage.getItem("infi-scroll:last-seed"),r=i&&/^\d+$/.test(i)?i:String(Math.floor(1e4+Math.random()*89999));function s(){o.innerHTML=`
    <div class="launcher-shell">
      <header class="launcher-header">
        <h1>Infinite Illustrated Worlds</h1>
        <a id="builder-link" href="/builder.html${e.builderPreset?`?preset=${e.builderPreset}`:""}">Open Builder</a>
      </header>
      <section class="featured-world" aria-labelledby="featured-title">
        <img class="featured-art" src="${e.preview}" alt="${e.name} preview">
        <div class="featured-controls">
          <div class="featured-copy"><h2 id="featured-title">${e.name}</h2><p>${e.description}</p></div>
          <form id="launch-form" class="launch-controls">
            <label><span>Seed</span><input id="world-seed" inputmode="numeric" pattern="[0-9]*" value="${r}" aria-label="World seed"></label>
            <button type="submit">Enter World <span aria-hidden="true">→</span></button>
          </form>
        </div>
      </section>
      <nav class="world-filmstrip" aria-label="Available worlds">
        ${n.map(t=>`<button type="button" data-world="${t.id}" class="world-choice ${t.id===e.id?"active":""}" aria-pressed="${t.id===e.id}"><img src="${t.preview}" alt=""><span>${t.name}</span></button>`).join("")}
      </nav>
    </div>`,document.querySelectorAll("[data-world]").forEach(t=>t.addEventListener("click",()=>{e=n.find(a=>a.id===t.dataset.world)??e,s()})),document.querySelector("#launch-form")?.addEventListener("submit",t=>{t.preventDefault();const a=document.querySelector("#world-seed").value.trim()||r;localStorage.setItem("infi-scroll:last-seed",a),window.location.assign(`/?world=${encodeURIComponent(e.id)}&seed=${encodeURIComponent(a)}`)})}s();
