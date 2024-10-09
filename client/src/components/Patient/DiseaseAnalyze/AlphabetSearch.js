import React, { useState, useEffect } from 'react';
import './disease.css';
import diseasesData from './diseases.json'; // Importing the local JSON file

const AlphabetSearch = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const [filteredDiseases, setFilteredDiseases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Initially, display all diseases grouped under "A"
        setFilteredDiseases(diseasesData["A"] || []);
    }, []);

    // Fetch diseases by the first letter (keys of the object)
    const fetchDiseasesByLetter = (letter) => {
        setSearchTerm('');  // Clear the search term when a letter is selected
        setFilteredDiseases(diseasesData[letter] || []);
    };

    // Handle search input to filter across all letters
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = Object.keys(diseasesData).reduce((acc, key) => {
            const matchingDiseases = diseasesData[key].filter(disease =>
                disease.name.toLowerCase().includes(term)
            );
            return acc.concat(matchingDiseases);
        }, []);
        
        setFilteredDiseases(filtered);
    };

    return (
        <section className="alphabet-search">
            <h2>Find diseases & conditions by</h2>
            <h2 id="h">first letter</h2>
            <div className="alphabet-search-content">
                <div className="letter-buttons">
                    {alphabet.map((letter) => (
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
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <button type="submit">
                        <img src="/img/search.jpg" alt="Search" />
                    </button>
                </div>
            </div>
            <div className="disease-list-container">
                <ul className="disease-list">
                    {filteredDiseases.length === 0 ? (
                        <li>No diseases found.</li>
                    ) : (
                        filteredDiseases.map((disease, index) => (
                            <li key={index} className="disease-item">
                                <h3>{disease.name}</h3>
                                <p><strong>Description:</strong> {disease.description}</p>
                                <p><strong>Cause:</strong> {disease.cause}</p>
                                <p><strong>Precaution:</strong> {disease.precaution}</p>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    );
};

export default AlphabetSearch;
