// Her sætter vi adressen til vores WordPress site og bygger den URL vi skal hente opskrifter fra
const domain = "https://www.menneskevaerk.com/";
const fullUrl =
  domain + "wp-json/wp/v2/posts?opskriftsamling=64&acf_format=standard&_embed";

// Her henter vi data (opskrifter) fra WordPress første gang siden loades
fetch(fullUrl)
  // Vi laver svaret om til noget JavaScript kan arbejde med
  .then((res) => res.json())
  .then((data) => {
    // Når data er klar, viser vi opskrifterne på siden
    displayRecipes(data);
  })
  .catch((err) => {
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
    container.innerHTML =
      "<p>Sorry, no recipes found. Try again.</p>";
    return;
  }

  // Vi går gennem alle opskrifter én efter én
  recipes.forEach((recipe) => {
    // Opskriftens titel
    const title = recipe.title.rendered;
    // Opskriftens beskrivelse
    const excerpt = recipe.excerpt.rendered;
    // Henter billedet fra ACF-feltet 'billede'
    const img = recipe.acf?.billede?.url || "<p>Picture missing</p>";
    // WordPress gemmer taxonomier som separate data, men når vi tilføjer _embed i vores fetch-URL,
    // så sender WordPress taxonomierne med som en del af svaret.

    // Når man bruger ?_embed i en fetch-URL til WordPress API, indsætter WordPress de tilhørende taxonomier under feltet "_embedded", i en nøgle kaldet "wp:term". Den URL vi bruger til at hente opskrifterne, indeholder derfor også taxonomierne. wp:term er altså bare en del af svaret fra WordPress API, når vi beder om opskrifterne med ?_embed. Det her felt indeholder ALLE taxonomier for én opskrift. Hvis der ikke findes nogen (fx hvis _embed mangler), bruges en tom liste [] i stedet. 
    // Kilde: https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/#_embed
    const allTaxo = recipe._embedded["wp:term"] || [];
    let sværhedsgrad = "Unknown";
    let tid = "Uknown";

    // De taxonomier vi bruger: sværhedsgrad og tilberedningstid
    allTaxo.forEach((taxoGroup) => {
      taxoGroup.forEach((taxo) => {
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
      const beskrivelse = recipe.acf?.infotekst || "Unknown";
      const portioner = recipe.acf?.antal_portioner || "Unknown";


      document.getElementById("modalBillede").src = img;
      document.getElementById("modalTitel").innerHTML = title;
      document.getElementById("modalTid").textContent = tid;
      document.getElementById("modalBeskrivelse").textContent = beskrivelse;
      document.getElementById("modalSværhedsgrad").textContent = sværhedsgrad;
      document.getElementById("modalPortioner").textContent = portioner;

      document.getElementById(
        "modalLink"
      ).href = `opskrift.html?id=${recipe.id}`; // Her linker vi til opskriften
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
  const baseUrl =
    "https://www.menneskevaerk.com/wp-json/wp/v2/posts?acf_format=standard&_embed";

  // Vi starter med Spring Collection som fast samling (ID 63)
  let url = `${baseUrl}&opskriftsamling=64`;

  // Objekt til at samle ID’er for hver type (fx sværhedsgrad, udstyr osv.)
  //En tom kurv fordi der ikke er valgt filter endnu
  const filterValues = {};

// Vi går igennem alle de filtre, som brugeren har valgt (de der er "checked"). "filters" er en liste over alle checkboxe med klassen ".filter", som er markeret
filters.forEach((filter) => {
  // Her henter vi filterets type. Det gør vi ved at hente værdien fra HTML "data-type" - ved hjælp af dataset.type i JS kan man hente det data. Fx: <input data-type="svaerhedsgrad"> i HTML - bliver til filter.dataset.type = "svaerhedsgrad" I JS. 
  // Kilde: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
    const type = filter.dataset.type;
    //Her fanges værdien på taxonomien. F.eks. er value = 7 alle retter som tager mellem 30-60 min at lave
    const value = filter.value;

    //Hvis ikke der er nogen opskrifter med de værdier vi vælger i filter, så oprettes der en tom liste
    if (!filterValues[type]) {
      //Er derimod nogle opskifter som passer til de værdier som vi vælger, så lægger vi dem i kurven (vi forestiller os en indkøbskurv, og når den er fyldt kan vi gå til kassen = få opskrifterne som passer til de valgte værdier)
      filterValues[type] = [];
    }
    filterValues[type].push(value);
  });

  // Nu har vi en "kurv" (filterValues) fyldt med ID’er for hver slags filtertype – fx:{ svaerhedsgrad: ["88", "90"], udstyr: ["14"] }. Vi skal nu bygge en URL, der indeholder alle disse filtre, så vi kan hente de opskrifter der passer til. Vi går igennem hver type i filterValues – én ad gangen. Det kunne være "svaerhedsgrad", "udstyr", "diaet-og-allergi", osv.
  for (const type in filterValues) {

    //// Nu bygger vi en del af URL'en for den aktuelle type (f.eks. "svaerhedsgrad"). Vi henter alle ID’er fra kurven (f.eks. ["88", "90"]) og sætter dem sammen med komma. Det gør vi med .join(","), som laver dem om til en enkelt tekststreng - "88,90" og altså ikke længere et array. Join er en metode i JavaScript, der bruges til at kombinere elementerne i et array til en enkelt streng. I dette tilfælde bruger vi et komma. Det betyder, at hvis vi har et array med værdierne [88, 90], vil join(",") returnere strengen "88,90". På den måde ved WordPress, at vi gerne vil have opskrifter med begge disse ID’er
    //Kilde: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
    url += `&${type}=${filterValues[type].join(",")}`;
  }

  // Fetch de filtrerede opskrifter
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      displayRecipes(data); // Vis de nye opskrifter
    })
    .catch((err) => {
      console.error("Fejl ved hentning af filtrerede opskrifter:", err);
    });
}

// Når brugeren klikker på en checkbox, kør filtrering med det samme
document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("change", () => {
    getRecipesByFilters(); // Opdater opskrifter ud fra valgte filtre
  });
});
