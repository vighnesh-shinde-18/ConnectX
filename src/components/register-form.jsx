import { cn } from "../lib/utils.js"
import { Button } from "../components/ui/button.jsx"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card.jsx"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate } from "react-router-dom";


export function RegisterForm({
    onSubmit, isLoading,handleGoogleLogin
}) {
    const navigate = useNavigate();
    const [username,setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        onSubmit({username, email, password });
    }
    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader>
                    <CardTitle>Create An account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                <Input onChange={(e)=>setName(e.target.value)} id="name" type="text" placeholder="Your Name" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input onChange={(e)=>setEmail(e.target.value)} id="email" type="email" placeholder="m@example.com" required />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                </div>
                                <Input onChange={(e)=>setPassword(e.target.value)} id="password" placeholder="**********" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">{isLoading?"Registring.." : `Register`} </Button>
                                <Button variant="outline" type="button"   onClick={handleGoogleLogin}>
                                    Login with Google
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account?<a className="cursor-pointer" onClick={()=>navigate("/login")}>Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
