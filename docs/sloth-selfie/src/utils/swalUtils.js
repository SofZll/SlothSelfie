import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    showCloseButton: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const NewSwal = Swal.mixin({
    heightAuto: false,
    scrollbarPadding: false,
    showCloseButton: true,
    confirmButtonText: 'OK',
});

export const toastInfo = (title, body, link = null) => {
    const html = link
        ? `<div>${body}<br><a href="${link}" style="color: #007bff; text-decoration: underline;" target="_blank">Vai al dettaglio</a></div>`
        : body;
    
    Toast.fire({
        icon: 'info',
        title: title,
        html: html,
    });
};

export const toastWarning = (title, body, link = null) => {
    const html = link
        ? `<div>${body}<br><a href="${link}" style="color: #dc3545; text-decoration: underline;" target="_blank">Vai al dettaglio</a></div>`
        : body;

    Toast.fire({
        icon: 'warning',
        title: title,
        html: html,
    });
};