import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

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
const db = getFirestore(app);

// Função de login
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-btn');

    if(loginForm){
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
    }
   if (logoutButton) {
       logoutButton.addEventListener('click', function () {
           console.log('Botão de sair clicado.'); // Verificando se o botão está sendo clicado
           signOut(auth).then(() => {
               console.log('Usuário deslogado (dentro do then)');
               window.location.href = "../pages/login.html";
           }).catch((error) => {
               console.error('Erro ao deslogar:', error);
           });
       });
   }

    onAuthStateChanged(auth, (user) => {
      if (user) {
            console.log('Usuário está logado:', user);
          checkUserRole(user)
      } else {
          console.log('Usuário não está logado (dentro do onAuthStateChanged).');
      }
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
    // Verificação da página ativa
    const path = window.location.pathname;
    if (path.includes('logista.html')) {
        setupLogistaDashboard();
    } else if (path.includes('entregador.html')) {
        setupEntregadorDashboard();
    }
});
//Funçoes do Logista
function setupLogistaDashboard(){
    const newOrderForm = document.getElementById('new-order-form');
    const pendingList = document.getElementById('pending-list');
    const acceptedList = document.getElementById('accepted-list');
    const deliveredList = document.getElementById('delivered-list');
    const tabs = document.querySelectorAll('.tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Funcao do botao de chamar entregador
    newOrderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const clientAddress = document.getElementById('client-address').value;
        const clientComplement = document.getElementById('client-complement').value;
        
        addNewOrder(clientAddress, clientComplement);
    });
    function addNewOrder(address, complement){
        addDoc(collection(db, 'orders'), {
                address: address,
                complement: complement,
                status: 'pending',
                logistaId: auth.currentUser.uid, // Add o ID do logista que criou a ordem
                acceptedBy: null //inicialmente ninguem pegou a entrega
        })
        .then(docRef => {
                console.log('Ordem adicionada com ID:', docRef.id);
                newOrderForm.reset(); //Limpa o form
        })
        .catch(error => {
                console.error('Erro ao adicionar a ordem:', error);
        });
    }
    // Funçao de atualizar a lista de pedidos
    function updateOrderList(status, listElement){
        const q = query(collection(db, "orders"), where("logistaId", "==", auth.currentUser.uid), where("status", "==", status));
        onSnapshot(q, (querySnapshot) => {
             listElement.innerHTML = '';
                querySnapshot.forEach((doc) => {
                const order = doc.data();
                const orderItem = document.createElement('li');
                const orderInfoDiv = document.createElement('div')
                orderInfoDiv.classList.add('order-info')
                const orderAddress = document.createElement('h3')
                orderAddress.textContent = order.address;
                const orderComplement = document.createElement('p')
                orderComplement.textContent = order.complement ? "Complemento: "+ order.complement : '';
                orderInfoDiv.appendChild(orderAddress)
                orderInfoDiv.appendChild(orderComplement)
                orderItem.appendChild(orderInfoDiv)
                
               if(status === 'pending'){
                    orderItem.innerHTML =  `<div class="order-info"><h3>${order.address}</h3><p>${order.complement ? "Complemento: " + order.complement : ''}</p></div>`;
                }
                else if (status === "accepted"){
                    orderItem.innerHTML = `<div class="order-info"><h3>${order.address}</h3><p>${order.complement ? "Complemento: " + order.complement : ''}</p><p>Entregador: ${order.acceptedBy}</p></div>`
                }
                else if (status === "delivered"){
                     orderItem.innerHTML = `<div class="order-info"><h3>${order.address}</h3><p>${order.complement ? "Complemento: " + order.complement : ''}</p> <p>Entregador: ${order.acceptedBy}</p></div>`
                }
             listElement.appendChild(orderItem);
             });
        });
    }
   
    updateOrderList('pending', pendingList)
    updateOrderList('accepted', acceptedList)
    updateOrderList('delivered', deliveredList)
   //Logica das abas de pedido
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
        const tabId = this.getAttribute('data-tab');

        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        });
    });
}

// Funções do Entregador
function setupEntregadorDashboard() {
    const availableOrdersList = document.getElementById('available-orders');
    const myOrdersList = document.getElementById('my-orders');

      // Atualiza lista de entregas disponiveis
    function updateAvailableOrders(){
        const q = query(collection(db, "orders"), where("status", "==", "pending"));
        onSnapshot(q, (querySnapshot) => {
                availableOrdersList.innerHTML = '';
                querySnapshot.forEach((doc) => {
                const order = doc.data();
                const orderItem = document.createElement('li');
                const orderInfoDiv = document.createElement('div')
                orderInfoDiv.classList.add('order-info')
                const orderAddress = document.createElement('h3')
                orderAddress.textContent = order.address;
                const orderComplement = document.createElement('p')
                orderComplement.textContent = order.complement ? "Complemento: "+ order.complement : '';
                orderInfoDiv.appendChild(orderAddress)
                orderInfoDiv.appendChild(orderComplement)
                orderItem.appendChild(orderInfoDiv)

                const acceptButton = document.createElement('button');
                acceptButton.textContent = "Aceitar";
                acceptButton.classList.add('accept-btn');
                acceptButton.addEventListener('click', function() {
                    acceptDelivery(doc.id);
                });
                orderItem.appendChild(acceptButton);
                availableOrdersList.appendChild(orderItem);
                });
        });
    }
    //Atualiza minhas entregas
    function updateMyOrders(){
        const q = query(collection(db, "orders"), where("acceptedBy", "==", auth.currentUser.uid));
          onSnapshot(q, (querySnapshot) => {
                 myOrdersList.innerHTML = '';
                querySnapshot.forEach((doc) => {
                    const order = doc.data();
                    const orderItem = document.createElement('li');
                    const orderInfoDiv = document.createElement('div')
                    orderInfoDiv.classList.add('order-info')
                    const orderAddress = document.createElement('h3')
                    orderAddress.textContent = order.address;
                    const orderComplement = document.createElement('p')
                    orderComplement.textContent = order.complement ? "Complemento: "+ order.complement : '';
                    orderInfoDiv.appendChild(orderAddress)
                    orderInfoDiv.appendChild(orderComplement)
                    orderItem.appendChild(orderInfoDiv)
                    const dropButton = document.createElement('button');
                    dropButton.textContent = "Abandonar";
                    dropButton.classList.add("drop-btn");
                    dropButton.addEventListener('click', function() {
                        dropDelivery(doc.id);
                    });
                     orderItem.appendChild(dropButton);
                    myOrdersList.appendChild(orderItem);
                });
          });
    }

    updateAvailableOrders()
    updateMyOrders()

    // Funcao de aceitar entrega
    function acceptDelivery(orderId) {
        const orderRef = doc(db, 'orders', orderId);
    
        updateDoc(orderRef, {
            status: 'accepted',
            acceptedBy: auth.currentUser.uid
        })
            .then(() => {
                console.log('Entrega aceita com sucesso:', orderId);
           })
            .catch((error) => {
                console.error('Erro ao aceitar a entrega:', error);
            });
        }
        //Funcao de abandonar entrega
    function dropDelivery(orderId) {
        const orderRef = doc(db, 'orders', orderId);
    
        updateDoc(orderRef, {
            status: 'pending',
             acceptedBy: null
        })
            .then(() => {
                 console.log('Entrega abandonada com sucesso:', orderId);
            })
            .catch((error) => {
                console.error('Erro ao abandonar a entrega:', error);
            });
    }
}
