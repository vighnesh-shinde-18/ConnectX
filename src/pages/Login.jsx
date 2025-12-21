import { LoginForm } from "@/components/login-form.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import authServices from "@/services/auth.js";
import { saveUserProfile } from "../services/user.js";

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()

    const loginUser = async function ({ email, password }) {
        const toastId = toast.loading("Logining  User...");
        setIsLoading(true);

        try {

            const user = await authServices.loginUser({ email, password })

            await saveUserProfile(user)
            toast.success("Login Successful! Redirect To Chat Page...", { id: toastId });
            navigate("/chat-list")
        } catch (error) {
            console.log(error.message)
            toast.error(error.message, { id: toastId });

        } finally {
            setIsLoading(false);

        }
    }

    const handleGoogleLogin = async () => {
        const toastId = toast.loading("Logining User...");
        try {
            const user = await authServices.loginWithGoogle();
            await saveUserProfile(user)
            toast.success("Login Successful! Redirect To Dashboard...", { id: toastId });
            navigate("/dashboard")
        } catch (error) {
            console.log(error.message)
            toast.error(error.message, { id: toastId });

        }
    }
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm onSubmit={loginUser} isLoading={isLoading} handleGoogleLogin={handleGoogleLogin} />
            </div>
        </div>
    );
};

export default Login;
