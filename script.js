// ==========================================
// GYMCONTROL - SISTEMA DE GESTIÓN DE GIMNASIO
// ==========================================

const STORAGE = "gymcontrol_datos";

const DEMO_USER = {
    usuario: "steven",
    password: "112233",
    nombre: "Steven Calle"
};

function datosIniciales() {
    return {
        usuarios: [{
            id: 1,
            nombre: "Steven Calle",
            documento: "1000000001",
            telefono: "3000000000",
            correo: "steven@gymcontrol.com"
        }],
        rutinas: [],
        mensualidades: [],
        pagos: [],
        concursos: []
    };
}

let datos = cargarDatos();

function cargarDatos() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE)) || datosIniciales();
    } catch {
        return datosIniciales();
    }
}

function guardarDatos() {
    localStorage.setItem(STORAGE, JSON.stringify(datos));
}

function nuevoId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function fechaActual() {
    const fecha = new Date();
    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
}

function dinero(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, letra => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[letra]));
}

function notificar(mensaje) {
    const caja = document.getElementById("notice");

    if (caja) {
        caja.textContent = mensaje;
        caja.classList.add("visible");

        setTimeout(() => {
            caja.classList.remove("visible");
        }, 3000);
    } else {
        alert(mensaje);
    }
}

// ==========================================
// INICIO DE SESIÓN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value;

        if (
            usuario === DEMO_USER.usuario &&
            password === DEMO_USER.password
        ) {

            sessionStorage.setItem("gymcontrol_sesion", JSON.stringify({
                nombre: DEMO_USER.nombre,
                usuario: usuario
            }));

            window.location.href = "home.html";

        } else {

            document.getElementById("loginError").textContent =
                "Usuario o contraseña incorrectos.";

        }

    });

}

// ==========================================
// PANEL PRINCIPAL
// ==========================================

function iniciarAplicacion() {

    if (!document.querySelector(".app-layout")) return;

    const sesion = JSON.parse(
        sessionStorage.getItem("gymcontrol_sesion") || "null"
    );

    if (!sesion) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("currentUser").textContent = sesion.nombre;
    document.getElementById("welcomeTitle").textContent =
        "Bienvenido, " + sesion.nombre;

    document.getElementById("settingsUser").textContent = sesion.usuario;

    document.getElementById("logoutBtn").addEventListener("click", function() {
        sessionStorage.removeItem("gymcontrol_sesion");
        window.location.href = "index.html";
    });

    document.querySelectorAll("[data-view]").forEach(boton => {

        boton.addEventListener("click", function() {
            mostrarModulo(this.dataset.view);
        });

    });

    document.getElementById("addUserBtn").addEventListener("click", registrarUsuario);

    document.getElementById("usersTable").addEventListener("click", manejarUsuarios);

    document.getElementById("userSearch").addEventListener("input", function() {
        mostrarUsuarios(this.value);
    });

    document.getElementById("routineSearch").addEventListener("input", function() {
        mostrarRutinas(this.value);
    });

    document.getElementById("routineForm").addEventListener("submit", guardarRutina);

    document.getElementById("membershipForm").addEventListener("submit", guardarMensualidad);

    document.getElementById("paymentForm").addEventListener("submit", guardarPago);

    document.getElementById("contestForm").addEventListener("submit", guardarConcurso);

    document.getElementById("resetDataBtn").addEventListener("click", restaurarDatos);

    actualizarPanel();
    mostrarUsuarios();
    llenarSelectores();
    establecerFechas();

}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

// ==========================================
// NAVEGACIÓN
// ==========================================

function mostrarModulo(modulo) {

    document.querySelectorAll(".view").forEach(seccion => {
        seccion.classList.remove("active");
    });

    const destino = document.getElementById("view-" + modulo);

    if (destino) {
        destino.classList.add("active");
    }

    document.querySelectorAll(".nav-link").forEach(boton => {
        boton.classList.toggle("active", boton.dataset.view === modulo);
    });

    llenarSelectores();

    if (modulo === "users") mostrarUsuarios();
    if (modulo === "history") mostrarRutinas();
    if (modulo === "memberships") mostrarMensualidades();
    if (modulo === "payments") mostrarPagos();
    if (modulo === "contests") mostrarConcursos();
    if (modulo === "dashboard") actualizarPanel();

}

// ==========================================
// USUARIOS
// ==========================================

function registrarUsuario() {

    const nombre = prompt("Nombre completo del cliente:");
    if (nombre === null) return;

    const documento = prompt("Número de documento:");
    if (documento === null) return;

    const telefono = prompt("Número de teléfono:");
    if (telefono === null) return;

    const correo = prompt("Correo electrónico:");
    if (correo === null) return;

    if (!nombre.trim() || !documento.trim()) {
        alert("El nombre y el documento son obligatorios.");
        return;
    }

    if (datos.usuarios.some(u => u.documento === documento.trim())) {
        alert("Este documento ya está registrado.");
        return;
    }

    datos.usuarios.push({
        id: nuevoId(),
        nombre: nombre.trim(),
        documento: documento.trim(),
        telefono: telefono.trim(),
        correo: correo.trim()
    });

    guardarDatos();
    mostrarUsuarios();
    llenarSelectores();
    actualizarPanel();

    notificar("Usuario registrado correctamente.");

}

