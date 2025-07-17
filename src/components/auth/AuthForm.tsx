import { useState } from 'react'
import { supabase } from '@/blink/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Clear any existing session first
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      if (error) {
        console.error('Signup error:', error)
        let errorMessage = error.message
        
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address."
        }
        
        toast({
          title: "Signup Error",
          description: errorMessage,
          variant: "destructive"
        })
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully! You are now signed in.",
        })
        // Clear form
        setEmail('')
        setPassword('')
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during signup",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Clear any existing session first
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Signin error:', error)
        let errorMessage = error.message
        
        // Handle specific error cases
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please check your email and confirm your account before signing in."
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = "Too many sign-in attempts. Please wait a moment and try again."
        }
        
        toast({
          title: "Sign In Error",
          description: errorMessage,
          variant: "destructive"
        })
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
        // Clear form
        setEmail('')
        setPassword('')
      }
    } catch (error: any) {
      console.error('Unexpected signin error:', error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during sign in",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Notion Editor</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}