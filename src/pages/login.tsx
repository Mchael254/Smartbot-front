
import '../styles/login.css'
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { userLogin } from '../services/auth/login';


import Spinner from '../components/spinner';
import { errorHandlingService } from '../utils/errorHandling';
import { setToken } from '../utils/token';
import { validateEmail } from '../utils/validators';
import ResponseComponent from '../components/response';
import { useSnackbar } from '../hooks/snackBar';

function Login() {

    const { open, message, severity, showSnackbar, handleClose } = useSnackbar();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getIsFormValid = () => {
        if (!email || !password) {
            showSnackbar('fill in all fields', 'error')
            return false;
        }
        if (!validateEmail(email)) {
            showSnackbar('check email', 'error');
            return false;
        }

        return true;
    }

    const clearForm = () => {
        setEmail("");
        setPassword("");
    };


    //login
    const handleLoginClick = async () => {
        if (!getIsFormValid()) {
            return
        }

        setLoading(true);
        const loginPayload = {
            email: email,
            password: password
        }
        // console.log(loginPayload);

        try {

            const loginData = await userLogin(loginPayload);
            console.log('Complete login response:', loginData);
            console.log('Login data structure:', JSON.stringify(loginData, null, 2));
            
            // Check if user data exists and log it
            if (loginData.user) {
                console.log('User data:', loginData.user);
                console.log('User role:', loginData.user.role);
            } else {
                console.log('No user object found in response');
                console.log('Available keys:', Object.keys(loginData));
            }

            showSnackbar('success', 'success');
            setToken(loginData.access_token, loginData.refresh_token)
            
            // Try different possible paths for the role
            let userRole = null;
            if (loginData.user && loginData.user.role) {
                userRole = loginData.user.role;
            } else if (loginData.role) {
                userRole = loginData.role;
            } else if (loginData.user_role) {
                userRole = loginData.user_role;
            }
            
            console.log('Extracted user role:', userRole);
            localStorage.setItem("role", userRole || 'user');

            setTimeout(() => {
                clearForm();
                if (userRole === 'admin') {
                    navigate('/admin')
                } else {
                    navigate('/')
                }

            }, 2000);

        } catch (error) {
            console.log(error);
            showSnackbar(errorHandlingService.handleError(error), "error");
            setLoading(false);
        }

    }

    return (
        <div className="flex h-[100vh] ">
            {/* Left side - Background Image */}
            <div className="w-[50%] imageSide bg-[url(/background_banner.png)] bg-cover bg-center  h-[95vh]">
             
            </div>

            {/* Right side - Login Form */}
            <div className="formSide h-[100vh] w-[50%] flex flex-col items-center justify-center p-1 bg-white border border-black">
                {/* Logo Section */}
                <div className="mb-0">
                    <img src="/icta-logo.png" alt="Logo" className="h-20" />
                </div>
                <div className="w-[60%] bg-white">
                    <h2 className="text-left text-sm text-black mb-5 ml-7 fw-bold">Sign in</h2>
                    <div className="bg-red-600 text-white p-2 rounded text-center mt-5 mb-3 text-xs" style={{ background: '#E10716', fontSize: '13px' }}>
                        Please sign in to access this platform
                    </div>
                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="E-mail address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500`}
                        />

                    </div>
                    <div className="mb-4 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 pr-10`}
                            id="password"
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </span>

                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm">

                        <div className="flex items-center">
                            <label htmlFor="remember" className="flex items-center text-black text-xs">
                                <input type="checkbox" id="remember" name="remember" className="mr-2 form-checkbox text-green-600" /> Remember Me:
                            </label>
                        </div>
                        <a href="/accounts/password/reset/" className="text-green-600 hover:underline text-xs">Forgot Password?</a>
                    </div>


                    <div className="flex items-center justify-between mt-6 space-x-4">

                        <button type="submit" className="rounded-sm w-2/5 py-3 px-4 text-white text-sm cursor-pointer"
                            style={{ backgroundColor: "#02953e" }}
                            disabled={loading}
                            onClick={handleLoginClick}> {loading ? <Spinner size={20} color="inherit" /> : "Sign In  »"}
                        </button>   <span className="text-gray-600 text-center w-1/5 p-2 text-sm">Or</span>
                        <a href="/signup" className="w-2/5 py-3 px-4 rounded-sm text-center regiter_button text-sm cursor-pointer" style={{ backgroundColor: "#e10716" }}>Register</a>
                    </div>
                    <div className="text-center mt-2 text-sm">
                        <a href="/" className="text-green-600 underline hover:text-red-600">Back to Smart Academy</a>
                    </div>

                </div>

            </div>

            <ResponseComponent
                open={open}
                handleClose={handleClose}
                message={message}
                type={
                    ["success", "error", "warning"].includes(severity)
                        ? (severity as "success" | "error" | "warning")
                        : "error"
                }
            />
        </div>


    );
}

export default Login;