import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth, useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import SignInPage from '@/app/(auth)/sign-in/page'
import SignUpPage from '@/app/(auth)/signup/page'

jest.mock('@clerk/nextjs')
jest.mock('next/navigation')

describe('Authentication', () => {
  const mockPush = jest.fn()
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()
  const mockSetActive = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useAuth as jest.Mock).mockReturnValue({ isSignedIn: false })
    ;(useSignIn as jest.Mock).mockReturnValue({
      signIn: { create: mockSignIn, authenticateWithRedirect: jest.fn() },
      setActive: mockSetActive,
    })
    ;(useSignUp as jest.Mock).mockReturnValue({
      signUp: {
        create: mockSignUp,
        prepareEmailAddressVerification: jest.fn(),
        attemptEmailAddressVerification: jest.fn(),
        authenticateWithRedirect: jest.fn(),
      },
      setActive: mockSetActive,
    })
  })

  describe('Sign In Page', () => {
    it('renders sign in form', () => {
      render(<SignInPage />)
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('handles form submission', async () => {
      mockSignIn.mockResolvedValueOnce({ status: 'complete', createdSessionId: '123' })
      render(<SignInPage />)
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByText('Sign In'))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123',
        })
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('redirects if already signed in', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ isSignedIn: true })
      render(<SignInPage />)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Sign Up Page', () => {
    it('renders sign up form', () => {
      render(<SignUpPage />)
      expect(screen.getByText('Join Napoleon AI')).toBeInTheDocument()
      expect(screen.getByLabelText('First name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last name')).toBeInTheDocument()
      expect(screen.getByLabelText('Work email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('handles form submission', async () => {
      render(<SignUpPage />)
      
      fireEvent.change(screen.getByLabelText('First name'), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText('Last name'), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText('Work email'), {
        target: { value: 'john@company.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'SecurePass123!' },
      })
      fireEvent.click(screen.getByText('Create Account'))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          emailAddress: 'john@company.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
      })
    })

    it('redirects to onboarding if already signed in', () => {
      ;(useAuth as jest.Mock).mockReturnValue({ isSignedIn: true })
      render(<SignUpPage />)
      expect(mockPush).toHaveBeenCalledWith('/onboarding')
    })
  })
})