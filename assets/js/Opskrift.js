// Hent ID fra URL'en 

const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");
const url = `https://www.menneskevaerk.com/wp-json/wp/v2/posts/${recipeId}?acf_format=standard&_embed`;

// Hvis der ikke er noget ID i URL’en, vis fejl

if (!recipeId) {
  document.querySelector("main").innerHTML = "<p>Ingen opskrift blev fundet 😕</p>";
} else {

  // Hent data for den specifikke opskrift
  fetch(url)
    .then(res => res.json())
    .then(recipe => {
      
     
// Fyld data ind i HTML’en
      document.querySelector(".recipeTitel").innerHTML = recipe.title.rendered;
      document.querySelector(".recipeText").innerHTML = recipe.excerpt.rendered;
      document.querySelector(".recipeImg").src = recipe.acf?.billede?.url || "";
      document.querySelector(".recipeImg").alt = recipe.title.rendered;
        


      // Taxonomier

      const allTerms = recipe._embedded["wp:term"] || [];
      let tid = "Ukendt";
      let sværhedsgrad = "Ukendt";
      allTerms.forEach(termGroup => {
        termGroup.forEach(term => {
          if (term.taxonomy === "tilberedningstid") tid = term.name;
          if (term.taxonomy === "svaerhedsgrad") sværhedsgrad = term.name;
        });
      });
 
      // Ingredienser og instruktioner (hvis du tilføjer ACF-felter)
      document.querySelector(".ingredients").innerHTML = `🧾 Tilberedningstid: ${tid} – Sværhedsgrad: ${sværhedsgrad}`;
      document.querySelector(".instructions").innerHTML = "🔜 Her kan instruktionerne stå, hvis du laver et felt til det i ACF.";
    })

    .catch(err => {
      console.error("Fejl ved hentning af opskrift:", err)
      document.querySelector("main").innerHTML = "<p>Opskriften kunne ikke hentes 😢</p>";
    });

}

const urlFieldId = `https://www.menneskevaerk.com/wp-json/wp/v2/posts/${recipeId}?acf_format=standard&_embed`;

if (!recipeId) {
  document.querySelector(".fullRecipe").innerHTML = "<p>Ingen opskrift blev fundet 😕</p>";
} else {
  // Hent data via fetch
  fetch(url)
    .then((res) => res.json()) // Konverter API-svar til JSON
    .then((recipe) => {
      // Fyld data ind i HTML
      const ingredients = recipe.acf?.ingredienser?.ingredienser || "Ingredienser mangler";
        const instructions = recipe.acf?.fremgangsmaade?.fremgangsmaade || "Fremgangsmåde mangler";
      
      document.querySelector(".ingredients").innerHTML = `<h2>Ingredienser</h2><p>${ingredients}</p>`;
      document.querySelector(".instructions").innerHTML = `<h2>Fremgangsmåde</h2><p>${instructions}</p>`;
    })
    .catch((err) => {
      console.error("Fejl ved hentning af data:", err);
      document.querySelector(".fullRecipe").innerHTML = "<p>Opskriften kunne ikke hentes 😢</p>";
    });
}
