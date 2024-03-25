// Definice cesty k JSON souboru
const humoreskyDataJson = './data/humoresky.json';
let currentAudio = null;

// Načtení posledního data změny JSON souboru
fetch(humoreskyDataJson, { method: 'HEAD' })
  .then(response => {
    const lastModified = response.headers.get('last-modified');
    return lastModified;
  })
  .then(lastModified => {
    // Porovnání s uloženým datem v LocalStorage
    const savedLastModified = localStorage.getItem('lastModified');

    if (lastModified !== savedLastModified) {
      // Pokud se data v JSON souboru změnila, načtou se a uloží do LocalStorage
      fetch(humoreskyDataJson)
        .then(response => {
          if (!response.ok) {
            throw new Error('Nepodařilo se načíst JSON soubor');
          }
          return response.json();
        })
        .then(data => {
          // Uložení načtených dat do LocalStorage
          localStorage.setItem('humoreskyData', JSON.stringify(data));
          localStorage.setItem('lastModified', lastModified);

          loadDataAndDisplay();
        })
        .catch(error => {
          console.error('Nastala chyba při načítání JSON souboru:', error);
        });
    } else {
      // Pokud se data v JSON souboru nezměnila, zobrazí se data z LocalStorage
      loadDataAndDisplay();
    }
  })
  .catch(error => {
    console.error('Nastala chyba při načítání posledního data změny:', error);
  });

// Funkce pro načtení a zobrazení dat z LocalStorage
function loadDataAndDisplay() {
  // Načtení dat z LocalStorage
  const importSavedData = localStorage.getItem('humoreskyData');

  // Pokud jsou data v LocalStorage k dispozici, zobrazí se
  if (importSavedData) {
      const humoreskyData = JSON.parse(importSavedData);

      // Promněná s ID seznamu karet s humoreskami
      let cardsList = document.getElementById('funnyCards')
      cardsList.innerHTML = "";

      // Procházení dat pomocí metody forEach a vypisování na stránku
      humoreskyData.forEach((card, index) => {
          let cardHtml = `
              <article class="card-body text-primary">
                  <h2 class="card-title"> ${card.title} </h2>
                  <p> ${card.content} </p>
                  <div class="card-actions justify-center items-center mt-4">
                      <button class="likeBtn bg-base-100 hover:bg-primary border-primary/50 border px-3 py-2 rounded-full">
                          🤣
                      </button>
                      <span class="badge badge-primary"> ${card.likes} </span>
                  </div>
              </article>
          `;
          let listItem = document.createElement('li');

          listItem.classList.add("card", "bg-base-300"); // Přidání CSS tříd pro animaci
          listItem.innerHTML = cardHtml;
          cardsList.appendChild(listItem);

          // Přidání event listeneru na tlačítko pro každou kartu
          let likeBtn = listItem.querySelector('.likeBtn');
          likeBtn.addEventListener('click', function() {
            like(card.title, index); // Předání titulu karty do funkce like
          });
      });
  } else {
    alert("Něco je špatně. Nebyly nalezeny žádná data.");
  }
}

function addNewCard() {
	let title = document.getElementById("titleInput").value;
	let content = document.getElementById("contentInput").value;

  // Pokud je title nebo content prázdný, zobrazí se alert s upozorněním
	if (title === "" || content === "") {
    playFail();
    setTimeout(function() {
      alert('Nadpis a humoreska musí být vyplněny, protože jinak se není čemu smát! 🤣');
    }, 100); // Časový prodleva v milisekundách před zobrazením alertu
    return;
	} 
  // Pokud je title a content vyplněný, přidá se nová karta
  else {
    // Načtení uložených dat z LocalStorage
    let humoreskyData = JSON.parse(localStorage.getItem('humoreskyData'));

    // Přidání nové karty do pole dat
    humoreskyData.push({
        title: title,
        content: content,
        likes: 0 // Přidání výchozího počtu lajků
    });

    // Uložení aktualizovaných dat do LocalStorage
    localStorage.setItem('humoreskyData', JSON.stringify(humoreskyData));

    // Zavolání funkce pro zobrazení aktualizovaných dat z LocalStorage
    loadDataAndDisplay();

    // Vyčištění vstupních polí pro případ, že uživatel chce přidat další kartu
    document.getElementById("titleInput").value = "";
    document.getElementById("contentInput").value = "";

    playAddNewCard();
	}
}

// Funkce pro přidání like k dané humořešce
function like(title, index) {

  // Načtení uložených dat z LocalStorage
  let humoreskyData = JSON.parse(localStorage.getItem('humoreskyData'));
  
  // Najít humořešku podle titulu a přidat like
  humoreskyData.forEach((card,i) => {
    if (card.title === title && i === index) {
      card.likes++; // Zvýšení počtu lajků o 1
    }
  });

  // Aktualizovat data v LocalStorage
  localStorage.setItem('humoreskyData', JSON.stringify(humoreskyData));

  // Znovu načíst a zobrazit data
  loadDataAndDisplay();
  playLike();
}

// Funkce pro přehrání zvuku po nevyplnění potřebných inputů
function playFail() {

  let audio = new Audio("./assets/sounds/fail.mp3");

  audio.play();
}

// Funkce pro přehrání zvuku po přídání nové karty
function playAddNewCard() {

  let audio = new Audio('./assets/sounds/applause.mp3');

  audio.play();

}

// Funkce pro přehrání zvuku po kliknutí na Like
function playLike() {
  // Pokud aktuálně běží nějaký zvuk, zastavíme ho
  if (currentAudio !== null) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  // Vytvoříme novou instanci objektu Audio pro přehrávání zvuku
  let audio = new Audio('./assets/sounds/laugh.mp3');
  
  // Nastavíme aktuální zvuk na novou instanci
  currentAudio = audio;

  // Spustíme nový zvuk
  audio.play();

}