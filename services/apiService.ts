
export const logoutUser = () => {
    localStorage.removeItem('kidlingo_user_v2');
};
// Các hàm sync, login, register thật sự không cần thiết cho bản 16/12 nguyên thủy 
// vì nó chạy hoàn toàn local.
