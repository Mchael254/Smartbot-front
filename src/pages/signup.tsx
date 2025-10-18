
import { useState } from 'react';
import ictaLogo from '/icta-logo.png';
import '../styles/signup.css'
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../hooks/snackBar';
import ResponseComponent from '../components/response';


import Spinner from '../components/spinner';
import { registerUser } from '../services/auth/signup';
import { Eye, EyeOff } from "lucide-react";
import { errorHandlingService } from '../utils/errorHandling';
import { validateEmail } from '../utils/validators';

function Signup() {
    const [email, setEmail] = useState("");
    const [firstName, setFirstname] = useState("");
    const [lastName, setLastname] = useState("");
    const [phoneNumber, setPhonenumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { open, message, severity, showSnackbar, handleClose } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!email || !firstName || !lastName || !password || !phoneNumber || !confirmPassword) {
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
        setFirstname("");
        setLastname("");
        setPhonenumber("")
        setPassword("");
        setConfirmPassword("");
    };

    //signup
    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const registerPayload = {
            email: email,
            username: firstName,
            password: password
        }

        try {
            await registerUser(registerPayload);
            showSnackbar("Signup successful!", "error");

            showSnackbar('success', 'success');

            setTimeout(() => {
                clearForm();
                navigate('/login')

            }, 2000);

        } catch (error) {
            console.log(error);
            showSnackbar(errorHandlingService.handleError(error), "error");
            setLoading(false);
        }
    };


    return (
        <div className="flex h-[100vh] font-sans md:flex-row flex-col">
            <div className="flex-1 imageBg bg-[url(/background_banner.png)] bg-cover bg-center flex items-center justify-center h-[95vh]">
                {/* Background image is set via CSS */}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-5 bg-white">
                <div className="flex justify-center mb-0 w-[80%]">
                    <img src={ictaLogo} alt="ICTA Logo" className="max-w-[70%] h-auto" />
                </div>
                <div className="w-full max-w-sm rounded-lg bg-white">
                    <h2 className="text-left text-xl font-bold mb-5 ml-7 text-gray-800">Register</h2>
                    {/*form*/}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="E-mail address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500`}
                        />

                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstname(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500`}
                        />

                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastname(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500`}

                        />

                    </div>
                    <div className="mb-4">
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhonenumber(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500`}
                        />

                    </div>
                    <div className="mb-4 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 pr-10`}
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </span>

                    </div>
                    <div className="mb-6 relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Password (again)"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full text-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 pr-10`}
                        />
                        <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </span>

                    </div>
                    <button type="submit" className="button text-sm w-full py-1 px-2 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        style={{ backgroundColor: "#198754" }}
                        onClick={handleSignup}> {loading ? <Spinner size={20} color="inherit" /> : "Register »"}</button>

                    <div className="text-center mt-1 text-sm">
                        <p className="text-gray-700">Already have an account? <a href="/login" className="text-green-600 hover:underline">Sign in.</a></p>
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

export default Signup;