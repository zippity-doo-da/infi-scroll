import './launcher.css';

interface WorldChoice {
  id: string;
  name: string;
  description: string;
  preview: string;
  builderPreset?: string;
}

const worlds: WorldChoice[] = [
  { id: 'art-deco-silhouette', name: 'Art Deco Silhouette', description: 'A dark 1920s skyline with restrained traffic and rare rooftop figures.', preview: '/assets/art-deco-city-pack/v1/style-guide.png' },
  { id: 'silhouette-fantasy-city', name: 'Silhouette Fantasy City', description: 'A moonlit illustrated city with authored streets, passing storms, and rare ambient events.', preview: '/assets/silhouette-fantasy-city/v1/master-panorama-style-guide-v4.png' },
  { id: 'fantasy-city', name: 'Fantasy City', description: 'The original unified fantasy-city asset package and authored district sequence.', preview: '/assets/fantasy-city/unified-v1/approval-preview.jpg' },
  { id: 'fifth-element-city', name: 'Fifth Element City', description: 'Retro-futurist traffic descending through a deep vertical city canyon.', preview: '/assets/vertical-element/v1/master-panorama-style-guide-v2-no-vehicles.png' },
  { id: 'coruscant-city', name: 'Coruscant City', description: 'A dense elevated metropolis with traffic moving across multiple aerial depths.', preview: '/assets/coruscant/v1/master-panorama-style-guide.png' },
  { id: 'evention-typographic', name: 'Evention Typographic', description: 'A monochrome typographic world with independently moving message bands.', preview: '/assets/evention-typographic/v1/master-panorama-style-guide.svg', builderPreset: 'evention-typographic' },
  { id: 'evention-typographic-color', name: 'Evention Color', description: 'The Evention typographic composition using its branded color system.', preview: '/assets/evention-typographic-color/v1/master-panorama-style-guide.svg', builderPreset: 'evention-typographic-color' },
  { id: 'evention-chicago', name: 'Chicago', description: 'An illustrated downtown river canyon with water taxi and elevated train traffic.', preview: '/assets/evention-chicago/v1/master-panorama-style-guide.png' },
];

const app = document.querySelector<HTMLElement>('#app')!;
let selected = worlds[0]!;
const savedSeed = localStorage.getItem('infi-scroll:last-seed');
const seed = savedSeed && /^\d+$/.test(savedSeed) ? savedSeed : String(Math.floor(10000 + Math.random() * 89999));

function render(): void {
  app.innerHTML = `
    <div class="launcher-shell">
      <header class="launcher-header">
        <h1>Infinite Illustrated Worlds</h1>
        <a id="builder-link" href="/builder.html${selected.builderPreset ? `?preset=${selected.builderPreset}` : ''}">Open Builder</a>
      </header>
      <section class="featured-world" aria-labelledby="featured-title">
        <img class="featured-art" src="${selected.preview}" alt="${selected.name} preview">
        <div class="featured-controls">
          <div class="featured-copy"><h2 id="featured-title">${selected.name}</h2><p>${selected.description}</p></div>
          <form id="launch-form" class="launch-controls">
            <label><span>Seed</span><input id="world-seed" inputmode="numeric" pattern="[0-9]*" value="${seed}" aria-label="World seed"></label>
            <button type="submit">Enter World <span aria-hidden="true">→</span></button>
          </form>
        </div>
      </section>
      <nav class="world-filmstrip" aria-label="Available worlds">
        ${worlds.map((world) => `<button type="button" data-world="${world.id}" class="world-choice ${world.id === selected.id ? 'active' : ''}" aria-pressed="${world.id === selected.id}"><img src="${world.preview}" alt=""><span>${world.name}</span></button>`).join('')}
      </nav>
    </div>`;

  document.querySelectorAll<HTMLButtonElement>('[data-world]').forEach((button) => button.addEventListener('click', () => {
    selected = worlds.find((world) => world.id === button.dataset.world) ?? selected;
    render();
  }));
  document.querySelector<HTMLFormElement>('#launch-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = document.querySelector<HTMLInputElement>('#world-seed')!.value.trim() || seed;
    localStorage.setItem('infi-scroll:last-seed', value);
    window.location.assign(`/?world=${encodeURIComponent(selected.id)}&seed=${encodeURIComponent(value)}`);
  });
}

render();
