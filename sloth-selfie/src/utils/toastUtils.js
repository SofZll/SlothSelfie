import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

const Toast = Swal.mixin({
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

export const toastInfo = (title, body) => {
    Toast.fire({
        icon: 'info',
        title: title,
        text: body, //TODO: da cambiare in futuro con il link dellevento e dellattivita
        html: `${body} <a href="http://localhost:3000/notifications" style="color: #3085d6; text-decoration: underline;">View Notifications</a>`,
    });
}