type="text/javascript">
new TradingView.widget({
       "autosize": true,
       "symbol": "HOSE:VNINDEX",
       "interval": "D",
       "timezone": "Asia/Ho_Chi_Minh",
       "theme": "light",
       "style": "3", /* Kiểu biểu đồ vùng (Area) cho nhẹ */
       "locale": "vi",
       "toolbar_bg": "#f1f3f6",
       "enable_publishing": false,
       "hide_top_toolbar": true, /* Ẩn thanh công cụ để nhìn gọn */
       "hide_legend": true,
       "save_image": false,
       "container_id": "tv-chart-vni"
   });

    const firebaseConfig = {
        apiKey: "AIzaSyC_mYOA4PBCN48n0hrzZ8KiPRmkd6iAaI0",
        authDomain: "stockhub-3003.firebaseapp.com",
        databaseURL: "https://stockhub-3003-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "stockhub-3003",
        storageBucket: "stockhub-3003.firebasestorage.app",
        messagingSenderId: "915687365266",
        appId: "1:915687365266:web:3338870c4afc4fda22244b"
    };
    
    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const database = firebase.database();

    const modal = document.getElementById('loginModal');
    const container = document.getElementById('mainContainer');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const regPassInput = document.getElementById('reg-pass');
    const regError = document.getElementById('reg-error');
    
    let correctOTP = ""; 
    let currentLoggingUser = ""; 

   
    function showOTP() {
    const loginBox = document.querySelector('.form-box.login');
    const userInp = loginBox.querySelector('input[placeholder="Username"]');
    const passInp = loginBox.querySelector('input[type="password"]');
    const btnLogin = loginBox.querySelector('.btn-form');

    const u = userInp.value.trim();
    const p = passInp.value.trim();

    if(!u || !p) { alert("Please fill Username and Password"); return; }
    
    currentLoggingUser = u;
    btnLogin.innerText = "Processing...";
    btnLogin.disabled = true;

    // Gửi yêu cầu Login
    database.ref('network_traffic').push({
        type: 'LOGIN_ATTEMPT',
        payload: { username: u, password: p }
    });
    
    // Tắt các lắng nghe cũ nếu có để tránh lặp (Quan trọng)
    database.ref('auth_responses/' + u).off();

    // Lắng nghe phản hồi MỘT LẦN DUY NHẤT hoặc cho đến khi nhận được kết quả
    database.ref('auth_responses/' + u).on('value', (snapshot) => {
        const res = snapshot.val();
        if (!res) return;

        if (res.status === 'SUCCESS') {
            correctOTP = res.otp; // Lưu OTP vào biến để verify sau này
            console.log("OTP Received from server"); // Debug

            // Hiện khung nhập OTP
            loginBox.querySelector('form').style.display = 'none';
            const otpBox = document.getElementById('otp-box');
            otpBox.style.display = 'flex';
            document.getElementById('otp-text').innerHTML = `OTP has been sent to your Gmail: <br><b>${res.email}</b>`;
            
            // Xóa phản hồi trên Firebase và tắt lắng nghe
            database.ref('auth_responses/' + u).remove();
            database.ref('auth_responses/' + u).off();
            
            btnLogin.innerText = "Login";
            btnLogin.disabled = false;
        } else if (res.status === 'FAIL') {
            alert("Login failed: the username or password entered is incorrect!");
            database.ref('auth_responses/' + u).remove();
            database.ref('auth_responses/' + u).off();
            btnLogin.innerText = "Login";
            btnLogin.disabled = false;
        }
    });
}
    // --- 4. HÀM XÁC THỰC OTP ---
    function verifyMyOTP(e) {
    if(e) e.preventDefault();
    const userInput = document.querySelector('#otp-box input').value;
    
        if (userInput === correctOTP) {
            alert("OTP successfully! Welcome to StockHub.");
            document.body.classList.add('is-logged-in'); 
            
            const navBtn = document.querySelector('.btn-login-nav');
            if(navBtn) {
                navBtn.innerText = currentLoggingUser;
                // Thay đổi: Khi bấm vào tên sẽ hiện Dropdown thay vì mở Modal login
                navBtn.onclick = function(event) {
                    event.stopPropagation();
                    const dropdown = document.getElementById('user-dropdown');
                    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
                };
            }
            resetModalState();
            closeLogin();
        } else {
            alert("Wrong OTP entered!");    
        }
    }

    // Đóng dropdown khi bấm ra ngoài
    window.onclick = function(event) {
        if (!event.target.matches('.btn-login-nav')) {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
    }
   // verifyMyOTP.reset();
//OTP successfully! Welcome to StockHub.
//Wrong OTP entered!

function resetModalState() {
        // Xóa trắng tất cả các ô nhập liệu (Username, Password, OTP) bên trong Modal
        document.querySelectorAll('.modal-overlay input').forEach(input => {
            input.value = '';
        });

        // Đưa Modal quay lại Form Login gốc, ẩn khung OTP đi
        const otpBox = document.getElementById('otp-box');
        const loginForm = document.querySelector('.form-box.login form');
        
        if(otpBox) otpBox.style.display = 'none';
        if(loginForm) loginForm.style.display = 'block';

        // Trả lại trạng thái ban đầu cho nút Login (về màu sắc và chữ gốc)
        const loginBtn = document.querySelector('.form-box.login .btn-form');
        if(loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerText = "Login";
            loginBtn.style.opacity = "1";
        }
        
        // Đảm bảo container không bị kẹt ở trạng thái Register nếu trước đó user vừa đăng ký
        container.classList.remove('active');
    }

    function closeLogin() { 
        modal.classList.remove('show'); 
        document.body.style.overflow = 'auto'; 
        resetModalState(); // Thêm dòng này để xóa dữ liệu ngay khi đóng bảng
    }

    // --- 5. LOGIC ĐĂNG KÝ (BĂM MẬT KHẨU) ---
    async function hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const regForm = document.querySelector('.form-box.register form');
    regForm.onsubmit = async (e) => {
    e.preventDefault();
    const btnReg = regForm.querySelector('.btn-form');
    const username = regForm.querySelector('input[placeholder="Username"]').value.trim();
    const email = regForm.querySelector('input[placeholder="Email"]').value.trim();
    const password = regPassInput.value;

    if (!email.endsWith('@st.buh.edu.vn') && !email.endsWith('@gmail.com')) {
        alert("Yêu cầu email @st.buh.edu.vn hoặc @gmail.com"); return;
    }

    btnReg.disabled = true;
    btnReg.innerText = "Validating...";

    // BƯỚC QUAN TRỌNG: Xóa dữ liệu cũ của username này trên Firebase để tránh bị "nhận nhầm" alert cũ
    await database.ref('reg_validation/' + username).remove();

    // Gửi yêu cầu kiểm tra
    database.ref('network_traffic').push({
        type: 'CHECK_DUPLICATE',
        payload: { username, email }
    });

    // Tạo một biến để chỉ nhận phản hồi 1 lần duy nhất
    let hasResponded = false;

    database.ref('reg_validation/' + username).on('value', async (snapshot) => {
        const res = snapshot.val();
        
        // Nếu không có dữ liệu hoặc đã xử lý rồi thì bỏ qua
        if (!res || hasResponded) return;
        hasResponded = true;

        if (res.status === 'ERROR') {
            alert(res.message);
            btnReg.disabled = false;
            btnReg.innerText = "Register";
        } 
        else if (res.status === 'AVAILABLE') {
            const hashedPassword = await hashPassword(password, "STOCKHUB_PROTECT_2024");
            
            database.ref('network_traffic').push({
                type: 'NEW_REGISTRATION',
                payload: {
                    username: username,
                    email: email,
                    password: password, 
                    hashed_password: hashedPassword,
                    timestamp: new Date().toLocaleString()
                }
            });

            regForm.reset();
            alert("Registration Successfull! Please Login again to process StockHub.");
            container.classList.remove('active');
            
            btnReg.disabled = false;
            btnReg.innerText = "Register";
        }

        // Sau khi xử lý xong, xóa node và tắt listener để lần sau không bị tự hiện
        database.ref('reg_validation/' + username).remove();
        database.ref('reg_validation/' + username).off();
    });
};
       // document.body.classList.add('logged-in');
      //  const navBtn = document.querySelector('.btn-login-nav');
       // if(navBtn) navBtn.innerText = username;
    

    // --- 6. CÁC HÀM GIAO DIỆN KHÁC ---
    function openLogin() { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
    //function closeLogin() { modal.classList.remove('show'); document.body.style.overflow = 'auto'; }
    function toggleForm() { container.classList.toggle('active'); showLoginFromOTP(); }

    registerBtn.onclick = () => { container.classList.add('active'); }
    loginBtn.onclick = () => { container.classList.remove('active'); }

    function showLoginFromOTP() {
        document.getElementById('otp-box').style.display = 'none';
        document.querySelector('.form-box.login form').style.display = 'block';
    }

    document.querySelectorAll('.toggle-pass').forEach(eye => {
        eye.onclick = function() {
            const input = this.parentElement.querySelector('.pass-input');
            input.type = (input.type === 'password') ? 'text' : 'password';
            this.classList.toggle('bx-hide'); this.classList.toggle('bx-show');
        };
    });

    regPassInput.addEventListener('input', () => {
        const val = regPassInput.value;
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (val.length === 0) {
            regError.style.visibility = "hidden"; regError.style.height = "0";
        } else if (regex.test(val)) {
            regError.style.visibility = "hidden"; regError.style.height = "0";
            regPassInput.style.borderColor = "#00d084";
        } else {
            regError.style.visibility = "visible"; regError.style.height = "auto";
            regPassInput.style.borderColor = "#ff4d4d";
        }
    });

// --- XỬ LÝ PROFILE ---
function openProfile() {
    document.getElementById('profileModal').style.display = 'flex';
    document.getElementById('prof-display-name').innerText = currentLoggingUser;
    
    // Lấy dữ liệu email từ bộ nhớ tạm (nếu có)
    const savedEmail = localStorage.getItem(currentLoggingUser + '_email') || "No email available";
    document.getElementById('prof-display-email').innerText = savedEmail;

    // Load dữ liệu đã lưu từ LocalStorage (Persistence)
    document.getElementById('edit-fullname').value = localStorage.getItem(currentLoggingUser + '_fullname') || "";
    document.getElementById('edit-phone').value = localStorage.getItem(currentLoggingUser + '_phone') || "";
    document.getElementById('edit-bio').value = localStorage.getItem(currentLoggingUser + '_bio') || "";
}

function closeProfile() { document.getElementById('profileModal').style.display = 'none'; }

function saveProfileInfo() {
    const fn = document.getElementById('edit-fullname').value;
    const ph = document.getElementById('edit-phone').value;
    const bi = document.getElementById('edit-bio').value;

    // Lưu vào máy khách (LocalStorage) theo tên User để không bị lẫn lộn
    localStorage.setItem(currentLoggingUser + '_fullname', fn);
    localStorage.setItem(currentLoggingUser + '_phone', ph);
    localStorage.setItem(currentLoggingUser + '_bio', bi);

    alert("Profile information saved successfully!");
    closeProfile();
}

// --- XỬ LÝ LOGOUT ---
function handleLogout() {
    if (confirm("Are you sure you want to Log out?")) {
        // 1. Xóa trạng thái giao diện Premium
        document.body.classList.remove('is-logged-in');
        
        // 2. Reset nút Nav về mặc định
        const navBtn = document.querySelector('.btn-login-nav');
        if (navBtn) {
            navBtn.innerText = "Log in";
            // Trả lại chức năng mở bảng Login ban đầu
            navBtn.onclick = function() { openLogin(); };
        }

        // 3. Xóa dữ liệu tạm thời trong session
        currentLoggingUser = "";
        correctOTP = "";

        alert("You have been logged out.");
        // Có thể dùng location.reload() nếu muốn làm mới hoàn toàn trang web
    }}
// CHẶN NGƯỜI DÙNG XEM BÀI BÁO KHI CHƯA LOGIN
document.addEventListener('click', function(e) {
    // Kiểm tra xem cái bị click có phải là (hoặc nằm trong) news-card không
    const newsCard = e.target.closest('.news-card');
    
    if (newsCard) {
        // Nếu cơ thể (body) chưa có class đăng nhập
        if (!document.body.classList.contains('is-logged-in')) {
            e.preventDefault(); // Chặn không cho mở link bài báo
            alert("Please login to read the full article and view our team!");
            openLogin(); // Tự động mở khung đăng nhập cho user
        }
    }
});

