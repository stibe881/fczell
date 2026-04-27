const fs = require('fs');
const css = `
/* ---------- SPONSOREN SECTION ---------- */
.sponsor-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.sponsor-list li {
  text-align: center;
  flex: 0 0 auto;
}
.sponsor-list a {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.sponsor-logo {
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
  margin-bottom: 0.8rem;
  transition: transform 0.2s;
}
.sponsor-list a:hover .sponsor-logo {
  transform: scale(1.05);
}
.sponsor-list h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fcz-gray-500);
}

.bandenwerber-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
.bandenwerber-list li {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.05);
  width: 200px;
}
.bandenwerber-list li img {
  max-width: 150px;
  max-height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
}
.b-name {
  font-weight: 700;
  color: var(--fcz-black);
  margin-bottom: 0.2rem;
}
.b-loc {
  font-size: 0.85rem;
  color: var(--fcz-gray-500);
}
`;
fs.appendFileSync('./public/styles.css', css);
console.log("Appended CSS.");
