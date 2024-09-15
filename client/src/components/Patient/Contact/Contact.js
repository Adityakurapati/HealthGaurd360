import React from 'react';
import './contact.css';

const ContactUs = () => {
    return (
        <section className="contact-section">
            <h1>Contact Us</h1>
            <div className="contact-container">
                <form className="contact-form">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" required />
                    
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required />
                    
                    <label htmlFor="subject">Subject</label>
                    <input type="text" id="subject" name="subject" required />
                    
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                    
                    <button type="submit">Send Message</button>
                </form>
                
                <div className="contact-info">
                    <h2>Get In Touch</h2>
                    <p>If you have any questions or need further information, please feel free to contact us.</p>
                    <ul>
                        <li><strong>Address:</strong> 1234 Hospital St, Health City</li>
                        <li><strong>Phone:</strong> +1 234 567 890</li>
                        <li><strong>Email:</strong> contact@hospitalfinder.com</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