function mostrarUsuarios(busqueda = "") {

    const tabla = document.getElementById("usersTable");
    if (!tabla) return;

    const resultados = datos.usuarios.filter(u =>
        (u.nombre + u.documento + u.correo + u.telefono)
        .toLowerCase().includes(busqueda.toLowerCase())
    );

    tabla.innerHTML = resultados.map(u => `
        <tr>
            <td>${escapar(u.nombre)}</td>
            <td>${escapar(u.documento)}</td>
            <td>${escapar(u.telefono)}</td>
            <td>${escapar(u.correo)}</td>
            <td>
                <button class="action-btn" data-edit="${u.id}">Editar</button>
                <button class="action-btn delete-btn" data-delete="${u.id}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("usersEmpty").hidden = resultados.length > 0;

}

function manejarUsuarios(evento) {

    const editar = evento.target.dataset.edit;
    const eliminar = evento.target.dataset.delete;

    if (editar) {

        const usuario = datos.usuarios.find(u => u.id == editar);

        const nombre = prompt("Nombre:", usuario.nombre);
        if (nombre === null) return;

        const telefono = prompt("Teléfono:", usuario.telefono);
        if (telefono === null) return;

        const correo = prompt("Correo:", usuario.correo);
        if (correo === null) return;

        usuario.nombre = nombre.trim();
        usuario.telefono = telefono.trim();
        usuario.correo = correo.trim();

        guardarDatos();
        mostrarUsuarios();
        llenarSelectores();
        actualizarPanel();

        notificar("Usuario actualizado.");

    }

    if (eliminar) {

        if (!confirm("¿Deseas eliminar este usuario?")) return;

        datos.usuarios = datos.usuarios.filter(u => u.id != eliminar);

        guardarDatos();
        mostrarUsuarios();
        llenarSelectores();
        actualizarPanel();

        notificar("Usuario eliminado.");

    }

}

// ==========================================
// SELECTORES DE CLIENTES
// ==========================================

function llenarSelectores() {

    const campos = [
        "routineUser",
        "membershipUser",
        "paymentUser",
        "contestUser"
    ];

    campos.forEach(id => {

        const campo = document.getElementById(id);
        if (!campo) return;

        const anterior = campo.value;

        campo.innerHTML = datos.usuarios.length
            ? datos.usuarios.map(u =>
                `<option value="${u.id}">${escapar(u.nombre)}</option>`
              ).join("")
            : '<option value="">Registra primero un usuario</option>';

        campo.disabled = datos.usuarios.length === 0;

        if (datos.usuarios.some(u => u.id == anterior)) {
            campo.value = anterior;
        }

    });

}

function nombreUsuario(id) {

    const usuario = datos.usuarios.find(u => u.id == id);

    return usuario ? usuario.nombre : "Usuario eliminado";

}

// ==========================================
// RUTINAS
// ==========================================

function guardarRutina(evento) {

    evento.preventDefault();

    if (!datos.usuarios.length) {
        alert("Primero debes registrar un usuario.");
        return;
    }

    datos.rutinas.push({
        id: nuevoId(),
        usuario: document.getElementById("routineUser").value,
        nombre: document.getElementById("routineName").value,
        objetivo: document.getElementById("routineGoal").value,
        dias: document.getElementById("routineDays").value,
        descripcion: document.getElementById("routineDescription").value,
        fecha: fechaActual()
    });

    guardarDatos();

    evento.target.reset();

    actualizarPanel();
    mostrarRutinas();

    notificar("Rutina guardada correctamente.");

    mostrarModulo("history");

}

function mostrarRutinas(busqueda = "") {

    const contenedor = document.getElementById("routinesList");
    if (!contenedor) return;

    const rutinas = datos.rutinas.filter(r =>
        (r.nombre + nombreUsuario(r.usuario) + r.objetivo)
        .toLowerCase().includes(busqueda.toLowerCase())
    );

    contenedor.innerHTML = rutinas.slice().reverse().map(r => `
        <div class="record-card">
            <h3>${escapar(r.nombre)}</h3>
            <p>Cliente: ${escapar(nombreUsuario(r.usuario))}</p>
            <p>Objetivo: ${escapar(r.objetivo)}</p>
            <p>Días por semana: ${escapar(r.dias)}</p>
            <p>${escapar(r.descripcion)}</p>
            <small>Fecha: ${escapar(r.fecha)}</small>
        </div>
    `).join("");

    document.getElementById("routinesEmpty").hidden = rutinas.length > 0;

}

// ==========================================
// MENSUALIDADES
// ==========================================

function guardarMensualidad(evento) {

    evento.preventDefault();

    const inicio = document.getElementById("membershipStart").value;
    const fin = document.getElementById("membershipEnd").value;

    if (fin < inicio) {
        alert("La fecha de vencimiento no puede ser anterior al inicio.");
        return;
    }

    datos.mensualidades.push({
        id: nuevoId(),
        usuario: document.getElementById("membershipUser").value,
        valor: Number(document.getElementById("membershipAmount").value),
        inicio,
        fin
    });

    guardarDatos();

    evento.target.reset();

    establecerFechas();
    mostrarMensualidades();
    actualizarPanel();

    notificar("Mensualidad registrada correctamente.");

}

function mostrarMensualidades() {

    const tabla = document.getElementById("membershipsTable");
    if (!tabla) return;

    tabla.innerHTML = datos.mensualidades.slice().reverse().map(m => {

        const vigente = m.fin >= fechaActual();

        return `
            <tr>
                <td>${escapar(nombreUsuario(m.usuario))}</td>
                <td>${dinero(m.valor)}</td>
                <td>${escapar(m.inicio)}</td>
                <td>${escapar(m.fin)}</td>
                <td>${vigente ? "Vigente" : "Vencida"}</td>
            </tr>
        `;

    }).join("");

    document.getElementById("membershipsEmpty").hidden =
        datos.mensualidades.length > 0;

}

// ==========================================
// PAGOS
// ==========================================

function guardarPago(evento) {

    evento.preventDefault();

    datos.pagos.push({
        id: nuevoId(),
        usuario: document.getElementById("paymentUser").value,
        concepto: document.getElementById("paymentConcept").value,
        valor: Number(document.getElementById("paymentAmount").value),
        fecha: document.getElementById("paymentDate").value,
        metodo: document.getElementById("paymentMethod").value
    });

    guardarDatos();

    evento.target.reset();

    establecerFechas();
    mostrarPagos();
    actualizarPanel();

    notificar("Pago registrado correctamente.");

}

function mostrarPagos() {

    const tabla = document.getElementById("paymentsTable");
    if (!tabla) return;

    tabla.innerHTML = datos.pagos.slice().reverse().map(p => `
        <tr>
            <td>${escapar(p.fecha)}</td>
            <td>${escapar(nombreUsuario(p.usuario))}</td>
            <td>${escapar(p.concepto)}</td>
            <td>${dinero(p.valor)}</td>
            <td>${escapar(p.metodo)}</td>
        </tr>
    `).join("");

    document.getElementById("paymentsEmpty").hidden = datos.pagos.length > 0;

}

// ==========================================
// CONCURSOS
// ==========================================

function guardarConcurso(evento) {

    evento.preventDefault();

    datos.concursos.push({
        id: nuevoId(),
        usuario: document.getElementById("contestUser").value,
        nombre: document.getElementById("contestName").value,
        fecha: document.getElementById("contestDate").value,
        categoria: document.getElementById("contestCategory").value
    });

    guardarDatos();

    evento.target.reset();

    mostrarConcursos();

    notificar("Inscripción registrada correctamente.");

}

function mostrarConcursos() {

    const contenedor = document.getElementById("contestsList");
    if (!contenedor) return;

    contenedor.innerHTML = datos.concursos.slice().reverse().map(c => `
        <div class="record-card">
            <h3>${escapar(c.nombre)}</h3>
            <p>Cliente: ${escapar(nombreUsuario(c.usuario))}</p>
            <p>Fecha: ${escapar(c.fecha)}</p>
            <p>Categoría: ${escapar(c.categoria)}</p>
        </div>
    `).join("");

    document.getElementById("contestsEmpty").hidden = datos.concursos.length > 0;

}

// ==========================================
// PANEL DE INDICADORES
// ==========================================

function actualizarPanel() {

    document.getElementById("statUsers").textContent = datos.usuarios.length;

    document.getElementById("statMemberships").textContent =
        datos.mensualidades.filter(m => m.fin >= fechaActual()).length;

    document.getElementById("statPayments").textContent = datos.pagos.length;

    document.getElementById("statRoutines").textContent = datos.rutinas.length;

}

// ==========================================
// FECHAS
// ==========================================

function establecerFechas() {

    const inicio = document.getElementById("membershipStart");
    const pago = document.getElementById("paymentDate");

    if (inicio && !inicio.value) inicio.value = fechaActual();

    if (pago && !pago.value) pago.value = fechaActual();

}

// ==========================================
// RESTAURAR DATOS
// ==========================================

function restaurarDatos() {

    const confirmar = confirm(
        "¿Seguro que deseas restaurar los datos? Se eliminarán los registros guardados."
    );

    if (!confirmar) return;

    datos = datosIniciales();

    guardarDatos();

    actualizarPanel();
    mostrarUsuarios();
    mostrarRutinas();
    mostrarMensualidades();
    mostrarPagos();
    mostrarConcursos();
    llenarSelectores();

    notificar("Datos de demostración restaurados.");

}