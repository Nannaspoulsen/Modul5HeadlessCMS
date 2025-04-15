document.addEventListener("DOMContentLoaded", () => {
  const slideContainer = document.getElementById("slideshow");

  // Hent opskrifter fra WordPress
  fetch("https://www.menneskevaerk.com/wp-json/wp/v2/posts?acf_format=standard&_embed&per_page=8")
    .then((res) => res.json())
    .then((recipes) => {
      recipes.forEach((recipe) => {
        const title = recipe.title.rendered;
        const img = recipe.acf?.billede?.url || "./assets/img/fallback.jpg";

        const card = document.createElement("div");
        card.classList.add("slideshowCard");

        card.innerHTML = `
  <div class="cardImage">
    <img src="${img}" alt="${title}">
  </div>
  <div class="cardText">
    <h4>${title}</h4>
  </div>
`;


        card.addEventListener("click", () => {
          window.location.href = `opskrift.html?id=${recipe.id}`;
        });

        slideContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Fejl ved hentning af slideshow:", err);
    });

  // Pilefunktion – scroll containeren horisontalt
  document.querySelector(".leftBtn").addEventListener("click", () => {
    document.getElementById("slideshow").scrollLeft -= 300;
  });

  document.querySelector(".rightBtn").addEventListener("click", () => {
    document.getElementById("slideshow").scrollLeft += 300;
  });
});

