import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, Plus, Lock, User, Mail, LogOut, Save, X, Sun, Moon, Shield, Sparkles } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function PasswordManager() {
  const [isDark, setIsDark] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState('login');
  const [passwords, setPasswords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const theme = localStorage.getItem('theme');
    if (theme) setIsDark(theme === 'dark');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
      fetchPasswords(token);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAuthSubmit = async () => {
    const endpoint = showAuthForm === 'login' ? '/auth/login' : '/auth/signup';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setAuthForm({ name: '', email: '', password: '' });
        showToast(showAuthForm === 'login' ? '🎉 Welcome back!' : '🎊 Account created!');
        fetchPasswords(data.token);
      } else {
        showToast(data.message || 'Authentication failed', 'error');
      }
    } catch (error) {
      showToast('Network error. Check if backend is running.', 'error');
    }
  };

  const fetchPasswords = async (token) => {
    try {
      const response = await fetch(`${API_URL}/passwords`, {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPasswords(data);
      }
    } catch (error) {
      showToast('Failed to fetch passwords', 'error');
    }
  };

  const handleAddPassword = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      
      if (response.ok) {
        const newPassword = await response.json();
        setPasswords([...passwords, newPassword]);
        setPasswordForm({ website: '', username: '', password: '', notes: '' });
        setShowAddForm(false);
        showToast('✨ Password saved securely!');
      } else {
        showToast('Failed to save password', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleUpdatePassword = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/passwords/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      
      if (response.ok) {
        const updatedPassword = await response.json();
        setPasswords(passwords.map(p => p._id === editingId ? updatedPassword : p));
        setPasswordForm({ website: '', username: '', password: '', notes: '' });
        setEditingId(null);
        showToast('✅ Password updated!');
      } else {
        showToast('Failed to update password', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleDeletePassword = async (id) => {
    if (!confirm('Delete this password?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/passwords/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setPasswords(passwords.filter(p => p._id !== id));
        showToast('🗑️ Password deleted!');
      } else {
        showToast('Failed to delete password', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('📋 Copied!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPasswords([]);
    showToast('👋 See you later!');
  };

  const startEdit = (password) => {
    setEditingId(password._id);
    setPasswordForm({
      website: password.website,
      username: password.username,
      password: password.password,
      notes: password.notes || ''
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPasswordForm({ website: '', username: '', password: '', notes: '' });
  };

  const bgClass = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
    : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50';
  
  const cardBg = isDark 
    ? 'bg-gray-800/80 backdrop-blur-xl border border-red-500/20' 
    : 'bg-white/80 backdrop-blur-xl border border-orange-200';
  
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-900/50 border-red-500/30 text-white' : 'bg-white border-orange-200 text-gray-900';
  const accentGradient = isDark 
    ? 'bg-gradient-to-r from-red-600 to-orange-600' 
    : 'bg-gradient-to-r from-orange-500 to-red-500';

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 relative overflow-hidden`}>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full ${isDark ? 'bg-red-500/10' : 'bg-orange-500/10'}`}
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-50px) rotate(180deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {toast.show && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
          } text-white font-medium animate-pulse`}>
            {toast.message}
          </div>
        )}
        
        <div className={`${cardBg} rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10`} style={{ animation: 'slideIn 0.5s ease-out' }}>
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-orange-100'} transition-all hover:scale-110`}
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full ${accentGradient}`} style={{ animation: 'glow 2s infinite' }}>
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className={`text-4xl font-black text-center ${textPrimary} mb-2 tracking-tight`}>
            VAULT<span className="text-red-500">X</span>
          </h1>
          <p className={`text-center ${textSecondary} mb-8 flex items-center justify-center gap-2`}>
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Secure Your Digital World
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </p>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowAuthForm('login')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                showAuthForm === 'login'
                  ? `${accentGradient} text-white shadow-lg`
                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setShowAuthForm('signup')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                showAuthForm === 'signup'
                  ? `${accentGradient} text-white shadow-lg`
                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
              }`}
            >
              SIGN UP
            </button>
          </div>
          
          <div className="space-y-4">
            {showAuthForm === 'signup' && (
              <div>
                <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                  FULL NAME
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-red-400' : 'text-orange-500'}`} />
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-red-400' : 'text-orange-500'}`} />
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                PASSWORD
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-red-400' : 'text-orange-500'}`} />
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  className={`w-full pl-10 pr-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              onClick={handleAuthSubmit}
              className={`w-full ${accentGradient} text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105`}
            >
              {showAuthForm === 'login' ? '🚀 ENTER VAULT' : '✨ CREATE VAULT'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isDark ? 'bg-red-500/5' : 'bg-orange-500/10'}`}
            style={{
              width: Math.random() * 150 + 100,
              height: Math.random() * 150 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-2xl z-50 ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'
        } text-white font-medium`}>
          {toast.message}
        </div>
      )}
      
      <nav className={`${cardBg} shadow-2xl sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${accentGradient}`}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className={`text-2xl font-black ${textPrimary}`}>
              VAULT<span className="text-red-500">X</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-orange-100'} transition-all hover:scale-110`}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
            </button>
            <span className={`${textSecondary} font-medium hidden md:block`}>
              👋 {currentUser?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              EXIT
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className={`text-4xl font-black ${textPrimary} mb-2`}>
              YOUR VAULT 🔐
            </h2>
            <p className={`${textSecondary} font-medium`}>
              {passwords.length} password{passwords.length !== 1 ? 's' : ''} secured
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setPasswordForm({ website: '', username: '', password: '', notes: '' });
            }}
            className={`flex items-center gap-2 px-6 py-3 ${accentGradient} text-white rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105`}
          >
            <Plus className="w-5 h-5" />
            ADD NEW
          </button>
        </div>
        
        {(showAddForm || editingId) && (
          <div className={`${cardBg} rounded-2xl shadow-2xl p-6 mb-8`} style={{ animation: 'slideIn 0.3s ease-out' }}>
            <h3 className={`text-2xl font-black ${textPrimary} mb-6`}>
              {editingId ? '✏️ EDIT PASSWORD' : '➕ ADD PASSWORD'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                    WEBSITE / SERVICE
                  </label>
                  <input
                    type="text"
                    value={passwordForm.website}
                    onChange={(e) => setPasswordForm({...passwordForm, website: e.target.value})}
                    className={`w-full px-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                    placeholder="google.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                    USERNAME / EMAIL
                  </label>
                  <input
                    type="text"
                    value={passwordForm.username}
                    onChange={(e) => setPasswordForm({...passwordForm, username: e.target.value})}
                    className={`w-full px-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                  PASSWORD
                </label>
                <input
                  type="text"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                  className={`w-full px-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-bold ${textSecondary} mb-2`}>
                  NOTES (OPTIONAL)
                </label>
                <textarea
                  value={passwordForm.notes}
                  onChange={(e) => setPasswordForm({...passwordForm, notes: e.target.value})}
                  className={`w-full px-4 py-3 border ${inputBg} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all`}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={editingId ? handleUpdatePassword : handleAddPassword}
                  className={`flex items-center gap-2 px-6 py-3 ${accentGradient} text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105`}
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'UPDATE' : 'SAVE'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    cancelEdit();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} ${textPrimary} rounded-xl font-bold hover:shadow-lg transition-all`}
                >
                  <X className="w-4 h-4" />
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passwords.length === 0 ? (
            <div className={`col-span-full text-center py-20 ${textSecondary}`}>
              <Shield className="w-24 h-24 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold">No passwords yet!</p>
              <p>Click "ADD NEW" to secure your first password</p>
            </div>
          ) : (
            passwords.map((pass, index) => (
              <div 
                key={pass._id} 
                className={`${cardBg} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105`}
                style={{ animation: `slideIn ${index * 0.1}s ease-out` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`text-xl font-black ${textPrimary} break-all`}>{pass.website}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(pass)}
                      className={`p-2 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'} rounded-lg transition-all hover:scale-110`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePassword(pass._id)}
                      className={`p-2 ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-lg transition-all hover:scale-110`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Username</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-sm ${textPrimary} flex-1 font-mono break-all`}>{pass.username}</p>
                      <button
                        onClick={() => handleCopy(pass.username)}
                        className={`p-2 ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-orange-100'} rounded-lg transition-all`}
                      >
                        <Copy className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-orange-600'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Password</label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-sm ${textPrimary} flex-1 font-mono`}>
                        {visiblePasswords[pass._id] ? pass.password : '••••••••••'}
                      </p>
                      <button
                        onClick={() => setVisiblePasswords({
                          ...visiblePasswords,
                          [pass._id]: !visiblePasswords[pass._id]
                        })}
                        className={`p-2 ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-orange-100'} rounded-lg transition-all`}
                      >
                        {visiblePasswords[pass._id] ? (
                          <EyeOff className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-orange-600'}`} />
                        ) : (
                          <Eye className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-orange-600'}`} />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(pass.password)}
                        className={`p-2 ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-orange-100'} rounded-lg transition-all`}
                      >
                        <Copy className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-orange-600'}`} />
                      </button>
                    </div>
                  </div>
                  
                  {pass.notes && (
                    <div>
                      <label className={`text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Notes</label>
                      <p className={`text-sm ${textSecondary} mt-1`}>{pass.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}