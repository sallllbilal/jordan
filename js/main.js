const API = "http://localhost:3000/goods";

const inpName = document.querySelector("#inpName");
const inpDesc = document.querySelector("#inpDesc");
const inpPrice = document.querySelector("#inpPrice");
const inpImage = document.querySelector("#inpImage");
const btnAdd = document.querySelector("#btnAdd");
const btnOpenForm = document.querySelector("#btnOpenForm");
const section = document.querySelector("#section");
const modal = document.querySelector("#modal");
const modalClose = document.querySelector(".close");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const inpSearch = document.querySelector("#inpSearch");

let searchValue = "";
let currentPage = 1;
let countPage = 1;

btnOpenForm.addEventListener("click", () => {
  modal.style.display = "block";
});

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
  clearForm();
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    clearForm();
  }
});

btnAdd.addEventListener("click", () => {
  if (
    !inpName.value.trim() ||
    !inpDesc.value.trim() ||
    !inpPrice.value.trim() ||
    !inpImage.value.trim()
  ) {
    return alert("Заполните все поля!");
  }

  const newProduct = {
    title: inpName.value,
    description: inpDesc.value,
    image: inpImage.value,
    price: inpPrice.value,
  };

  createItem(newProduct);
  modal.style.display = "none";
  clearForm();
  renderGoods();
});

async function createItem(product) {
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(product),
  });
}

async function renderGoods() {
  let res;
  if (searchValue) {
    res = await fetch(
      `${API}?title=${searchValue}&_page=${currentPage}&_limit=6`
    );
  } else {
    res = await fetch(`${API}?_page=${currentPage}&_limit=6`);
  }

  const data = await res.json();

  section.innerHTML = "";
  data.forEach(({ price, title, description, image, id }) => {
    section.innerHTML += `
      <div class="card">
        <img src="${image}" alt="${title}" />
        <h3>${title}</h3>
        <p>${description}</p>
        <p>Цена: $${price}</p>
        <button class="btn btn-delete" data-id="${id}">Удалить</button>
        <button class="btn btn-edit" data-id="${id}">Изменить</button>
      </div>
    `;
  });

  const btnDeleteList = document.querySelectorAll(".btn-delete");
  btnDeleteList.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const productId = event.target.getAttribute("data-id");
      await deleteItem(productId);
      await fetchItems();
      renderGoods();
    });
  });

  const btnEditList = document.querySelectorAll(".btn-edit");
  btnEditList.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const productId = event.target.getAttribute("data-id");
      editItem(productId);
    });
  });

  pageFunc();
}

// 1111
// ... (ваш существующий JS код) ...

const jordanImages = document.querySelectorAll(".jordan-images img");
let currentJordanImageIndex = 0;

function changeJordanImage() {
  jordanImages.forEach((image) => {
    image.style.opacity = 0;
  });

  currentJordanImageIndex = (currentJordanImageIndex + 1) % jordanImages.length;
  jordanImages[currentJordanImageIndex].style.opacity = 1;
}

setInterval(changeJordanImage, 1000);

// ... (ваш существующий JS код) ...

async function deleteItem(productId) {
  try {
    await fetch(`${API}/${productId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

async function editItem(productId) {
  try {
    const response = await fetch(`${API}/${productId}`);
    const item = await response.json();

    inpName.value = item.title;
    inpDesc.value = item.description;
    inpImage.value = item.image;
    inpPrice.value = item.price;

    modal.style.display = "block";

    // Удаление предыдущей кнопки "Сохранить", если она существует
    const prevSaveBtn = document.querySelector("#btnSave");
    if (prevSaveBtn) {
      prevSaveBtn.remove();
    }

    btnAdd.style.display = "none";

    const btnSave = document.createElement("button");
    btnSave.innerText = "Сохранить";
    btnSave.id = "btnSave";
    btnSave.addEventListener("click", async () => {
      const editedProduct = {
        title: inpName.value,
        description: inpDesc.value,
        image: inpImage.value,
        price: inpPrice.value,
      };

      await updateItem(productId, editedProduct);
      modal.style.display = "none";
      btnAdd.style.display = "block";
      await fetchItems();
      renderGoods();
    });

    modal.querySelector(".modal-content").appendChild(btnSave);
  } catch (error) {
    console.error("Error editing item:", error);
  }
}

async function updateItem(productId, product) {
  try {
    await fetch(`${API}/${productId}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(product),
    });
  } catch (error) {
    console.error("Error updating item:", error);
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderGoods();
});

nextBtn.addEventListener("click", () => {
  if (currentPage >= countPage) return;
  currentPage++;
  renderGoods();
});

inpSearch.addEventListener("input", ({ target: { value } }) => {
  searchValue = value;
  currentPage = 1;
  renderGoods();
});

async function pageFunc() {
  const res = await fetch(API);
  const data = await res.json();

  countPage = Math.ceil(data.length / 6);
  if (currentPage === countPage) {
    nextBtn.classList.add("disabled");
  } else {
    nextBtn.classList.remove("disabled");
  }

  if (currentPage === 1) {
    prevBtn.classList.add("disabled");
  } else {
    prevBtn.classList.remove("disabled");
  }
}

async function fetchItems() {
  try {
    const response = await fetch(API);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

function clearForm() {
  inpName.value = "";
  inpDesc.value = "";
  inpImage.value = "";
  inpPrice.value = "";
}

renderGoods();
