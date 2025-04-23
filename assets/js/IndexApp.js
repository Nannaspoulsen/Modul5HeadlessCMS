document.addEventListener("DOMContentLoaded", () => {
  const slideContainer = document.getElementById("slideshow");

  // Hent opskrifter fra WordPress
  fetch("https://www.menneskevaerk.com/wp-json/wp/v2/posts?acf_format=standard&_embed&per_page=8")
    .then((res) => res.json())
    .then((recipes) => {
      recipes.forEach((recipe) => {
        const title = recipe.title.rendered;
        const img = recipe.acf?.billede?.url || ""

        const card = document.createElement("div");
        card.classList.add("slideshowCard");

// $ bruges da img og title er dynamisk alt efter hvilken opskrift der vælges
        card.innerHTML = `
  <div class="cardImage">
    <img src="${img}" alt="${title}">
  </div>
  <div class="cardText">
    <h4>${title}</h4>
  </div>
`;

//window.location.href åbner en ny fane/vindue med hele opskriften
//`opskrift.html?id=${recipe.id}`; linker til hele opskriften med et bestemt id
        card.addEventListener("click", () => {
          window.location.href = `opskrift.html?id=${recipe.id}`;
        });
//opskrifterne sættes ind efter hinanden
        slideContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Fejl ved hentning af slideshow:", err);
    });

  // Pilefunktion – scroll containeren horisontalt
  //Der scrolles med 300px af gangen når der trykkes på pilene
  document.querySelector(".leftBtn").addEventListener("click", () => {
    document.getElementById("slideshow").scrollLeft -= 300;
  });

  document.querySelector(".rightBtn").addEventListener("click", () => {
    document.getElementById("slideshow").scrollLeft += 300;
  });
});

