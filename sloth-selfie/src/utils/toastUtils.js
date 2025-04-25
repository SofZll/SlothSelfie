import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const toastInfo = (title, body) => {
    Toast.fire({
        icon: 'info',
        title: title,
        text: body,
    });
}