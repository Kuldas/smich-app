//
// GLOBÁLNÍ PROMNĚNÉ
//

const dataHumoreskyJson = './data/humoresky.json';
let audioFail = new Audio("./assets/sounds/fail.mp3");
let audioAddCard = new Audio('./assets/sounds/applause.mp3');
let audioLike = new Audio('./assets/sounds/laugh.mp3');
let currentAudio = null;
let canLike = true;
const jsConfetti = new JSConfetti()

// Načtení dat z LocalStorage
const importSavedData = localStorage.getItem('humoreskyData');

// Pokud nejsou data v LocalStorage k dispozici, načtou se z JSON souboru
if (!importSavedData) {
  fetch(dataHumoreskyJson)
    .then(response => {
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst JSON soubor'); // Odchycení chyby při odpovědi
      }
      return response.json();
    })
    .then(data => {
      // Uložení načtených dat do LocalStorage
      localStorage.setItem('humoreskyData', JSON.stringify(data));

      // Po uložení dat do localStorage se volá loadDataAndDisplay()
      loadDataAndDisplay();
    })
    .catch(error => {
      console.error('Nastala chyba při načítání nebo ukládání JSON souboru:', error);
    });
} else {
  // Pokud už data v LocalStorage jsou a mají správný formát, tak se zobrazí
  try {
    const savedData = JSON.parse(importSavedData);
    if (Array.isArray(savedData.humoresky)) {
      // Pokud jsou data v LocalStorage zavolá se loadDataAndDisplay()
      loadDataAndDisplay(savedData);
    } else {
      throw new Error('Data v LocalStorage nejsou ve správném formátu');
    }
  // Zachycení chyby z bloku "try"
  } catch (error) {
    console.error('Nastala chyba:', error);
  }
}

//
// FUNKCE PRO NAČTENÍ A ZOBRAZENÍ DAT Z LOCALSTORAGE
//

