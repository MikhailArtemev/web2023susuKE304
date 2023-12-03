// script.js
document.addEventListener("DOMContentLoaded", function () {
  const state = {
    posts: [],
    users: [], // Добавляем массив для хранения данных о пользователях
  };

  loadUsers(); // Загружаем данные о пользователях
  loadPosts();

  document.getElementById("create-post-btn").addEventListener("click", function () {
    openModal();
  });

  document.querySelector(".close").addEventListener("click", function () {
    closeModal();
  });

  document.getElementById("post-form").addEventListener("submit", function (e) {
    e.preventDefault();
    submitForm();
  });

  function loadUsers() {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(response => response.json())
      .then(data => {
        state.users = data;
        displayPosts(); // Вызываем displayPosts после загрузки данных о пользователях
      })
      .catch(error => alert("Error loading users"));
  }

  function loadPosts() {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then(response => response.json())
      .then(data => {
        state.posts = data;
        displayPosts();
      })
      .catch(error => alert("Error loading posts"));
  }

  function displayPosts() {
    let container = document.getElementById("posts-container");
    container.innerHTML = "";
    
    state.posts.forEach(post => {
      let user = state.users.find(u => u.id === post.userId); // Ищем пользователя по ID
      let userName = user ? user.name : "Unknown User"; // Если пользователь не найден, используем "Unknown User"
      
      container.innerHTML += `
        <div class="post" data-post-id="${post.id}">
          <h2>${post.title}</h2>
          <p>${post.body}</p>
          <p>User: ${userName}</p>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>`;
    });
    document.querySelectorAll(".edit-btn").forEach(editBtn => {
      editBtn.addEventListener("click", function () {
        let postId = this.closest(".post").dataset.postId;
        editPost(postId);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(deleteBtn => {
      deleteBtn.addEventListener("click", function () {
        let postId = this.closest(".post").dataset.postId;
        deletePost(postId);
      });
    });
  }

  function openModal() {
    document.querySelector(".modal").style.display = "block";
    document.getElementById("post-id").value = "";
    document.getElementById("title").value = "";
    document.getElementById("body").value = "";
    document.getElementById("userId").value = "";
  }

  function closeModal() {
    document.querySelector(".modal").style.display = "none";
  }

  function submitForm() {
    let postId = document.getElementById("post-id").value;
    let title = document.getElementById("title").value;
    let body = document.getElementById("body").value;
    let userId = document.getElementById("userId").value;

    if (!title || !body || !userId) {
      alert("Please fill in all fields.");
      return;
    }

    let newPost = {
      title: title,
      body: body,
      userId: parseInt(userId),
    };

    if (postId) {
      editExistingPost(postId, newPost);
    } else {
      createNewPost(newPost);
      closeModal();
    }
  }

  function createNewPost(newPost) {
    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: 'POST',
      body: JSON.stringify(newPost),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(data => {
      newPost.id = data.id;
      state.posts.push(newPost);
      displayPosts();
    })
    .catch(error => alert("Error creating post"));
  }

  function editExistingPost(postId, updatedPost) {
    let existingPost = state.posts.find(post => post.id === parseInt(postId));
    if (existingPost) {
      updatedPost.id = existingPost.id;
      updatedPost.userId = parseInt(updatedPost.userId);
      fetch(`https://jsonplaceholder.typicode.com/posts/${updatedPost.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedPost),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      .then(response => response.json())
      .then(() => {
        Object.assign(existingPost, updatedPost);
        displayPosts();
        closeModal();
      })
      .catch(error => alert("Error editing post"));
    }
  }

  function editPost(postId) {
    let post = state.posts.find(p => p.id === parseInt(postId));
    if (post) {
      document.getElementById("post-id").value = postId;
      document.getElementById("title").value = post.title;
      document.getElementById("body").value = post.body;
      document.getElementById("userId").value = post.userId;
      openModal();
      edit(postId);
    }
  }

  function deletePost(postId) {
    let confirmed = confirm("Are you sure you want to delete this post?");
    if (confirmed) {
      let post = state.posts.find(p => p.id === parseInt(postId));
      if (post && post.id) {
        deletePostFromServer(post.id)
          .then(() => {
            deletePostLocally(postId);
            displayPosts();
          })
          .catch(error => alert("Error deleting post"));
      } else {
        deletePostLocally(postId);
        displayPosts();
      }
    }
  }

  function deletePostLocally(postId) {
    state.posts = state.posts.filter(post => post.id !== parseInt(postId));
  }
  
  function edit(postId) {
    deletePostFromServer(postId) // Удаляем пост с сервера
      .then(() => {
        deletePostLocally(postId); // Удаляем пост из локального состояния
        displayPosts();
      })
      .catch(error => alert("Error deleting post"));
  }


  async function deletePostFromServer(postId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: 'DELETE',
    });
    return response.json();
  }
});
