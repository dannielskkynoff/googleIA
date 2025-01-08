import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyDnoIVUjxoZKcnuDYf3WXURKL_grjJm9fU",
    authDomain: "forms-a497d.firebaseapp.com",
    projectId: "forms-a497d",
    storageBucket: "forms-a497d.firebasestorage.app",
    messagingSenderId: "409919251404",
    appId: "1:409919251404:web:4caa8d430fbc29e584f369"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//Funçao de login
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
  
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Usuário logado:", user);
              //Verifica se o usuário é um logista ou entregador e redireciona
                checkUserRole(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessageText = error.message;
                console.error("Erro ao logar:", errorCode, errorMessageText);
                errorMessage.textContent = 'Credenciais inválidas. Tente novamente.';
            });
    });
    function checkUserRole(user) {
        if (user.email.includes("logista")) {
          window.location.href = "../pages/logista.html";
        } else if (user.email.includes("entregador")) {
            window.location.href = "../pages/entregador.html";
        }else{
          errorMessage.textContent = "Usuário inválido, utilize um email de entregador ou logista."
        }
        }
  });
