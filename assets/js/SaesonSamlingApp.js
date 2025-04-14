// Her sætter vi adressen til vores WordPress site og bygger den URL vi skal hente opskrifter fra
const domain = "https://www.menneskevaerk.com/";
const fullUrl = domain + "wp-json/wp/v2/posts?opskriftsamling=63&acf_format=standard&_embed";

// Her henter vi data (opskrifter) fra WordPress
fetch(fullUrl)
  .then(res => res.json()) // Vi laver svaret om til noget JavaScript kan arbejde med
  .then(data => {
    displayRecipes(data); // Når data er klar, viser vi opskrifterne på siden
  })
  .catch(err => {
    console.error("Noget gik galt:", err); // Hvis noget går galt, vis fejl i konsollen
  });

// Funktion der viser alle opskrifter på siden
function displayRecipes(recipes) {
  const container = document.querySelector(".recipeCards"); // Finder boksen vi vil putte opskrifterne i
  container.innerHTML = ""; // Sørger for den er tom før vi starter

  // Vi går gennem alle opskrifter én efter én
  recipes.forEach(recipe => {
    const title = recipe.title.rendered; // Opskriftens titel
    const excerpt = recipe.excerpt.rendered; // En kort beskrivelse som vi skal have oprettet i WordPress
    const img = recipe.acf?.billede?.url || ""; // Henter billedet fra ACF-feltet 'billede'

    // Her gør vi klar til at vise sværhedsgrad og tid (som ligger i taxonomier) Forstod ikke helt det med WP:term, det var noget Thomas forklarede mig. Det skal jeg lige have læst op på!
    const allTerms = recipe._embedded["wp:term"] || [];
    let sværhedsgrad = "Ukendt";
    let tid = "Ukendt";

    // De taxonomier vi bruger: sværhedsgrad og tilberedningstid
    allTerms.forEach(termGroup => {
      termGroup.forEach(term => {
        if (term.taxonomy === "svaerhedsgrad") {
          sværhedsgrad = term.name;
        }
        if (term.taxonomy === "tilberedningstid") {
          tid = term.name;
        }
      });
    });

    // Vi henter antal portioner - men det har vi ikke styr på i wordpress endnu. Husk lige at få kigget på det sammen.
    const portioner = recipe.acf?.antal_portioner || "N/A";

    // Vi laver et HTML-element til opskriften og giver det en klasse
    const article = document.createElement("article");
    article.classList.add("recipe");

    // Vi sætter billedet og titlen ind i opskriftskortet
    article.innerHTML = `
      ${img ? `<img src="${img}" alt="${title}" />` : ""}
      <h3>${title}</h3>
    `;

    // Når brugeren klikker på opskriften, åbner vi en popup med mere info
    article.addEventListener("click", () => {
      document.getElementById("modalBillede").src = img;
      document.getElementById("modalBillede").alt = title;
      document.getElementById("modalTitel").innerHTML = title;
      document.getElementById("modalTid").textContent = tid;
      document.getElementById("modalSværhedsgrad").textContent = sværhedsgrad;
      document.getElementById("modalLink").href = 
      //HUSK at indsætte link til opskrift siden her! Jeg er også usikker på hvordan vi får vist antal portioner. Den er udkommenteret i HTML koden. Husk også at indsætte beskrivelsen, når vi har fundet ud at lave den i WP.

      // Fjerner klassen "hidden" så modal vises
      document.querySelector(".recipeModal").classList.remove("hidden");
    });

    // Tilføjer opskriften til opskriftsområdet på siden
    container.appendChild(article);
  });
}

// Her lukker vi popup'en hvis brugeren klikker på krydset
document.querySelector(".lukModal").addEventListener("click", () => {
  document.querySelector(".recipeModal").classList.add("hidden");
});
