
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, User, Mail, Lock, Eye, EyeOff, Moon, Sun, AtSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    province: '',
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free'
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const provinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Gilgit Baltistan',
    'Azad Kashmir'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await signUp(formData.email, formData.password, formData);
    
    if (data && !error) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all duration-300 hover:scale-105 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 p-0 hover:scale-110 transition-transform duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-3 mb-4 animate-scale-in">
            <img 
              src="/lovable-uploads/161d7edb-aa7b-4383-a8e2-75b6685fc44f.png" 
              alt="Medistics Logo" 
              className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Medistics</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-fade-in-up">Join Pakistan's premier medical learning platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                step >= num 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`w-12 h-1 transition-all duration-500 ${
                  step > num 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 animate-scale-in hover:shadow-3xl transition-all duration-500 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-gray-900 dark:text-white text-xl">
              {step === 1 && (
                <span className="flex items-center justify-center space-x-2">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Select Your Location</span>
                </span>
              )}
              {step === 2 && (
                <span className="flex items-center justify-center space-x-2">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Create Your Account</span>
                </span>
              )}
              {step === 3 && (
                <span className="flex items-center justify-center space-x-2">
                  <span>🎯</span>
                  <span>Choose Your Plan</span>
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {step === 1 && "Help us personalize your experience"}
              {step === 2 && "Enter your details to get started"}
              {step === 3 && "Select the perfect plan for your needs"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Location */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-gray-900 dark:text-white font-medium">Province</Label>
                  <Select 
                    value={formData.province} 
                    onValueChange={(value) => setFormData({...formData, province: value})}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm">
                      <SelectValue placeholder="Select your province" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700">
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province} className="text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.province && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg flex items-center space-x-2 animate-scale-in border border-purple-200 dark:border-purple-700 shadow-sm">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-purple-800 dark:text-purple-200 font-medium">
                      Selected: {formData.province}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-900 dark:text-white font-medium">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                      className="pl-10 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Only lowercase letters, numbers, and underscores allowed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 pr-10 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pl-10 pr-10 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:scale-110"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Passwords do not match</span>
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-4">
                  {/* Free Plan */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.plan === 'free' 
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20'
                    }`}
                    onClick={() => setFormData({...formData, plan: 'free'})}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Free Plan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for getting started</p>
                        <div className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PKR 0<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </div>
                      <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 hover:scale-105 transition-transform duration-200">Popular</Badge>
                    </div>
                  </div>

                  {/* Basic Plan */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.plan === 'basic' 
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20'
                    }`}
                    onClick={() => setFormData({...formData, plan: 'basic'})}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Basic Plan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">AI tests & battles included</p>
                        <div className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PKR 299<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 transition-transform duration-200 shadow-lg">Recommended</Badge>
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      formData.plan === 'premium' 
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20'
                    }`}
                    onClick={() => setFormData({...formData, plan: 'premium'})}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Premium Plan</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Full access + AI tutor</p>
                        <div className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">PKR 599<span className="text-sm font-normal text-gray-500">/month</span></div>
                      </div>
                      <Badge variant="outline" className="border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:scale-105 transition-transform duration-200">Pro</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack} 
                  className="flex-1 border-purple-300 dark:border-purple-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 hover:scale-105 transition-all duration-300" 
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={
                    (step === 1 && (!formData.province)) ||
                    (step === 2 && (!formData.name || !formData.username || !formData.email || !formData.password || formData.password !== formData.confirmPassword))
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-300 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
