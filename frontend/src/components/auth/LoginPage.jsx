import React, { useState } from 'react';
import { Button } from '../ui/button'; //
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'; //
import { HeartPulse, Loader2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../lib/firebase'; // Corrected path to root lib

// Branding Icon for the Login Button
const GoogleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.53-4.18 7.13-10.36 7.13-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      // Triggers the Google Auth popup
      await signInWithPopup(auth, provider);
      // Success: App.jsx will detect the user via onAuthStateChanged and show the Dashboard
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
      alert("Login failed. Please check your internet connection or Firebase configuration.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background animated-bg-pan">
      <div className="relative flex h-full w-full max-w-5xl items-center justify-center p-4">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl md:grid-cols-2">
          
          {/* Left Panel: Welcome Branding */}
          <div className="relative hidden flex-col justify-between bg-primary p-12 text-white md:flex">
            <div className="relative z-10 flex items-center gap-2 font-bold text-xl">
              <HeartPulse className="h-8 w-8 text-white" />
              <span>CogniDetect</span>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Early Detection,<br/>Better Protection.</h2>
              <p className="text-blue-100 text-lg">
                Securely sign in to start your cognitive assessment and track your neurological health over time.
              </p>
            </div>

            {/* Background design elements from your globals.css */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          </div>

          {/* Right Panel: The actual Login Form */}
          <div className="flex items-center justify-center p-8 md:p-16">
            <Card className="w-full max-w-sm border-0 shadow-none">
              <CardHeader className="text-center p-0 mb-8">
                <CardTitle className="text-3xl font-black text-slate-900">Sign In</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  Access your private diagnostic dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6">
                  {/* Google Login Button */}
                  <Button 
                    className="w-full flex items-center gap-4 h-14 rounded-2xl text-md font-bold transition-all hover:scale-[1.02]" 
                    variant="outline" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <GoogleIcon className="h-6 w-6" />
                    )}
                    {isLoading ? "Connecting to Google..." : "Continue with Google"}
                  </Button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-slate-400 font-bold">Secure Access</span></div>
                  </div>

                  <p className="text-center text-xs text-slate-400 leading-relaxed">
                    By continuing, you agree to the CogniDetect Clinical Data Privacy Policy and Terms of Use.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}