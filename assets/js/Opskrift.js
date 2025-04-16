// Hent ID fra URL'en (fx opskrift.html?id=123)
const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

// Hvis der ikke er noget ID, vis en fejl
if (!recipeId) {
  document.querySelector(".fullRecipe").innerHTML =
    "<p>The recipe could not be retrieved😕</p>";
} else {
  // Byg URL til WordPress API
  const url = `https://www.menneskevaerk.com/wp-json/wp/v2/posts/${recipeId}?acf_format=standard&_embed`;

  // Hent data via fetch
  fetch(url)
    .then((res) => res.json())
    .then((recipe) => {
      // Titel, tekst og billede
      document.querySelector(".recipeTitel").innerHTML = recipe.title.rendered;
      document.querySelector(".recipeText").innerHTML = recipe.excerpt.rendered;
      document.querySelector(".recipeImg").src = recipe.acf?.billede?.url || "";
      document.querySelector(".recipeImg").alt = recipe.title.rendered;


      // Hent og vis beskrivelse af opskrift 
      // const beskrivelse = recipe.excerpt?.rendered || "<p>Description missing.</p>";
      // document.querySelector(".recipeText").innerHTML = `
      // <p>${beskrivelse}</p>`;

      const beskrivelse = recipe.acf?.infotekst || "<p>Description missing.</p>";
document.querySelector(".recipeText").innerHTML = `
  <p>${beskrivelse}</p>`;
  
      // Hent fremgangsmåde fra ACF-gruppefelt
      const fremgangsmaade =
        recipe.acf?.fremgangsmaade?.fremgangsmaade || "Instructions missing";

      // Hent ingredienser: det er en gruppe med flere felter 
      const ingrediensObjekt = recipe.acf?.ingredienser || {};
      const ingrediensListe = Object.values(ingrediensObjekt)
        .filter((item) => item) // Fjern tomme felter
        .map((item) => `<li>${item}</li>`)
        .join("");

      const fremgangsmaadeObjekt = recipe.acf?.fremgangsmaade || {};
      const fremgangsListe = Object.values(fremgangsmaadeObjekt)
        .filter((item) => item) // Fjern tomme felter
        .map((item) => `<li>${item}</li>`)
        .join("");

      // Vis ingredienser
      document.querySelector(".ingrediens").innerHTML = `
        <h2> Ingrediens </h2>
        <ul>${ingrediensListe}</ul>
      `;

      // Vis fremgangsmåde
    document.querySelector(".instructions").innerHTML = `
  <h2>Intructions</h2>
  <ol>${fremgangsListe}</ol>
`;

    })
    .catch((err) => {
      console.error("Fejl ved hentning af opskrift:", err);
      document.querySelector(".fullRecipe").innerHTML =
        "<p>The recipe could not be retrieved😢</p>";
    });
}
