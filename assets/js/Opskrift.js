
// Params laver et objekt, som kan læse parametre fra den url brugeren er på
const params = new URLSearchParams(window.location.search);
//Henter værdien af id'et fra url'en, og gemmer den i en variabel, som hedder "recipeId"
const recipeId = params.get("id");

// Hvis der ikke er noget ID, vis en fejl
if (!recipeId) {
  document.querySelector(".fullRecipe").innerHTML =
    "<p>The recipe could not be retrieved</p>";
} else {
  // hvis der er et id, bygges der en url til rest api. I ``peges der på et bestemt blogindlæg med et bestemt id
  const url = `https://www.menneskevaerk.com/wp-json/wp/v2/posts/${recipeId}?acf_format=standard&_embed`;


  
  fetch(url)
  .then(response => response.json())
  .then(data => {
    let tid = data.acf?.tilberedningstid.name;
    let sværhedsgrad = data.acf?.svaerhedsgrad.name;
    let portioner = data.acf?.portioner;

    
    //Indsæt i .opskriftInfo
    document.getElementById("Portioner").textContent = portioner || "Unknown"
    document.getElementById("Tid").textContent = tid;
    document.getElementById("Sværhedsgrad").textContent = sværhedsgrad;

    document.querySelector(".recipeTitel").innerHTML = recipe.title.rendered;
    document.querySelector(".recipeText").innerHTML = recipe.excerpt.rendered;

    document.querySelector(".recipeImg").src = recipe.acf?.billede?.url || "<p>Picture missing</p>";
    document.querySelector(".recipeImg").alt = recipe.title.rendered;
  })
  .catch(error => console.error("Fejl ved hentning af data: ", error));
  
  

  // Hent data via fetch, og oversætter det til json
  fetch(url)
    .then((res) => res.json())
    .then((recipe) => {
      // Når data er hentet, så laves titel, tekst, billede og billedetekst
      document.querySelector(".recipeTitel").innerHTML = recipe.title.rendered;
      document.querySelector(".recipeText").innerHTML = recipe.excerpt.rendered;
      // || "<p>Picture missing</p>" sættes ind for at fortælle "eller gør dette hvis billedet ikke findes". 
      document.querySelector(".recipeImg").src = recipe.acf?.billede?.url || "<p>Picture missing</p>";
      document.querySelector(".recipeImg").alt = recipe.title.rendered;


      // Hent og vis beskrivelse af opskrift 
      const beskrivelse = recipe.acf?.infotekst || "<p>Description missing.</p>";
      document.querySelector(".recipeText").innerHTML = `
      <p>${beskrivelse}</p>`;

//Fang OpskriftInfo i HTML 
// function displayOpskriftInfo (opskriftInfo) {
// const opskriftInfo = document.querySelector(".opskriftInfo");
// container.innerHTML = "";
// }

//Indsæt tid, sværhedsgrad og portioner til de tilhørende ikoner.



      // Hent fremgangsmåde fra ACF-gruppefelt
      const fremgangsmaade =
        recipe.acf?.fremgangsmaade?.fremgangsmaade || "Instructions missing";

      // Hent ingredienser: det er en gruppe med flere felter 
      const ingrediensObjekt = recipe.acf?.ingredienser || {};
      const ingrediensListe = Object.values(ingrediensObjekt)
      // .filter er en metode som du kan bruge på elementer i et array
      // .filter((item) fjerne tomme ting f.eks null, undefined eller ""
      // .map betyder: tag hvert element i arrray og lav det om til noget nyt. Her laves det om til en li
      // .join samler alle li'er og samler det i en lang tekststreng
        .filter((item) => item) 
        .map((item) => `<li>${item}</li>`)
        .join("");

      //Her bruges samme fremgangsmåde som ovenfor
      const fremgangsmaadeObjekt = recipe.acf?.fremgangsmaade || {};
      const fremgangsListe = Object.values(fremgangsmaadeObjekt) 
        .filter((item) => item) 
        .map((item) => `<li>${item}</li>`)
        .join("");

      // Vis ingredienser
      document.querySelector(".ingrediens").innerHTML = `
        <h2> Ingredients </h2>
        <ul>${ingrediensListe}</ul>
      `;
      

      // Vis fremgangsmåde
    document.querySelector(".instructions").innerHTML = `
  <h2>Instructions</h2>
  <ol>${fremgangsListe}</ol>
`;

    })
    .catch((err) => {
      console.error("Fejl ved hentning af opskrift:", err);
      document.querySelector(".fullRecipe").innerHTML =
        "<p>The recipe could not be retrieved</p>";
    });
}
