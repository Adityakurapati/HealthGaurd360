import React, { useState } from 'react';
import { User, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';

const Login=() =>
{
        const [ isPatientMode, setIsPatientMode ]=useState( false );  // Toggle between Doctor and Patient
        const [ showLoginForm, setShowLoginForm ]=useState( false );  // Show either login options or form
        const [ email, setEmail ]=useState( '' );
        const [ password, setPassword ]=useState( '' );
        const [ showPassword, setShowPassword ]=useState( false );    // Toggle password visibility
        const [ errorMessage, setErrorMessage ]=useState( '' );       // Error handling
        const navigate=useNavigate();

        const handleSubmit=async ( e ) =>
        {
                e.preventDefault();
                try
                {
                        const role=isPatientMode? 'patient':'doctor';
                        const response=await fetch( '/api/login', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify( {
                                        email,
                                        password,
                                        role,
                                } ),
                                credentials: 'include'  // Ensure cookies (session) are sent with the request
                        } );

                        const data=await response.json();
                        if ( response.ok )
                        {
                                console.log("Login successful, navigating to:", role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
                                // Navigate to dashboard based on role
                                navigate( role==='doctor'? '/doctor-dashboard':'/patient-dashboard' );
                        } else
                        {
                                setErrorMessage( data.error||'Login failed. Please try again.' );
                        }
                } catch ( error )
                {
                        setErrorMessage( 'An error occurred. Please try again.' );
                }
        };

        const selectLoginType=( isPatient ) =>
        {
                setIsPatientMode( isPatient );
                setShowLoginForm( true );  // Show login form after selecting type
        };

        const toggleMode=() =>
        {
                setIsPatientMode( !isPatientMode );  // Switch between Doctor and Patient modes within the form
                setEmail( '' );
                setPassword( '' );
                setErrorMessage( '' );
        };

        const goBack=() =>
        {
                setShowLoginForm( false );  // Go back to the initial login options
                setEmail( '' );
                setPassword( '' );
                setErrorMessage( '' );
        };

        const togglePasswordVisibility=() =>
        {
                setShowPassword( !showPassword );
        };

        return (
                <div className={ styles.container }>
                        <div className={ styles.blurBackground }></div>
                        <div className={ styles.animatedBackground }>
                                <div className={ `${ styles.shape } ${ styles.shape1 }` }></div>
                                <div className={ `${ styles.shape } ${ styles.shape2 }` }></div>
                        </div>

                        <h1 className={ styles.logo }>Health Guard360</h1>

                        { !showLoginForm? (
                                // Show initial login options
                                <div className={ styles.loginOptions }>
                                        <button onClick={ () => selectLoginType( false ) } className={ styles.loginOption }>
                                                <Stethoscope size={ 48 } className={ styles.loginOptionIcon } />
                                                <span className={ styles.loginOptionText }>Doctor Login</span>
                                        </button>
                                        <button onClick={ () => selectLoginType( true ) } className={ styles.loginOption }>
                                                <User size={ 48 } className={ styles.loginOptionIcon } />
                                                <span className={ styles.loginOptionText }>Patient Login</span>
                                        </button>
                                </div>
                        ):(
                                // Show login form after selecting Doctor/Patient
                                <div className={ `${ styles.loginContainer } ${ isPatientMode? styles.patientMode:'' }` }>
                                        <div className={ styles.contentWrapper }>
                                                <div className={ `${ styles.panel } ${ styles.leftPanel }` }>
                                                        <h2 className={ styles.loginTitle }>{ isPatientMode? 'Patient Login':'Doctor Login' }</h2>
                                                        { errorMessage&&<div className={ styles.errorMessage }>{ errorMessage }</div> }
                                                        <form onSubmit={ handleSubmit }>
                                                                <div className={ styles.inputGroup }>
                                                                        <label htmlFor="email">{ isPatientMode? 'Patient':'Doctor' } Name/Email</label>
                                                                        <input
                                                                                type="email"
                                                                                id="email"
                                                                                value={ email }
                                                                                onChange={ ( e ) => setEmail( e.target.value ) }
                                                                                required
                                                                        />
                                                                </div>
                                                                <div className={ styles.inputGroup }>
                                                                        <label htmlFor="password">Password</label>
                                                                        <div className={ styles.passwordWrapper }>
                                                                                <input
                                                                                        type={ showPassword? 'text':'password' }
                                                                                        id="password"
                                                                                        value={ password }
                                                                                        onChange={ ( e ) => setPassword( e.target.value ) }
                                                                                        required
                                                                                />
                                                                                <button
                                                                                        type="button"
                                                                                        onClick={ togglePasswordVisibility }
                                                                                        className={ styles.passwordToggle }
                                                                                        aria-label="Toggle Password Visibility"
                                                                                >
                                                                                        { showPassword? <EyeOff size={ 18 } />:<Eye size={ 18 } /> }
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                                <div className={ styles.forgotPassword }>
                                                                        <a href="#">Forgot Password?</a>
                                                                </div>
                                                                <button type="submit" className={ styles.submitButton }>Login</button>
                                                        </form>
                                                        <button onClick={ toggleMode } className={ styles.toggleButton }>
                                                                Switch to { isPatientMode? 'Doctor':'Patient' } Login
                                                        </button>
                                                        <button onClick={ goBack } className={ styles.backButton }>Back to Options</button>
                                                </div>
                                                <div className={ `${ styles.panel } ${ styles.rightPanel }` }>
                                                        {/* <div className={ styles.welcomeEmoji }>👋</div> */}
                                                        <img
                                                                src={isPatientMode ? '/img/patient.png' : '/img/pngegg.png'}
                                                                 alt={isPatientMode ? 'Patient' : 'Doctor'}
                                                                className={styles.welcomeImage}
                                                                 />
                                                        <h2 className={ styles.welcomeText }>Welcome, { isPatientMode? 'Patient':'Doctor' }!</h2>
                                                </div>
                                        </div>
                                </div>
                        ) }
                </div>
        );
};

export default Login;