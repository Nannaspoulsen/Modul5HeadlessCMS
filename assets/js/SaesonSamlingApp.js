// Her sætter vi adressen til vores WordPress site og bygger den URL vi skal hente opskrifter fra
const domain = "https://www.menneskevaerk.com/";
const fullUrl = domain + "wp-json/wp/v2/posts?opskriftsamling=63&acf_format=standard&_embed";

// Her henter vi data (opskrifter) fra WordPress første gang siden loades
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

  // 💡 Hvis der ikke er nogen opskrifter, vis en brugervenlig besked og stop
  if (recipes.length === 0) {
    container.innerHTML = "<p style='text-align: center; padding: 2rem;'>Ingen opskrifter matcher dine filtre - ØV! Prøv noget andet.</p>";
    return;
  }

  // Vi går gennem alle opskrifter én efter én
  recipes.forEach(recipe => {
    const title = recipe.title.rendered; // Opskriftens titel
    const excerpt = recipe.excerpt.rendered; // En kort beskrivelse som vi skal have oprettet i WordPress
    const img = recipe.acf?.billede?.url || ""; // Henter billedet fra ACF-feltet 'billede'

    // Her gør vi klar til at vise sværhedsgrad og tid (som ligger i taxonomier)
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

    // Vi henter antal portioner fra ACF (hvis det er sat)
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
      document.getElementById("modalLink").href = recipe.link;
      //HUSK at indsætte link til opskrift siden her!
      //TODO: Vis antal portioner, når du vil bruge det
      //TODO: Tilføj beskrivelsen når du har lavet excerpt eller ACF-beskrivelse

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

// Funktion der samler valgte filtre og henter opskrifter baseret på dem
function getRecipesByFilters() {
  const filters = document.querySelectorAll(".filter:checked"); // Find alle valgte filtre
  const baseUrl = "https://www.menneskevaerk.com/wp-json/wp/v2/posts?acf_format=standard&_embed";

  // Vi starter med Spring Collection som fast samling (du kan ændre ID)
  let url = `${baseUrl}&opskriftsamling=64`;

  // Objekt til at samle ID’er for hver type (fx sværhedsgrad, udstyr osv.)
  const filterValues = {};

  filters.forEach(filter => {
    const type = filter.dataset.type;
    const value = filter.value;

    if (!filterValues[type]) {
      filterValues[type] = [];
    }
    filterValues[type].push(value);
  });

  // Tilføj ID’er til URL’en – én gang for hver type (f.eks. &svaerhedsgrad=99,100)
  for (const type in filterValues) {
    url += `&${type}=${filterValues[type].join(",")}`;
  }

  // Fetch de filtrerede opskrifter
  fetch(url)
    .then(res => res.json())
    .then(data => {
      displayRecipes(data); // Vis de nye opskrifter
    })
    .catch(err => {
      console.error("Fejl ved hentning af filtrerede opskrifter:", err);
    });
}

// Når brugeren klikker på en checkbox, kør filtrering med det samme
document.querySelectorAll(".filter").forEach(filter => {
  filter.addEventListener("change", () => {
    getRecipesByFilters(); // Opdater opskrifter ud fra valgte filtre
  });
});
