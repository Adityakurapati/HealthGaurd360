import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import styles from './styles.module.css';

const Disease=() =>
{
        const [ searchTerm, setSearchTerm ]=useState( '' );
        const [ selectedSymptoms, setSelectedSymptoms ]=useState( new Set() );
        const [ prediction, setPrediction ]=useState( null );
        const [ isLoading, setIsLoading ]=useState( false );
        const [ error, setError ]=useState( null );

        const symptomsDict={
                'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3,
                'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8,
                'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12,
                'spotting_urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16,
                'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20,
                'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24,
                'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28,
                'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32,
                'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36,
                'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40,
                'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44
        };

        const handleSymptomToggle=( symptom ) =>
        {
                const newSymptoms=new Set( selectedSymptoms );
                if ( newSymptoms.has( symptom ) )
                {
                        newSymptoms.delete( symptom );
                } else
                {
                        newSymptoms.add( symptom );
                }
                setSelectedSymptoms( newSymptoms );
                if ( newSymptoms.size>0 )
                {
                        getPrediction( Array.from( newSymptoms ) );
                } else
                {
                        setPrediction( null );
                }
        };

        // Helper function to safely parse stringified arrays
        const safelyParseArray=( data ) =>
        {
                if ( Array.isArray( data ) )
                {
                        // If it's already an array, process each item
                        return data.flatMap( item =>
                        {
                                try
                                {
                                        // Check if the item looks like a stringified array
                                        if ( typeof item==='string'&&item.startsWith( '[' )&&item.endsWith( ']' ) )
                                        {
                                                const parsed=JSON.parse( item );
                                                return Array.isArray( parsed )? parsed:[ item ];
                                        }
                                        return [ item ];
                                } catch ( e )
                                {
                                        return [ item ];
                                }
                        } );
                }
                return [];
        };

        const getPrediction=async ( symptoms ) =>
        {
                setIsLoading( true );
                console.log( "Started Predictions" );
                setError( null );
                try
                {
                        const response=await fetch( '/predict', {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                body: JSON.stringify( { symptoms } ),
                        } );

                        console.log( "Response status:", response );

                        if ( !response.ok )
                        {
                                throw new Error( 'Prediction failed' );
                        }

                        // Only read the response body once
                        const data=await response.json();
                        console.log( "Parsed data:", data );

                        // Process the data - the API already returns JSON, no need to parse again
                        const predictionData={
                                ...data,
                                details: {
                                        ...data.details,
                                        // Process arrays correctly using our helper function
                                        diets: safelyParseArray( data.details.diets ),
                                        medications: safelyParseArray( data.details.medications ),
                                        precautions: Array.isArray( data.details.precautions )? data.details.precautions:[],
                                        workouts: Array.isArray( data.details.workouts )? data.details.workouts:[],
                                },
                        };
                        setPrediction( predictionData );
                } catch ( err )
                {
                        setError( 'Failed to get prediction. Please try again.' );
                        console.error( "Error fetching prediction:", err );
                } finally
                {
                        setIsLoading( false );
                }
        };

        const clearAll=() =>
        {
                setSelectedSymptoms( new Set() );
                setPrediction( null );
                setSearchTerm( '' );
        };

        const filteredSymptoms=Object.keys( symptomsDict ).filter( symptom =>
                symptom.toLowerCase().replace( /_/g, ' ' ).includes( searchTerm.toLowerCase() )
        );

        return (
                <div className={ styles.container }>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className={ `${ styles.header } ${ styles.animateFadeIn }` }>
                                        <h1 className={ styles.headerTitle }>
                                                HEALTH GUARD360
                                        </h1>
                                        <p className={ styles.headerText }>
                                                Select your symptoms for an AI-powered disease prediction
                                        </p>
                                </div>

                                <div className={ styles.card }>
                                        <div className={ styles.cardHeader }>
                                                <h2 className={ styles.cardTitle }>Symptoms Selection</h2>
                                                <button
                                                        onClick={ clearAll }
                                                        className={ styles.clearButton }
                                                >
                                                        Clear All
                                                </button>
                                        </div>

                                        <div className={ styles.searchContainer }>
                                                <Search className={ styles.searchIcon } size={ 20 } />
                                                <input
                                                        type="text"
                                                        value={ searchTerm }
                                                        onChange={ ( e ) => setSearchTerm( e.target.value ) }
                                                        placeholder="Search symptoms..."
                                                        className={ styles.searchInput }
                                                />
                                        </div>

                                        {/* Fixed height container with scrolling */ }
                                        <div className={ `${ styles.symptomsContainer } ${ styles.customScrollbar }` }>
                                                <div className={ styles.symptomsGrid }>
                                                        { filteredSymptoms.map( ( symptom ) => (
                                                                <div key={ symptom } className={ styles.symptomItem }>
                                                                        <input
                                                                                type="checkbox"
                                                                                id={ symptom }
                                                                                checked={ selectedSymptoms.has( symptom ) }
                                                                                onChange={ () => handleSymptomToggle( symptom ) }
                                                                                className={ styles.symptomInput }
                                                                        />
                                                                        <label
                                                                                htmlFor={ symptom }
                                                                                className={ `${ styles.symptomLabel } ${ selectedSymptoms.has( symptom )
                                                                                        ? styles.symptomLabelSelected
                                                                                        :styles.symptomLabelUnselected
                                                                                        }` }
                                                                        >
                                                                                { symptom.replace( /_/g, ' ' ) }
                                                                        </label>
                                                                </div>
                                                        ) ) }
                                                </div>
                                        </div>
                                </div>

                                { isLoading&&(
                                        <div className={ styles.loadingSpinner }>
                                                <div className={ styles.spinner }></div>
                                        </div>
                                ) }

                                { error&&(
                                        <div className={ styles.errorContainer }>
                                                <div className={ styles.errorContent }>
                                                        <div className={ styles.errorIconContainer }>
                                                                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                        </div>
                                                        <div className={ styles.errorText }>
                                                                <p>{ error }</p>
                                                        </div>
                                                </div>
                                        </div>
                                ) }

                                { prediction&&(
                                        <div className={ styles.predictionContainer }>
                                                <div className={ `${ styles.card } ${ styles.animateFadeIn }` }>
                                                        <h2 className={ styles.sectionTitle }>
                                                                Predicted Disease
                                                        </h2>
                                                        <p className={ styles.diseaseName }>{ prediction.predicted_disease }</p>
                                                </div>

                                                <div className={ `${ styles.card } ${ styles.animateFadeIn }` }>
                                                        <h2 className={ styles.sectionTitle }>
                                                                Description
                                                        </h2>
                                                        <p className={ styles.descriptionText }>{ prediction.details.description }</p>
                                                </div>

                                                { [ 'precautions', 'medications', 'diets', 'workouts' ].map( ( section, sectionIndex ) => (
                                                        <div
                                                                key={ section }
                                                                className={ `${ styles.card } ${ styles.animateFadeIn }` }
                                                                style={ { animationDelay: `${ sectionIndex*150 }ms` } }
                                                        >
                                                                <h2 className={ styles.sectionTitle }>
                                                                        { section.charAt( 0 ).toUpperCase()+section.slice( 1 ) }
                                                                </h2>
                                                                <ul className={ styles.itemsList }>
                                                                        { prediction.details[ section ].map( ( item, index ) => (
                                                                                <li key={ index } className={ styles.listItem }>
                                                                                        <span className={ styles.listItemDot }></span>
                                                                                        <p className={ styles.listItemText }>{ item }</p>
                                                                                </li>
                                                                        ) ) }
                                                                </ul>
                                                        </div>
                                                ) ) }
                                        </div>
                                ) }
                        </div>
                </div>
        );
};

export default Disease;