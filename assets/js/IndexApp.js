// Endpoints
const domain = "https://www.menneskevaerk.com/";
const postsEndpoint = "wp-json/wp/v2/posts/";
const getRealImageUrls = "?acf_format=standard";


// DOM hooks
const resultEl = document.querySelector(".result");

//Relevante ID'er
const longTimeId = 10;
const mediumTimeId = 9;
const shortTimeId = 8;


fetchAllRecipes();

function fetchAllRecipes () {
    fetch (domain + postsEndpoint + getRealImageUrls)
    .then (res => res.json())
    .then (data => renderRecipes(data))
    .catch (err => console.log(err));
}

// Der kan også laves et fetch efter Id. 

function fetchRecipeById(id) {
    fetch(domain + postsEndpoint + "/" + id)
        .then(res => res.json())
        .then(data => renderRecipes(data))
        .catch(err => console.log(err))
}
 
 
function renderRecipes(data) {
    if (Array.isArray(data)) {
        data.forEach(recipe => {
            console.log('recipe:', recipe)
            resultEl.innerHTML += `
            <article>
                <h2>${recipe.title.rendered}</h2>
                ${recipe.content.rendered}
            </article>
            `;
        })
    } else {
        resultEl.innerHTML += `
            <article>
                <h2>${data.title.rendered}</h2>
                ${data.content.rendered}
            </article>`
    }
}

function renderRecipes (data){
data.forEach(recipe => {
    resultEl.innerHTML += `
    <article>
        <h2>${recipe.title.rendered}</h2>
        ${recipe.content.rendered}
      </article>`;
})};

