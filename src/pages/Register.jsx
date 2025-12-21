import { RegisterForm } from "../components/register-form.jsx"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import authServices from "@/services/auth.js";
import { saveUserProfile } from "../services/user.js";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()

  const registerUser = async function ({ email, password, username }) {

    const toastId = toast.loading("Registering User...");
    setIsLoading(true);

    try {


      const user = await authServices.registerUser({ email, password, username })

      await saveUserProfile(user)

      toast.success("Login Successful! Redirect To Dashboard...", { id: toastId });
      navigate("/dashboard")
    } catch (error) {
      console.log(error.message)
      toast.error(error.message, { id: toastId });

    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      await saveUserProfile(user)
      toast.success("Login Successful! Redirect To Dashboard...", { id: toastId });
      navigate("/dashboard")
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm onSubmit={registerUser} isLoading={isLoading} handleGoogleLogin={handleGoogleLogin} />
      </div>
    </div>
  );
};

export default Register;
