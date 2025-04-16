// Her sætter vi adressen til vores WordPress site og bygger den URL vi skal hente opskrifter fra
const domain = "https://www.menneskevaerk.com/";
const fullUrl = domain + "wp-json/wp/v2/posts?opskriftsamling=63&acf_format=standard&_embed";

// Her henter vi data (opskrifter) fra WordPress første gang siden loades
fetch(fullUrl)
// Vi laver svaret om til noget JavaScript kan arbejde med
  .then(res => res.json()) 
  .then(data => {
    // Når data er klar, viser vi opskrifterne på siden
    displayRecipes(data); 
  })
  .catch(err => {
    // Hvis noget går galt, vis fejl i konsollen
    console.error("Noget gik galt:", err); 
  });

// Funktion der viser alle opskrifter på siden. Recipes er det navn vi nu giver opskrifter
function displayRecipes(recipes) {
  // Finder boksen vi vil putte opskrifterne i
  const container = document.querySelector(".recipeCards"); 
  // Sørger for den er tom før vi starter

  container.innerHTML = ""; 
  // Hvis der ikke er en opskrift, så vises der en fejlmeddelelse
  if (recipes.length === 0) {
    container.innerHTML = "<p style='text-align: center; padding: 2rem;'>Sorry, no recepies found. Try again .</p>";
    return;
  }

  // Vi går gennem alle opskrifter én efter én
  recipes.forEach(recipe => {
    // Opskriftens titel
    const title = recipe.title.rendered; 
    // Opskriftens beskrivelse
    const excerpt = recipe.excerpt.rendered; 
    // Henter billedet fra ACF-feltet 'billede'
    const img = recipe.acf?.billede?.url || "<p>Picture missing</p>"; 
    // Her gør vi klar til at vise sværhedsgrad og tid (som ligger i taxonomier). 
    const allTaxo = recipe._embedded["wp:term"] || [];
    let sværhedsgrad = "Ukendt";
    let tid = "Ukendt";

    // De taxonomier vi bruger: sværhedsgrad og tilberedningstid
    allTaxo.forEach(taxoGroup => {
      taxoGroup.forEach(taxo => {
        if (taxo.taxonomy === "svaerhedsgrad") {
          sværhedsgrad = taxo.name;
        }
        if (taxo.taxonomy === "tilberedningstid") {
          tid = taxo.name;
        }
      });
    });

    // Vi henter antal portioner
    const portioner = recipe.acf?.antal_portioner || "";

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
      document.getElementById("modalTitel").innerHTML = title;
      document.getElementById("modalTid").textContent = tid;
      document.getElementById("modalSværhedsgrad").textContent = sværhedsgrad;
      document.getElementById("modalLink").href = `opskrift.html?id=${recipe.id}`; // Her linker vi til opskriften
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
  //En tom kurv fordi der ikke er valgt filter endnu
  const filterValues = {};

  // Data-type er ikke en standard, men det er data derimod. Vi har valgt att type er navnet på vores datasæt inde i html, derfor hedder vores: dataset.type, for så hentes den type taxonomi der høre under data-type. F.eks. sværhedsgrad eller stavblender
  filters.forEach(filter => {
    const type = filter.dataset.type;
    //Her fanges værdien på taxonomien. F.eks. er value = 7 alle retter som tager mellem 30-60 min at lave
    const value = filter.value;

    //Hvis ikke der er nogen opskrifter s´med de værdier vi vælger i filter, så oprettes der en tom liste
    if (!filterValues[type]) {
      //Er derimod nogle opskifter som passer til de værdier som vi vælger, så lægger vi dem i kurven (vi forestiller os en indkøbskurv, og når den er fyldt kan vi gå til kassen = få opskrifterne som passer til de valgte værdier vist vist) og de vises
      filterValues[type] = [];
    }
    filterValues[type].push(value);
  });

  // Tilføj ID’er til URL’en – én gang for hver type (f.eks. &svaerhedsgrad=99,100)
  for (const type in filterValues) {
    url += `&${type}=${filterValues[type].join("&")}`; //HVAD FOREGÅR DER - og eller ,???
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
