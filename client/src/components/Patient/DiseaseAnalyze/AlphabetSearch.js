import React, { useState } from 'react';
import './disease.css';

const AlphabetSearch=() =>
{
        const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' );
        const [ diseases, setDiseases ]=useState( [] );

        const fetchDiseasesByLetter=( letter ) =>
        {
                fetch( `/api/diseases/${ letter }` )
                        .then( response => response.json() )
                        .then( data =>
                        {
                                if ( Array.isArray( data ) )
                                {
                                        setDiseases( data );
                                } else
                                {
                                        console.error( 'Expected an array but got:', data );
                                        setDiseases( [] ); // Reset diseases if the data is not an array
                                }
                        } )
                        .catch( error =>
                        {
                                console.error( 'Error fetching diseases:', error );
                                setDiseases( [] ); // Reset diseases in case of an error
                        } );
        };

        return (
                <section className="alphabet-search">
                    <h2>Find diseases & conditions by  </h2>
                    <h2 id='h'> first letter</h2>
                    <div className="alphabet-search-content">
                        <div className="letter-buttons">
                            {alphabet.map(letter => (
                                <button
                                    key={letter}
                                    className="letter-button"
                                    onClick={() => fetchDiseasesByLetter(letter)}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                        <div className="search-bar1">
                            <input 
                                type="text" 
                                placeholder="Search diseases & conditions"
                            />
                            <button type="submit">
                                <img src="/img/search.jpg" alt="Search" />
                            </button>
                        </div>
                    </div>
                    <ul>
                        {diseases.length === 0 ? (
                            <li>No diseases found.</li>
                        ) : (
                            diseases.map(disease => (
                                <li key={disease.id}>{disease.name}</li>
                            ))
                        )}
                    </ul>
                </section>
            );
            
};

export default AlphabetSearch;
