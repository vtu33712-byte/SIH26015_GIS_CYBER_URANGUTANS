import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

export type UserRole = 'public' | 'government'
export type GovernmentRole = 'administrator' | 'district_officer' | 'field_officer'
type AuthState = { authenticated: boolean; role: UserRole | null; governmentRole: GovernmentRole | null }
type AuthContextValue = AuthState & { login: (role: UserRole, governmentRole?: GovernmentRole) => void; logout: () => void }
const storageKey = 'jal-impact-auth'
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '') } catch { return { authenticated: false, role: null, governmentRole: null } }
  })
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(state)) }, [state])
  const login = (role: UserRole, governmentRole: GovernmentRole = 'district_officer') => setState({ authenticated: true, role, governmentRole: role === 'government' ? governmentRole : null })
  const logout = () => setState({ authenticated: false, role: null, governmentRole: null })
  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be inside AuthProvider'); return value }
