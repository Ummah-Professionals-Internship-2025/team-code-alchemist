
import "./landingPage.css";
import { useNavigate } from "react-router-dom";

import React, { useState } from 'react';


const MentorLandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="root">
      <div className="container-landing">
        <nav className="navbar">
          <ul>
            <li>
              <div className="navbar-logo" alt="logo">
                <a href="https://www.ummahprofessionals.com/">
                  <img src="https://www.ummahprofessionals.com/assets/blue-horizontal-CZMgC7yv.svg" alt="ummah-professionals-logo" />
                </a>
              </div>
            </li>
            <li className="home"><a href="https://www.ummahprofessionals.com/">home</a></li>
            <li className="about"><a href="https://www.ummahprofessionals.com/about">about</a></li>
            <li className="get-involved"><a href="https://www.ummahprofessionals.com/students">get involved</a></li>
            <li className="events"><a href="https://www.ummahprofessionals.com/events">events</a></li>
            <li className="contact-us"><a href="https://www.ummahprofessionals.com/contact">contact us</a></li>
            <li className="donate"><a href="https://www.ummahprofessionals.com/donate">donate</a></li>
          </ul>
          <h1 className="title"><strong>mentor platform</strong></h1>
          <p className="subtitle">Give personalized career advice to Muslim <br /> students and be the change to get them their first job.</p>
          <p className="if-mentee"><i>if you are a student seeking mentorship, join our mentee platform <a href="">here.</a></i></p>
          <button className="student">give career advice</button>
          <p className="login"><i>already have an account? onClick={() => navigate("/mentor-login")}</i></p>
        </nav>
      </div>
      
      <main>
        <div className="mobile-container">
          <div className="navbar-logo" alt="logo">
            <a href="https://www.ummahprofessionals.com/">
              <img src="https://www.ummahprofessionals.com/assets/white-horizontal-C2p6e4w-.svg" alt="ummah-professionals-logo" />
            </a>
          </div>
          <div className="mobile-navbar-button" onClick={toggleMobileMenu}>
            <img src="data:image/svg+xml,%3csvg%20width='39'%20height='14'%20viewBox='0%200%2039%2014'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M5.5%207H38M1.5%2013H38M11.5%201H38'%20stroke='%23E7E8ED'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e" alt="menu" />
          </div>
          <div className="mobile-textBlockContainer">
            <div className="background-header">
              <h1 className="title"><strong>mentor platform <br /></strong></h1>
            </div>
            <div className="white-to-blue">
              <p className="subtitle">Give personalized career advice to Muslim students and be the change to get them their first job.</p>
              <p className="if-mentee"><i>if you are a student seeking mentorship, join our mentee platform <a href="">here.</a></i></p>
              <button className="student">give career advice</button>
              
              <p className="login"><i>already have an account? <a href="">login here.</a></i></p>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu}></div>}
        
        <div className={`mobile-navbar-open ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="https://www.ummahprofessionals.com/">home</a></li>
            <li><a href="https://www.ummahprofessionals.com/about">about</a></li>
            <li>
              <a>get involved</a>
              <ul>
                <li><a href="https://www.ummahprofessionals.com/students">students</a></li>
                <li><a href="https://www.ummahprofessionals.com/mentors">mentors</a></li>
                <li><a href="https://www.ummahprofessionals.com/volunteers">volunteers</a></li>
              </ul>
            </li>
            <li><a href="https://www.ummahprofessionals.com/events">events</a></li>
            <li><a href="https://www.ummahprofessionals.com/contact">contact us</a></li>
            
            <button className="donate-mobile">donate</button>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default MentorLandingPage;