function loadDataAndDisplay() {
  // Načtení dat z LocalStorage
  const importSavedData = localStorage.getItem('humoreskyData');
  
  // Pokud jsou data v LocalStorage k dispozici, zobrazí se
  if (importSavedData) {
    const humoreskyData = JSON.parse(importSavedData);
    
    // Získání IDčka seznamu karet s humoreskami
    let cardsList = document.getElementById('funnyCards')

    // Vyčištění seznamu
    cardsList.innerHTML = "";
    
    // Procházení dat pomocí forEach a vypsání na stránku
    humoreskyData.humoresky.forEach((card, index) => {
      let cardHtml = `
      <article id="humoreska-${index}" class="card-body text-primary">
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
        like(card.title, index); // Předání titulku a indexu karty do funkce like
      });
    });
  } else {
    alert("Něco je špatně. Nebyly nalezeny žádná data.");
  }
}

//
// FUNKCE PRO PŘIDÁNÍ KARTY
//

function addNewCard() {
  let title = document.getElementById("titleInput").value;
	let content = document.getElementById("contentInput").value;
  let submitBtn = document.getElementById("submitNewCard");
  
  // Pokud je title nebo content prázdný, zobrazí se alert s upozorněním
	if (title === "" || content === "") {
    // vypne tlačítko, aby uživatel nemohl znovu kliknout
    submitBtn.disabled = true;
    // Spuštění Jolandy
    playFail();
    // Zobrazení alertu a Yablka
    showAlert();
    setTimeout( () => {
      submitBtn.disabled = false; // Po časové prodlevě se tlačítko opět zapne
    }, 5500); // Časový prodleva po kterou nelze kliknout na tlačítko
    return;
	} 
  // Pokud je title a content vyplněný, přidá se nová karta
  else {
    // Načtení uložených dat z LocalStorage do promněné
    let humoreskyData = JSON.parse(localStorage.getItem('humoreskyData'));
    
    // Přidání nové karty do pole dat
    humoreskyData.humoresky.push({
      title: title,
      content: content,
      likes: 0 // Přidání výchozího počtu lajků
    });
    
    // Uložení aktualizovaných dat do LocalStorage
    localStorage.setItem('humoreskyData', JSON.stringify(humoreskyData));

    // Spuštění animace, kde se vystřeli 3prdele smajlíků! :D
    jsConfetti.addConfetti({
      emojis: ['😂', '🤣', '👏', '🚀', '❤️', '🎉'],
      confettiNumber: 40,
    })

    // Zavolání funkce pro zobrazení aktualizovaných dat z LocalStorage
    loadDataAndDisplay();

    // Spuštění potlesku za přidání karty
    playAddNewCard();

    // Vyčištění vstupních polí pro případ, že uživatel chce přidat další kartu
    document.getElementById("titleInput").value = "";
    document.getElementById("contentInput").value = "";

	}
}

//
// FUNKCE PRO OLAJKOVÁNÍ HUMORESKY
//

function like(title, index) {

  // Pokud uživatel nemůže přidat like, funkce se neprovádí
  if (!canLike) {
    return;
  }

  // Nastavení proměnné canLike na false, aby uživatel musel počkat určitý čas, než bude moci kliknout znovu
  canLike = false;

  // Po uplynutí časového intervalu se proměnná canLike nastaví zpět na true
  setTimeout( () => {
    canLike = true;
  }, 1500);

  // Načtení uložených dat z LocalStorage
  let humoreskyData = JSON.parse(localStorage.getItem('humoreskyData'));
  
  // Najít humořešku podle titulu a přidat like
  humoreskyData.humoresky.forEach((card, i) => {
    if (card.title === title && i === index) {
      card.likes++; // Zvýšení počtu lajků o 1
    }
  });

  // Aktualizovat data v LocalStorage
  localStorage.setItem('humoreskyData', JSON.stringify(humoreskyData));

  // Znovu načíst a zobrazit data
  loadDataAndDisplay();

  // Spuštění animace, kde se vystřeli 3prdele smajlíků! :D
  jsConfetti.addConfetti({
    emojis: ['😂', '🤣'],
    confettiNumber: 40,
  })

  // Zasměje se společně s tebou i samotný Juan Joya Borja alias "El Risitas" R.I.P
  playLike();
}

//
// FUNKCE PRO ZOBRAZENÍ ALERTU
//
function showAlert() {
  let alertBox = document.getElementById("alertBox");

  // Odebírám animaci (pač tam tato class zůstává po vykonání) a skrytí
  alertBox.classList.remove("animate__bounceOut", "hidden");
  // Přidávám animaci z Animate.CSS
  alertBox.classList.add("animate__bounceIn")

  // Po uplinutí 5 sekund se vykonají tyto úlohy
  setTimeout(() => {
    // Odebrání animace příchodu a přidání animace odchodu aleru
    alertBox.classList.remove("animate__bounceIn");
    alertBox.classList.add("animate__bounceOut");

    // Po dokončení animace skryjeme alert přidáním třídy hidden (zaručí mi, že se animace dokončí)
    alertBox.addEventListener("animationend", function () {
      alertBox.classList.add("hidden");
    }, { once: true }); // Zajištění, aby se EventListener spustil pouze jednou
  }, 5000);
}

//
// FUNKCE PRO VYČIŠTĚNÍ LOCALSTORAGE A NAČTENÍ DUMMY DAT
//

function clearLocalStorage() {
  localStorage.removeItem('humoreskyData'); // Odstraníme data z localStorage
  window.location.reload(); // Obnovíme stránku, což vyvolá načtení a zobrazení nových dat
}

//
// FUNKCE PRO PŘEHRÁNÍ ZVUKU PO NEVYPLNĚNÍ POVINNÝCH INPUTŮ
//

function playFail() {
  // Pokud aktuálně běží nějaký zvuk, zastavím ho
  if (currentAudio !== null) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Nastavení aktuálního zvuku na fail hlášku
  currentAudio = audioFail;

  audioFail.play();
}

//
// FUNKCE PRO PŘEHRÁNÍ ZVUKU PO VYTVOŘENÍ NOVÉ KARTY
//

function playAddNewCard() {
  // Pokud aktuálně běží nějaký zvuk, zastavím ho
  if (currentAudio !== null) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Nastavíme aktuální zvuk na novou instanci
  currentAudio = audioAddCard;

  audioAddCard.play();
}

//
// FUNKCE PRO PŘEHRÁNÍ ZVUKU PO LAJKNUTÍ HUMORESKY
//

function playLike() {
  // Pokud aktuálně běží nějaký zvuk, zastavím ho
  if (currentAudio !== null) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Nastavíme aktuální zvuk na novou instanci
  currentAudio = audioLike;

  // Spustíme nový zvuk
  audioLike.play();
}